from django.urls import path
from .views import get_farmers, add_farmer

urlpatterns = [
    path("", get_farmers, name="get_farmers"),
    path("add/", add_farmer, name="add_farmer"),
]
