from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_farmer(request):
    return Response({"status": "success", "message": "Farmer registered (simulation)"})

@api_view(['POST'])
def book_worker(request):
    return Response({"status": "success", "message": "Worker booked (simulation)"})

@api_view(['GET'])
def get_worker_availability(request):
    return Response({"available": 15, "region": request.GET.get("region", "all")})
