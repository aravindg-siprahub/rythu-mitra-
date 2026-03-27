from django.urls import path
from . import views

urlpatterns = [
    path("feed/", views.JobFeedView.as_view()),
    path("create/", views.CreateJobView.as_view()),
    path("<str:job_id>/apply/", views.ApplyJobView.as_view()),
    path("<str:job_id>/applicants/", views.ApplicantsView.as_view()),
    path("<str:job_id>/close/", views.CloseJobView.as_view()),
    path("farmer/<str:farmer_id>/posts/", views.FarmerPostsView.as_view()),
    path("supplier/<str:supplier_id>/applications/", views.SupplierApplicationsView.as_view()),
    path("supplier/profile/<str:user_id>/", views.SupplierProfileView.as_view()),
    path("supplier/register/", views.SupplierRegisterView.as_view()),
    path("application/<str:application_id>/status/", views.UpdateApplicationStatusView.as_view()),
]
