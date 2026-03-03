"""
ml_factory/disease/train.py — Rythu Mitra Disease Detection Training
=====================================================================
CPU-optimized ResNet18 fine-tuning on PlantVillage dataset.

System constraints: 8GB RAM, CPU only, Windows
  - batch_size=16, num_workers=0, pin_memory=False
  - image_size=224
  - Max epochs=15 (5 Phase A + 10 Phase B)

Accept gate: test_acc ≥ 80%

Usage:
    python manage.py train_kaggle_models --model disease
    (Takes 2-4 hours on CPU)
"""

import os
import gc
import json
import logging
import numpy as np
from datetime import datetime, timezone
from collections import Counter

logger = logging.getLogger(__name__)

np.random.seed(42)


def _get_paths():
    from django.conf import settings
    base = settings.BASE_DIR
    return {
        "models_dir":  os.path.join(base, "ai", "models"),
        "datasets_dir": os.path.join(base, "ai", "datasets", "PlantVillage"),
        "metrics_dir":  os.path.join(base, "ml_factory", "disease"),
    }


def _check_ram(min_gb: float = 2.0):
    try:
        import psutil
        avail = psutil.virtual_memory().available / 1e9
        logger.info(f"[DiseaseTrain] Available RAM: {avail:.1f}GB")
        if avail < min_gb:
            raise MemoryError(f"Only {avail:.1f}GB RAM available, need {min_gb}GB.")
    except ImportError:
        logger.warning("[DiseaseTrain] psutil not installed, skipping RAM check.")


def _ensure_dataset(dataset_dir: str):
    """Check for PlantVillage dataset or attempt Kaggle download."""
    if os.path.exists(dataset_dir) and os.listdir(dataset_dir):
        return
    logger.info("[DiseaseTrain] Dataset not found. Attempting Kaggle download...")
    try:
        import subprocess
        parent = os.path.dirname(dataset_dir)
        os.makedirs(parent, exist_ok=True)
        result = subprocess.run(
            ["kaggle", "datasets", "download",
             "-d", "emmarex/plantdisease",
             "-p", parent, "--unzip"],
            capture_output=True, text=True, timeout=1800
        )
        if result.returncode != 0:
            logger.error(f"[DiseaseTrain] Kaggle download failed: {result.stderr}")
    except Exception as e:
        logger.error(f"[DiseaseTrain] Kaggle download error: {e}")

    if not os.path.exists(dataset_dir) or not os.listdir(dataset_dir):
        raise FileNotFoundError(
            f"PlantVillage dataset not found at {dataset_dir}\n"
            "Download from: https://www.kaggle.com/datasets/emmarex/plantdisease\n"
            "Extract to: backend/ai/datasets/PlantVillage/"
        )


def _build_severity_map(class_names: list) -> dict:
    """Build severity map dynamically from class names (never hardcoded)."""
    severity_keywords = {
        "Late_blight": "Critical", "Haunglongbing": "Critical",
        "Yellow_Leaf_Curl_Virus": "Critical", "mosaic_virus": "Critical",
        "Black_rot": "High", "Esca": "High", "Septoria": "High",
        "Bacterial_spot": "High", "Leaf_blight": "High", "Leaf_scorch": "High",
        "Early_blight": "Moderate", "Common_rust": "Moderate",
        "Cercospora": "Moderate", "Powdery_mildew": "Moderate",
        "Apple_scab": "Moderate", "Cedar_apple_rust": "Moderate",
        "Spider_mites": "Moderate", "Target_Spot": "Moderate",
        "Leaf_Mold": "Moderate", "Gray_leaf_spot": "Moderate",
    }
    smap = {}
    for cls in class_names:
        if "healthy" in cls.lower():
            smap[cls] = "None"
            continue
        matched = False
        for keyword, severity in severity_keywords.items():
            if keyword.lower() in cls.lower():
                smap[cls] = severity
                matched = True
                break
        if not matched:
            smap[cls] = "Moderate"  # default for unmapped
    return smap


