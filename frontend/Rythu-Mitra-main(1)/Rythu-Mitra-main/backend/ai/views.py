from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, JSONParser
from drf_spectacular.utils import extend_schema
from .serializers import UnifiedPredictionSerializer, CropPredictionSerializer, DiseasePredictionSerializer, WeatherForecastSerializer, MarketForecastSerializer, ProfitAnalysisSerializer
from .tasks import predict_crop_task, predict_disease_task, predict_weather_task, predict_market_task, calculate_profit_task
import base64

class UnifiedAIGateway(APIView):
    """
    Unified Endpoint for all AI/ML operations.
    POST /api/v1/ai/predict/
    
    Processing is determined by 'mode' parameter.
    """
    permission_classes = [permissions.AllowAny] # Change to IsAuthenticated in strict prod
    parser_classes = [JSONParser, MultiPartParser]
    
    @extend_schema(request=UnifiedPredictionSerializer)
    def post(self, request, *args, **kwargs):
        mode = request.data.get('mode')
        data = request.data.get('data', {})
        
        # If multipart/form-data (likely for disease detection image upload)
        if request.content_type and 'multipart/form-data' in request.content_type:
             mode = request.data.get('mode')
             # 'data' might be stringified json or individual fields. 
             # For simplicity, let's extract manually if not clean.
        
        if not mode:
            return Response({'error': 'Mode is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Dispatch to appropriate Task
            # We use .apply_async() for true async, but for request-response cycle 
            # where user waits (unless we implement polling), we might want synchronous execution 
            # OR return a task_id.
            # FAANG Style: Return Task ID. Frontend polls /ws/ or /status/.
            # For simplicity in this iteration: We'll wait synchronously (or small timeout) 
            # to keep frontend simple unless specifically asked for polling.
            # Actually user asked for "Fast inference loading", so synchronous for fast models (RF/XGB) 
            # and Async for slow ones (EfficientNet/LSTM) is best.
            
            # However, since we are calling tasks from here, we can just call them directly if we want sync,
            # or use .get() on the result.
            
            result = None
            
            if mode == 'crop_recommendation':
                ser = CropPredictionSerializer(data=data)
                if ser.is_valid():
                    # RF/XGB is fast, run sync-like but via task structure
                    result = predict_crop_task.apply(args=[ser.validated_data]).get()
                else:
                    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

            elif mode == 'disease_detection':
                # Handle Image
                image_file = request.FILES.get('image') or data.get('image')
                if image_file:
                    image_bytes = image_file.read()
                    # Disease model can be heavy.
                    result = predict_disease_task.apply(args=[image_bytes]).get() 
                else:
                    return Response({'error': 'Image required'}, status=status.HTTP_400_BAD_REQUEST)

            elif mode == 'weather_forecast':
                ser = WeatherForecastSerializer(data=data)
                if ser.is_valid():
                    result = predict_weather_task.apply(args=[
                        ser.validated_data['lat'],
                        ser.validated_data['lon'],
                        ser.validated_data['days']
                    ]).get()
                else:
                    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

            elif mode == 'market_forecast':
                ser = MarketForecastSerializer(data=data)
                if ser.is_valid():
                    result = predict_market_task.apply(args=[
                        ser.validated_data['crop'],
                        ser.validated_data['region'],
                        ser.validated_data['days']
                    ]).get()
                else:
                    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

            elif mode == 'profit_optimizer':
                ser = ProfitAnalysisSerializer(data=data)
                if ser.is_valid():
                    result = calculate_profit_task.apply(args=[
                        ser.validated_data['crop_recommendations'],
                        ser.validated_data['region'],
                        ser.validated_data['acres']
                    ]).get()
                else:
                    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
            
            else:
                return Response({'error': 'Invalid mode'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e), 'status': 'failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
