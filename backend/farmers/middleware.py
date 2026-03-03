import time
import logging
from .models import AuditLog

logger = logging.getLogger(__name__)

class AuditLogMiddleware:
    """
    Middleware to log all sensitive write operations (POST, PUT, DELETE, PATCH).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Process Request
        response = self.get_response(request)
        
        # Log only safe methods or critical endpoints
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            if request.user.is_authenticated:
                duration = time.time() - start_time
                
                try:
                    AuditLog.objects.create(
                        user=request.user,
                        action=f"{request.method} {request.path}",
                        resource_id=str(request.path), # Simplified
                        ip_address=self.get_client_ip(request),
                        status="SUCCESS" if response.status_code < 400 else "FAILURE"
                    )
                except Exception as e:
                    logger.error(f"Failed to create audit log: {e}")

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
