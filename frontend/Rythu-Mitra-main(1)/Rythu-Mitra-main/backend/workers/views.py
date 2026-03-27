from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Worker
from .serializers import WorkerSerializer

@api_view(["GET"])
def get_workers(request):
    workers = Worker.objects.all()
    return Response(WorkerSerializer(workers, many=True).data)

@api_view(["POST"])
def add_worker(request):
    serializer = WorkerSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
