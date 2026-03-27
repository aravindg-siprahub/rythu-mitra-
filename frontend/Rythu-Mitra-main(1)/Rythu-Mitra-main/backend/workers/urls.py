from django.urls import path
from .views import get_workers, add_worker

urlpatterns = [
    path("", get_workers),
    path("add/", add_worker),
]
