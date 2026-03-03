from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from farmers.models import LandHolding, DiseaseDetection

class GeoJSONView(APIView):
    """
    Serves aggregated regional data as GeoJSON for the interactive map.
    """
    permission_classes = [AllowAny] 

    def get(self, request):
        # Check cache first
        cached_data = cache.get('geojson_data')
        if cached_data:
            return Response(cached_data)

        features = []
        
        # 1. Overlay: Farm Locations (Sample)
        farms = LandHolding.objects.all()[:100] # Limit to 100 for performance demo
        for farm in farms:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [farm.location_lng or 78.4867, farm.location_lat or 17.3850] # Default to Hyd
                },
                "properties": {
                    "type": "FARM",
                    "district": farm.district,
                    "size": float(farm.size_in_acres)
                }
            })

        # 2. Overlay: Disease Clusters (Simulated Heatmap Points)
        detections = DiseaseDetection.objects.filter(confidence_score__gt=0.8)[:50]
        for d in detections:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [d.location_lng or 79.0, d.location_lat or 17.0] 
                },
                "properties": {
                    "type": "DISEASE_HOTSPOT",
                    "severity": "CRITICAL"
                }
            })

        data = {
            "type": "FeatureCollection",
            "features": features
        }
        
        # Cache for 5 minutes
        cache.set('geojson_data', data, 300)
        
        return Response(data)
