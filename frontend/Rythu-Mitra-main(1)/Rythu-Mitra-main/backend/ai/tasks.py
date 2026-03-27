from celery import shared_task
from .crop_recommendation import CropRecommendationEngine
from .disease_detection import DiseaseDetectionEngine
from .market_forecast import MarketPriceIntelligence
from .profit_engine import FarmerProfitEngine
from .weather_ai import WeatherIntelligenceEngine
import logging

logger = logging.getLogger(__name__)

# Initialize Engines (Module level to reuse across tasks in worker)
# Note: In production, consider lazy loading or class-based tasks to manage memory
crop_engine = CropRecommendationEngine()
disease_engine = DiseaseDetectionEngine()
market_engine = MarketPriceIntelligence()
weather_engine = WeatherIntelligenceEngine()
profit_engine = FarmerProfitEngine()

@shared_task
def predict_crop_task(data):
    try:
        return crop_engine.predict(data)
    except Exception as e:
        logger.error(f"Crop Task Error: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def predict_disease_task(image_bytes):
    try:
        return disease_engine.predict_from_image(image_bytes)
    except Exception as e:
        logger.error(f"Disease Task Error: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def predict_weather_task(lat, lon, days):
    try:
        return weather_engine.get_forecast(lat, lon, days)
    except Exception as e:
        logger.error(f"Weather Task Error: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def predict_market_task(crop, region, days):
    try:
        return market_engine.predict_price(crop, region, days)
    except Exception as e:
        logger.error(f"Market Task Error: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def calculate_profit_task(crops, region, acres):
    try:
        # 1. Get market prices for these crops
        prices = {}
        for crop in crops:
            forecast = market_engine.predict_price(crop, region, 30)
            # Use average of next 30 days as reference price
            avg_price = sum(d['price'] for d in forecast['forecast']) / len(forecast['forecast'])
            prices[crop] = avg_price
            
        # 2. Rank
        rankings = profit_engine.rank_crops_by_profit(crops, prices, acres)
        
        return {'status': 'success', 'analysis': rankings}
    except Exception as e:
        logger.error(f"Profit Task Error: {e}")
        return {'status': 'error', 'message': str(e)}
