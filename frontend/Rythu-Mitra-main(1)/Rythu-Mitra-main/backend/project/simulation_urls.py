from django.urls import path
from project.simulation_views import register_farmer, book_worker, get_worker_availability

# Create dummy urls mapping
urlpatterns = [
    path('register/', register_farmer),
]

workers_patterns = [
    path('book/', book_worker),
    path('availability/', get_worker_availability),
]
