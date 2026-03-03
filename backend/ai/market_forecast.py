"""
market_forecast.py — Rythu Mitra Market Intelligence Engine
============================================================
PRD §7.4 requirements implemented:
  - Real CSV price history loading (AgMarknet/local export)  ← Phase 3 fix
  - Prophet time-series forecasting when installed           ← Phase 3 fix
  - Sine-wave mock only as last-resort fallback
  - model_version exposed in response (PRD §8.7)

Dataset format (CSV):
  Columns: date (YYYY-MM-DD), crop, region, price (₹/quintal)
  Save at: backend/ai/datasets/market_prices.csv

AgMarknet data export: https://agmarknet.gov.in/
"""
import os
import json
import logging
from datetime import datetime, timezone

import numpy as np
import pandas as pd

try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    Prophet = None
    HAS_PROPHET = False

from django.conf import settings

logger = logging.getLogger(__name__)

MODELS_DIR = os.path.join(settings.BASE_DIR, 'ai', 'models')
DATASETS_DIR = os.path.join(settings.BASE_DIR, 'ai', 'datasets')
MARKET_CSV_DEFAULT = os.path.join(DATASETS_DIR, 'market_prices.csv')


class MarketPriceIntelligence:
    """
    Market Price Intelligence Engine — PRD §7.4
    Forecasting Mandi prices to maximize farmer profits.

    Prediction modes (in priority order):
      1. Prophet time-series (if installed + CSV loaded)
      2. Linear regression on historical CSV
      3. Sine-wave mock (dev fallback)
    """

    def predict_price(self, crop: str, region: str, days: int = 30) -> dict:
        """
        Predict daily prices for the next `days`.

        Args:
            crop:   Crop name (e.g. 'Rice', 'Tomato')
            region: Market/region name (e.g. 'Hyderabad')
            days:   Forecast horizon in days (default 30)

        Returns:
            PRD §7.4 schema — forecast list, best_strategy, model_version.
        """
        logger.info(f"[MarketEngine] Forecasting {crop} prices for {region} ({days} days)")

        # ── Try to load real historical data from CSV ─────────────────────────
        historical_df = self._load_historical(crop, region)

        if historical_df is not None and HAS_PROPHET:
            forecast = self._prophet_forecast(historical_df, crop, region, days)
            mode = "prophet_timeseries"
            version = "prophet_v1"
        elif historical_df is not None:
            forecast = self._linear_forecast(historical_df, crop, region, days)
            mode = "linear_regression"
            version = "linear_v1"
        else:
            # Dev fallback: sine wave mock
            logger.warning(
                f"[MarketEngine] No CSV data for {crop}/{region}. Using sine-wave mock.\n"
                "  → Add real data: backend/ai/datasets/market_prices.csv"
            )
            forecast = self._mock_forecast(crop, days)
            mode = "mock_sinewave"
            version = "mock_v0"

        best_day = max(forecast, key=lambda x: x['price'])
        first_price = forecast[0]['price']

        return {
            'crop': crop,
            'region': region,
            'forecast': forecast,
            'best_strategy': {
                'action': 'Sell' if best_day['date'] == forecast[0]['date'] else 'Hold',
                'best_date': best_day['date'],
                'expected_gain': round(best_day['price'] - first_price, 2),
                'peak_price': best_day['price'],
            },
            'meta': {
                'model_version': version,       # PRD §8.7
                'mode': mode,
                'horizon_days': days,
                'data_rows_used': len(historical_df) if historical_df is not None else 0,
            },
        }

    # ── Data loading ──────────────────────────────────────────────────────────
    def _load_historical(self, crop: str, region: str):
        """
        Load historical price CSV.
        Expected columns: date, crop, region, price
        Returns filtered DataFrame or None if CSV missing.
        """
        if not os.path.exists(MARKET_CSV_DEFAULT):
            return None
        try:
            df = pd.read_csv(MARKET_CSV_DEFAULT, parse_dates=['date'])
            df['crop'] = df['crop'].str.strip().str.lower()
            df['region'] = df['region'].str.strip().str.lower()
            filtered = df[
                (df['crop'] == crop.lower()) &
                (df['region'] == region.lower())
            ].sort_values('date')

            if len(filtered) < 10:
                logger.warning(f"[MarketEngine] Only {len(filtered)} rows for {crop}/{region}. Falling back.")
                return None

            return filtered[['date', 'price']].reset_index(drop=True)
        except Exception as e:
            logger.error(f"[MarketEngine] CSV load error: {e}")
            return None

    # ── Forecast engines ──────────────────────────────────────────────────────
    def _prophet_forecast(self, df, crop, region, days):
        """Prophet time-series forecasting on real historical data."""
        prophet_df = df.rename(columns={'date': 'ds', 'price': 'y'})
        m = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
        )
        m.fit(prophet_df)
        future = m.make_future_dataframe(periods=days)
        forecast_df = m.predict(future).tail(days)

        result = []
        for _, row in forecast_df.iterrows():
            result.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'price': round(float(row['yhat']), 2),
                'confidence_lower': round(float(row['yhat_lower']), 2),
                'confidence_upper': round(float(row['yhat_upper']), 2),
            })
        return result

    def _linear_forecast(self, df, crop, region, days):
        """Simple linear regression on price trend as Prophet fallback."""
        prices = df['price'].values
        x = np.arange(len(prices))
        coeffs = np.polyfit(x, prices, 1)
        poly = np.poly1d(coeffs)

        dates = pd.date_range(start=pd.Timestamp.now(), periods=days)
        start_idx = len(prices)
        result = []
        for i, d in enumerate(dates):
            p = round(float(poly(start_idx + i)), 2)
            std = float(prices.std())
            result.append({
                'date': d.strftime('%Y-%m-%d'),
                'price': p,
                'confidence_lower': round(p - std, 2),
                'confidence_upper': round(p + std, 2),
            })
        return result

    def _mock_forecast(self, crop: str, days: int):
        """Sine-wave mock — dev fallback only."""
        dates = pd.date_range(start=pd.Timestamp.now(), periods=days)
        t = np.linspace(0, 10, days)
        base_price = 2000.0 if crop.lower() == 'rice' else 5000.0
        prices = base_price + t * 10 + 100 * np.sin(t) + np.random.normal(0, 20, days)

        return [
            {
                'date': d.strftime('%Y-%m-%d'),
                'price': round(float(p), 2),
                'confidence_lower': round(float(p) - 50, 2),
                'confidence_upper': round(float(p) + 50, 2),
            }
            for d, p in zip(dates, prices)
        ]

