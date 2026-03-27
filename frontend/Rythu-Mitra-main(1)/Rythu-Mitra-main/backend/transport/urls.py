from django.urls import path
from .views import get_transport, add_transport

urlpatterns = [
    path("", get_transport, name="get_transport"),
    path("add/", add_transport, name="add_transport"),
]
