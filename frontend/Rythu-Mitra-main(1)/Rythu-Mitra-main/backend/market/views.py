from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Market
from .serializers import MarketSerializer

@api_view(["GET"])
def get_markets(request):
    markets = Market.objects.all()
    serializer = MarketSerializer(markets, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def add_market(request):
    serializer = MarketSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
