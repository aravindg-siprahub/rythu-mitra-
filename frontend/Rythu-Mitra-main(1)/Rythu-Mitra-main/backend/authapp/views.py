from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer

@api_view(["POST"])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created"}, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if user:
        return Response({"message": "Login success", "user": UserSerializer(user).data})
    return Response({"error": "Invalid credentials"}, status=400)
