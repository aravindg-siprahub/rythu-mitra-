"""
apps/core/response.py
Standardised API response helpers and custom exception handler.
"""
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def success(data: dict, message: str = 'Success', status: int = 200) -> Response:
    """Return a standardised success response."""
    return Response({'success': True, 'message': message, **data}, status=status)


def error(message: str, code: str = 'ERROR', details=None, status: int = 400) -> Response:
    """Return a standardised error response."""
    body = {'success': False, 'error': message, 'code': code}
    if details:
        body['details'] = details
    return Response(body, status=status)


def custom_exception_handler(exc, context):
    """DRF custom exception handler — wraps errors in our standard format."""
    response = drf_exception_handler(exc, context)
    if response is not None:
        response.data = {
            'success': False,
            'error': str(exc),
            'code': 'DRF_ERROR',
            'details': response.data,
        }
    return response
