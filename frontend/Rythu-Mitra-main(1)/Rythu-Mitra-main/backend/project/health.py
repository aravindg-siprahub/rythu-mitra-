from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    # Check DB
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        return JsonResponse({'status': 'unhealthy', 'reason': 'Database'}, status=503)

    # Check Cache (Redis)
    try:
        cache.set('health', 'ok', 1)
        if cache.get('health') != 'ok':
            raise Exception("Cache failed")
    except Exception:
        return JsonResponse({'status': 'unhealthy', 'reason': 'Redis'}, status=503)

    return JsonResponse({'status': 'healthy', 'version': '1.0.0'}, status=200)
