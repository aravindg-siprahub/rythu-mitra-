from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Transport
from .serializers import TransportSerializer

@api_view(["GET"])
def get_transport(request):
    transport_list = Transport.objects.all()
    serializer = TransportSerializer(transport_list, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def add_transport(request):
    serializer = TransportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
