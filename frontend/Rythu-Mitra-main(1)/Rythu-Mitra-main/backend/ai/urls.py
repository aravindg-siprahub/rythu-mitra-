from django.urls import path
from .views import UnifiedAIGateway

urlpatterns = [
    path('predict/', UnifiedAIGateway.as_view(), name='ai_predict'),
]
