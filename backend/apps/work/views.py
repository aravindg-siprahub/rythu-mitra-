from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json, os
from .services import (
    get_job_feed, create_job_post, apply_to_job,
    get_job_applicants, get_farmer_posts, get_supplier_applications,
    close_job_post, get_supplier_profile, register_supplier, submit_rating,
    update_application_status
)

@method_decorator(csrf_exempt, name='dispatch')
class JobFeedView(View):
    def get(self, request):
        service_type = request.GET.get("service_type", "all")
        district = request.GET.get("district", "all")
        search = request.GET.get("q", None)
        offset = int(request.GET.get("offset", 0))
        posts = get_job_feed(service_type, district, search, offset=offset)
        return JsonResponse({"posts": posts})

@method_decorator(csrf_exempt, name='dispatch')
class CreateJobView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            post = create_job_post(data)
            return JsonResponse({"post": post}, status=201)
        except Exception as e:
            import traceback
            traceback.print_exc()  # prints full error to terminal
            return JsonResponse(
                {'error': str(e), 'success': False}, 
                status=400
            )

@method_decorator(csrf_exempt, name='dispatch')
class ApplyJobView(View):
    def post(self, request, job_id):
        data = json.loads(request.body)
        try:
            app = apply_to_job(job_id, data["supplier_profile_id"], data.get("cover_note", ""))
            return JsonResponse({"application": app}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ApplicantsView(View):
    def get(self, request, job_id):
        farmer_id = request.GET.get("farmer_id")
        try:
            applicants = get_job_applicants(job_id, farmer_id)
            return JsonResponse({"applicants": applicants})
        except PermissionError as e:
            return JsonResponse({"error": str(e)}, status=403)

@method_decorator(csrf_exempt, name='dispatch')
class FarmerPostsView(View):
    def get(self, request, farmer_id):
        return JsonResponse({"posts": get_farmer_posts(farmer_id)})

@method_decorator(csrf_exempt, name='dispatch')
class SupplierApplicationsView(View):
    def get(self, request, supplier_id):
        return JsonResponse({"applications": get_supplier_applications(supplier_id)})

@method_decorator(csrf_exempt, name='dispatch')
class CloseJobView(View):
    def post(self, request, job_id):
        data = json.loads(request.body)
        result = close_job_post(job_id, data["farmer_id"])
        return JsonResponse({"post": result})

@method_decorator(csrf_exempt, name='dispatch')
class SupplierProfileView(View):
    def get(self, request, user_id):
        profile = get_supplier_profile(user_id)
        return JsonResponse({"supplier": profile})

@method_decorator(csrf_exempt, name='dispatch')
class SupplierRegisterView(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            supplier = register_supplier(data)
            return JsonResponse({"supplier": supplier}, status=201)
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class RatingView(View):
    def post(self, request):
        data = json.loads(request.body)
        try:
            result = submit_rating(
                data["job_post_id"], data["farmer_id"],
                data["supplier_id"], data["rating"],
                data.get("review", "")
            )
            return JsonResponse({"rating": result}, status=201)
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateApplicationStatusView(View):
    def post(self, request, application_id):
        data = json.loads(request.body)
        try:
            app = update_application_status(
                application_id, 
                data["farmer_id"], 
                data["status"]
            )
            return JsonResponse({"application": app})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
