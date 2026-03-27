from django.urls import path
from .views import get_markets, add_market

urlpatterns = [
    path("", get_markets, name="get_markets"),
    path("add/", add_market, name="add_market"),
]
