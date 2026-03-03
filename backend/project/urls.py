from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health import health_check
from project.simulation_urls import workers_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    
    # API Version 1
    path('api/v1/market/', include('market.urls')),
    path('api/v1/ai/', include('ai.urls')), 
    path('api/v1/auth/', include('authapp.urls')),
    
    path('api/v1/farmers/', include('farmers.urls')),
    path('api/v1/workers/', include(workers_patterns)),
    path('api/v1/transport/', include('transport.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
