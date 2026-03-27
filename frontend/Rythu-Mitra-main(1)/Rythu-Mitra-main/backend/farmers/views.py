from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Farmer
from .serializers import FarmerSerializer

@api_view(["GET"])
def get_farmers(request):
    farmers = Farmer.objects.all()
    serializer = FarmerSerializer(farmers, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def add_farmer(request):
    serializer = FarmerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