def train_disease_model(version: str = None) -> dict:
    """
    Train ResNet18 on PlantVillage for 38-class disease detection.
    Two-phase: Phase A (feature extraction, 5 epochs) + Phase B (fine-tune, 10 epochs).
    """
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, WeightedRandomSampler, Subset
    import torchvision.transforms as transforms
    import torchvision.models as models
    from torchvision.datasets import ImageFolder

    torch.manual_seed(42)

    _check_ram(min_gb=2.0)
    paths = _get_paths()
    os.makedirs(paths["models_dir"], exist_ok=True)
    os.makedirs(paths["metrics_dir"], exist_ok=True)

    _ensure_dataset(paths["datasets_dir"])

    # ── 1. Transforms ─────────────────────────────────────────────────────────
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.RandomPerspective(distortion_scale=0.2, p=0.3),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0)),
        transforms.RandomAffine(degrees=10, translate=(0.1, 0.1)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    eval_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    # ── 2. Load Dataset (dynamic class names from folders) ─────────────────────
    # Find the actual image root (may have nested dirs)
    dataset_root = paths["datasets_dir"]
    # Check if images are in a subdirectory
    subdirs = [d for d in os.listdir(dataset_root)
               if os.path.isdir(os.path.join(dataset_root, d))]
    if len(subdirs) == 1 and not any(
        f.lower().endswith(('.jpg', '.png', '.jpeg'))
        for f in os.listdir(dataset_root) if os.path.isfile(os.path.join(dataset_root, f))
    ):
        dataset_root = os.path.join(dataset_root, subdirs[0])
        logger.info(f"[DiseaseTrain] Using nested dataset root: {dataset_root}")

    full_dataset = ImageFolder(root=dataset_root, transform=train_transform)
    class_names = full_dataset.classes  # dynamic from folder names — never hardcoded
    num_classes = len(class_names)
    logger.info(f"[DiseaseTrain] Classes: {num_classes}, Total images: {len(full_dataset)}")

    # ── 3. Stratified Split 70/10/20 ──────────────────────────────────────────
    from sklearn.model_selection import train_test_split

    targets = [s[1] for s in full_dataset.samples]
    indices = list(range(len(full_dataset)))

    train_idx, temp_idx = train_test_split(
        indices, test_size=0.3, random_state=42, stratify=targets)
    temp_targets = [targets[i] for i in temp_idx]
    val_idx, test_idx = train_test_split(
        temp_idx, test_size=2/3, random_state=42, stratify=temp_targets)

    logger.info(f"[DiseaseTrain] Split: train={len(train_idx)}, val={len(val_idx)}, test={len(test_idx)}")

    # ── 4. WeightedRandomSampler for class imbalance (training only) ──────────
    train_targets = [targets[i] for i in train_idx]
    class_counts = Counter(train_targets)
    class_weights = {cls: 1.0 / cnt for cls, cnt in class_counts.items()}
    sample_weights = [class_weights[t] for t in train_targets]
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

    # Create subsets
    train_subset = Subset(full_dataset, train_idx)
    val_dataset = ImageFolder(root=dataset_root, transform=eval_transform)
    val_subset = Subset(val_dataset, val_idx)
    test_dataset = ImageFolder(root=dataset_root, transform=eval_transform)
    test_subset = Subset(test_dataset, test_idx)

    # DataLoaders — CPU constraints: batch_size=16, num_workers=0
    train_loader = DataLoader(train_subset, batch_size=16, sampler=sampler,
                              num_workers=0, pin_memory=False)
    val_loader   = DataLoader(val_subset, batch_size=16, shuffle=False,
                              num_workers=0, pin_memory=False)
    test_loader  = DataLoader(test_subset, batch_size=16, shuffle=False,
                              num_workers=0, pin_memory=False)

    # ── 5. Model: ResNet18 (CPU-optimized) ────────────────────────────────────
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    device = torch.device("cpu")
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    best_val_acc = 0.0
    best_model_path = os.path.join(paths["models_dir"], "disease_resnet18_v1.pt")
    epoch_logs = []

    # ── 6. Phase A — Feature Extraction (5 epochs) ────────────────────────────
    logger.info("[DiseaseTrain] === Phase A: Feature extraction (5 epochs, fc only) ===")
    for param in model.parameters():
        param.requires_grad = False
    for param in model.fc.parameters():
        param.requires_grad = True

    optimizer_a = optim.Adam(model.fc.parameters(), lr=0.001)
    patience_counter = 0

    for epoch in range(5):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer_a.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_a.step()
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        train_loss = running_loss / total
        train_acc = correct / total

        # Validation
        val_loss, val_correct, val_total = 0.0, 0, 0
        model.eval()
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        v_loss = val_loss / val_total
        v_acc = val_correct / val_total

        log = {"epoch": epoch + 1, "phase": "A", "train_loss": round(train_loss, 4),
               "train_acc": round(train_acc, 4), "val_loss": round(v_loss, 4),
               "val_acc": round(v_acc, 4)}
        epoch_logs.append(log)
        logger.info(f"[DiseaseTrain] Phase A Epoch {epoch+1}/5 — "
                     f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
                     f"val_loss={v_loss:.4f} val_acc={v_acc:.4f}")

        # Save best
        if v_acc > best_val_acc:
            best_val_acc = v_acc
            torch.save(model.state_dict(), best_model_path)
            patience_counter = 0
        else:
            patience_counter += 1

        # Memory log
        try:
            import psutil
            mem = psutil.virtual_memory()
            logger.info(f"[DiseaseTrain]   RAM used: {mem.used/1e9:.1f}GB / {mem.total/1e9:.1f}GB")
        except ImportError:
            pass

    # ── 7. Phase B — Fine-tuning (10 epochs) ──────────────────────────────────
    logger.info("[DiseaseTrain] === Phase B: Fine-tuning (10 epochs, all layers) ===")
    for param in model.parameters():
        param.requires_grad = True

    optimizer_b = optim.Adam(model.parameters(), lr=0.0001)
    scheduler = optim.lr_scheduler.StepLR(optimizer_b, step_size=5, gamma=0.1)
    patience_counter = 0

    for epoch in range(10):
        model.train()
        running_loss, correct, total = 0.0, 0, 0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer_b.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer_b.step()
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        train_loss = running_loss / total
        train_acc = correct / total
        scheduler.step()

        # Validation
        val_loss, val_correct, val_total = 0.0, 0, 0
        model.eval()
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        v_loss = val_loss / val_total
        v_acc = val_correct / val_total

        log = {"epoch": epoch + 6, "phase": "B", "train_loss": round(train_loss, 4),
               "train_acc": round(train_acc, 4), "val_loss": round(v_loss, 4),
               "val_acc": round(v_acc, 4)}
        epoch_logs.append(log)
        logger.info(f"[DiseaseTrain] Phase B Epoch {epoch+1}/10 — "
                     f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
                     f"val_loss={v_loss:.4f} val_acc={v_acc:.4f}")

        if v_acc > best_val_acc:
            best_val_acc = v_acc
            torch.save(model.state_dict(), best_model_path)
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= 5:
                logger.info(f"[DiseaseTrain] Early stopping at epoch {epoch+6}")
                break

        try:
            import psutil
            mem = psutil.virtual_memory()
            logger.info(f"[DiseaseTrain]   RAM used: {mem.used/1e9:.1f}GB / {mem.total/1e9:.1f}GB")
        except ImportError:
            pass

    # ── 8. Load Best Model & Test Evaluation ──────────────────────────────────
    model.load_state_dict(torch.load(best_model_path, map_location=device, weights_only=True))
    model.eval()

    all_preds, all_labels = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    test_acc = (all_preds == all_labels).mean()
    logger.info(f"[DiseaseTrain] Test accuracy: {test_acc:.4f}")

    if test_acc >= 0.80:
        logger.info(f"[DiseaseTrain] ✓ ACCEPT GATE PASSED: test_acc={test_acc:.4f} ≥ 0.80")
    else:
        logger.warning(f"[DiseaseTrain] ✗ Accept gate FAILED: test_acc={test_acc:.4f} < 0.80")

    # Overfitting check
    gap = train_acc - best_val_acc
    if gap > 0.10:
        logger.warning(f"[DiseaseTrain] Overfitting detected: train-val gap = {gap:.4f} > 0.10")

    # ── 9. Confusion Matrix ───────────────────────────────────────────────────
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(all_labels, all_preds)
        fig, ax = plt.subplots(figsize=(16, 14))
        ax.imshow(cm, cmap="Blues")
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_title(f"Disease Detection — Confusion Matrix (test_acc={test_acc:.3f})")
        plt.tight_layout()
        cm_path = os.path.join(paths["metrics_dir"], "confusion_matrix.png")
        plt.savefig(cm_path, dpi=72, bbox_inches="tight")
        plt.close()
        logger.info(f"[DiseaseTrain] Confusion matrix → {cm_path}")
    except Exception as e:
        logger.warning(f"[DiseaseTrain] Confusion matrix save failed: {e}")

    # ── 10. Per-class F1 ──────────────────────────────────────────────────────
    try:
        from sklearn.metrics import classification_report
        report = classification_report(
            all_labels, all_preds,
            target_names=class_names, output_dict=True, zero_division=0
        )
    except Exception:
        report = {}

    # ── 11. Save Artifacts ────────────────────────────────────────────────────
    # Class names
    class_names_path = os.path.join(paths["models_dir"], "disease_class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(class_names, f, indent=2)

    # Severity map
    severity_map = _build_severity_map(class_names)
    severity_path = os.path.join(paths["models_dir"], "disease_severity_map.json")
    with open(severity_path, "w") as f:
        json.dump(severity_map, f, indent=2)

    # Metrics
    version = version or datetime.now(timezone.utc).strftime("v%Y%m%d_%H%M%S")
    metrics = {
        "version": version,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "model": "ResNet18",
        "num_classes": num_classes,
        "class_names": list(class_names),
        "total_images": len(full_dataset),
        "split": {"train": len(train_idx), "val": len(val_idx), "test": len(test_idx)},
        "best_val_acc": round(float(best_val_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "accept_gate_passed": test_acc >= 0.80,
        "epoch_logs": epoch_logs,
        "is_active": True,
        "models_saved": {
            "model": "disease_resnet18_v1.pt",
            "class_names": "disease_class_names.json",
            "severity_map": "disease_severity_map.json",
        },
    }

    metrics_path = os.path.join(paths["metrics_dir"], "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2, default=str)
    logger.info(f"[DiseaseTrain] Metrics → {metrics_path}")

    # Cleanup
    del model, full_dataset, train_loader, val_loader, test_loader
    gc.collect()

    logger.info(f"[DiseaseTrain] ═══ DONE ═══  test_acc={test_acc:.4f}  "
                f"gate={'PASS' if test_acc >= 0.80 else 'FAIL'}")
    return metrics
