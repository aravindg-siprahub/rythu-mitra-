from rest_framework import serializers

class CropPredictionSerializer(serializers.Serializer):
    N = serializers.FloatField(min_value=0, max_value=500)
    P = serializers.FloatField(min_value=0, max_value=500)
    K = serializers.FloatField(min_value=0, max_value=500)
    temperature = serializers.FloatField(min_value=-10, max_value=60)
    humidity = serializers.FloatField(min_value=0, max_value=100)
    ph = serializers.FloatField(min_value=0, max_value=14)
    rainfall = serializers.FloatField(min_value=0, max_value=3000)
    
class DiseasePredictionSerializer(serializers.Serializer):
    image = serializers.ImageField()
    crop_type = serializers.CharField(max_length=100, required=False)

class WeatherForecastSerializer(serializers.Serializer):
    lat = serializers.FloatField(min_value=-90, max_value=90)
    lon = serializers.FloatField(min_value=-180, max_value=180)
    days = serializers.IntegerField(min_value=1, max_value=14, default=7)

class MarketForecastSerializer(serializers.Serializer):
    crop = serializers.CharField(max_length=100)
    region = serializers.CharField(max_length=100)
    days = serializers.IntegerField(min_value=7, max_value=90, default=30)
    
class ProfitAnalysisSerializer(serializers.Serializer):
    crop_recommendations = serializers.ListField(child=serializers.CharField())
    region = serializers.CharField()
    acres = serializers.FloatField(min_value=0.1, default=1.0)

class UnifiedPredictionSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=[
        ('crop_recommendation', 'Crop Recommendation'),
        ('disease_detection', 'Disease Detection'),
        ('weather_forecast', 'Weather Forecast'),
        ('market_forecast', 'Market Forecast'),
        ('profit_optimizer', 'Profit Optimizer'),
    ])
    data = serializers.DictField()
    
    def validate(self, attrs):
        mode = attrs.get('mode')
        data = attrs.get('data')
        
        if mode == 'crop_recommendation':
            ser = CropPredictionSerializer(data=data)
        elif mode == 'disease_detection':
            # Note: File uploads need special handling; usually handled separately or via base64 in JSON
            # For Unified Gateway JSON, we expect base64 if sending JSON, or Multipart if sending file.
            # This logic might need adjustment based on view implementation. 
            # For simplicity, we assume separate endpoints or handled in View.
            pass 
        elif mode == 'weather_forecast':
            ser = WeatherForecastSerializer(data=data)
        elif mode == 'market_forecast':
            ser = MarketForecastSerializer(data=data)
        elif mode == 'profit_optimizer':
            ser = ProfitAnalysisSerializer(data=data)
            
        if mode != 'disease_detection': # Skip for now as image handling is complex in nested JSON
            if not ser.is_valid():
                raise serializers.ValidationError({'data': ser.errors})
        
        return attrs
