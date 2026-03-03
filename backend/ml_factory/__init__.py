"""
ml_factory — Rythu Mitra ML Training Factory
=============================================
All ML training, evaluation, and inference logic lives here.
Views.py and API layers NEVER do training — they only call inference.py modules.

Structure:
  ml_factory/crop/       → Crop Recommendation (Ensemble: RF + XGB + LGBM)
  ml_factory/disease/    → Disease Detection (ResNet18)
  ml_factory/market/     → Market Price Forecasting (per-commodity XGBoost)
  ml_factory/weather/    → Weather Intelligence (GradientBoosting)

Model artifacts saved to: backend/ai/models/
Datasets downloaded to:   backend/ai/datasets/

Constraints (8GB RAM, CPU only):
  - batch_size=16 (disease), n_jobs=2, float32 everywhere
  - num_workers=0 on Windows CPU
  - chunk loading for large CSVs
  - random_state=42 everywhere
"""
