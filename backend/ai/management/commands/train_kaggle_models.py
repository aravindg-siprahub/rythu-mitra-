"""
Django management command — Train Kaggle ML models for Rythu Mitra
==================================================================

Usage:
    python manage.py train_kaggle_models --model crop
    python manage.py train_kaggle_models --model disease
    python manage.py train_kaggle_models --model market
    python manage.py train_kaggle_models --model weather
    python manage.py train_kaggle_models --model all

All training logic lives in ml_factory/ — this command orchestrates.
"""

import os
import gc
import logging

from django.core.management.base import BaseCommand, CommandError

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Train Rythu Mitra ML models using Kaggle datasets. All models saved to ai/models/."

    def add_arguments(self, parser):
        parser.add_argument(
            "--model",
            type=str,
            default="crop",
            choices=["crop", "disease", "market", "weather", "all"],
            help="Model to train: crop | disease | market | weather | all  (default: crop)",
        )
        parser.add_argument(
            "--csv",
            type=str,
            default=None,
            help="Optional path to input CSV dataset.",
        )
        parser.add_argument(
            "--model-version",
            type=str,
            default=None,
            dest="model_version",
            help="Optional version string (e.g. v1.2). Auto-generated if not provided.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Validate inputs and show configuration without training.",
        )

    def handle(self, *args, **options):
        model_choice = options["model"]
        csv_path = options.get("csv")
        version = options.get("model_version")
        dry_run = options.get("dry_run", False)

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{'='*60}\n"
            f"  Rythu Mitra ML Training Pipeline v2.0\n"
            f"  Model: {model_choice.upper()}  |  Version: {version or 'auto'}\n"
            f"{'='*60}"
        ))

        # RAM check
        self._print_ram()

        if dry_run:
            self._dry_run(model_choice, csv_path)
            return

        if model_choice in ("crop", "all"):
            self._train_crop(csv_path, version)
            gc.collect()

        if model_choice in ("disease", "all"):
            self._train_disease(version)
            gc.collect()

        if model_choice in ("market", "all"):
            self._train_market(csv_path, version)
            gc.collect()

        if model_choice in ("weather", "all"):
            self._train_weather(csv_path, version)
            gc.collect()

        self.stdout.write(self.style.SUCCESS(
            "\n[DONE] Training pipeline complete. Check ai/models/ for artifacts."
        ))

    def _print_ram(self):
        try:
            import psutil
            mem = psutil.virtual_memory()
            self.stdout.write(
                f"\n  System RAM: {mem.total/1e9:.1f}GB total, "
                f"{mem.available/1e9:.1f}GB available"
            )
        except ImportError:
            self.stdout.write("  (psutil not installed — RAM check skipped)")

    # ── CROP ──────────────────────────────────────────────────────────────────
    def _train_crop(self, csv_path, version):
        self.stdout.write("\n[Crop] Starting crop recommendation training...")
        try:
            from ml_factory.crop.train import train_crop_model
            metrics = train_crop_model(csv_path=csv_path, version=version)

            self.stdout.write(self.style.SUCCESS(
                f"\n[Crop] Training complete!\n"
                f"  Top-1 Accuracy : {metrics.get('top1_accuracy', 'N/A')}\n"
                f"  Top-3 Accuracy : {metrics.get('top3_accuracy', 'N/A')}\n"
                f"  Macro F1       : {metrics.get('macro_f1', 'N/A')}\n"
                f"  CV Mean        : {metrics.get('cv_mean_accuracy', 'N/A')} ± {metrics.get('cv_std', 'N/A')}\n"
                f"  Overfitting gap: {metrics.get('overfitting_gap', 'N/A')}\n"
                f"  Accept gate    : {'[PASS]' if metrics.get('accept_gate_passed') else '[FAIL]'}"
            ))

        except FileNotFoundError as e:
            raise CommandError(f"\n[Crop] Dataset not found!\n{e}")
        except Exception as e:
            raise CommandError(f"[Crop] Training failed: {e}")

    # ── DISEASE ───────────────────────────────────────────────────────────────
    def _train_disease(self, version):
        self.stdout.write("\n[Disease] Starting disease detection training...")
        self.stdout.write(self.style.WARNING(
            "  ⚠ This takes 2-4 HOURS on CPU. Be patient."
        ))
        try:
            from ml_factory.disease.train import train_disease_model
            metrics = train_disease_model(version=version)

            self.stdout.write(self.style.SUCCESS(
                f"\n[Disease] Training complete!\n"
                f"  Model          : ResNet18\n"
                f"  Classes        : {metrics.get('num_classes')}\n"
                f"  Best Val Acc   : {metrics.get('best_val_acc', 'N/A')}\n"
                f"  Test Accuracy  : {metrics.get('test_accuracy', 'N/A')}\n"
                f"  Accept gate    : {'[PASS]' if metrics.get('accept_gate_passed') else '[FAIL]'}"
            ))

        except FileNotFoundError as e:
            self.stdout.write(self.style.WARNING(
                f"\n[Disease] Dataset not found:\n{e}\n"
                "Download PlantVillage dataset from Kaggle and extract to:\n"
                "  backend/ai/datasets/PlantVillage/\n"
            ))
        except Exception as e:
            raise CommandError(f"[Disease] Training failed: {e}")

    # ── MARKET ────────────────────────────────────────────────────────────────
    def _train_market(self, csv_path, version):
        self.stdout.write("\n[Market] Starting market price forecasting training...")
        try:
            from ml_factory.market.train import train_market_model
            metrics = train_market_model(csv_path=csv_path, version=version)

            trained = metrics.get("commodities_trained", 0)
            avg_mape = metrics.get("avg_mape", "N/A")
            beats = metrics.get("beats_naive_count", 0)

            self.stdout.write(self.style.SUCCESS(
                f"\n[Market] Training complete!\n"
                f"  Commodities trained : {trained}\n"
                f"  Avg MAPE           : {avg_mape}%\n"
                f"  Beat naive baseline: {beats}/{trained}"
            ))

        except FileNotFoundError as e:
            self.stdout.write(self.style.WARNING(
                f"\n[Market] Dataset not found:\n{e}\n"
                "Place CSV at: backend/ai/datasets/market_prices.csv\n"
            ))
        except Exception as e:
            raise CommandError(f"[Market] Training failed: {e}")

    # ── WEATHER ───────────────────────────────────────────────────────────────
    def _train_weather(self, csv_path, version):
        self.stdout.write("\n[Weather] Starting weather intelligence training...")
        try:
            from ml_factory.weather.train import train_weather_model
            metrics = train_weather_model(csv_path=csv_path, version=version)

            results = metrics.get("results", {})
            for target, vals in results.items():
                beats = vals.get("beats_seasonal_baseline", False)
                gate = "[PASS]" if beats else "[FAIL]"
                self.stdout.write(self.style.SUCCESS(
                    f"  {target}: MAE={vals.get('mae')} "
                    f"seasonal_baseline={vals.get('seasonal_baseline_mae')} "
                    f"beats_baseline={gate}"
                ))


        except FileNotFoundError as e:
            self.stdout.write(self.style.WARNING(
                f"\n[Weather] Dataset not found:\n{e}\n"
                "Place CSV at: backend/ai/datasets/weather_data.csv\n"
            ))
        except Exception as e:
            raise CommandError(f"[Weather] Training failed: {e}")

    # ── DRY RUN ───────────────────────────────────────────────────────────────
    def _dry_run(self, model_choice, csv_path):
        from django.conf import settings
        datasets_dir = os.path.join(settings.BASE_DIR, "ai", "datasets")
        models_dir = os.path.join(settings.BASE_DIR, "ai", "models")

        self.stdout.write(self.style.WARNING("\n[DRY RUN] Configuration check:"))
        self.stdout.write(f"  Target       : {model_choice}")
        self.stdout.write(f"  Datasets dir : {datasets_dir} (exists: {os.path.exists(datasets_dir)})")
        self.stdout.write(f"  Models dir   : {models_dir} (exists: {os.path.exists(models_dir)})")

        if model_choice in ("crop", "all"):
            crop_csv = csv_path or os.path.join(datasets_dir, "Crop_recommendation.csv")
            self.stdout.write(f"  Crop CSV     : {crop_csv} (exists: {os.path.exists(crop_csv)})")

        if model_choice in ("disease", "all"):
            pv = os.path.join(datasets_dir, "PlantVillage")
            self.stdout.write(f"  PlantVillage : {pv} (exists: {os.path.exists(pv)})")

        if model_choice in ("market", "all"):
            mp = csv_path or os.path.join(datasets_dir, "market_prices.csv")
            self.stdout.write(f"  Market CSV   : {mp} (exists: {os.path.exists(mp)})")

        if model_choice in ("weather", "all"):
            wp = csv_path or os.path.join(datasets_dir, "weather_data.csv")
            self.stdout.write(f"  Weather CSV  : {wp} (exists: {os.path.exists(wp)})")

        existing = [f for f in os.listdir(models_dir) if f.endswith((".pkl", ".pt"))] if os.path.exists(models_dir) else []
        self.stdout.write(f"\n  Existing model files ({len(existing)}):")
        for f in existing:
            size = os.path.getsize(os.path.join(models_dir, f)) / 1e6
            self.stdout.write(f"    {f} ({size:.1f}MB)")

        self.stdout.write(self.style.SUCCESS("\nRe-run without --dry-run to start training."))
