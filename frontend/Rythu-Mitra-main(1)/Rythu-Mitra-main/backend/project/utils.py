from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides consistent error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response format
        custom_response_data = {
            "success": False,
            "error": {
                "message": str(exc),
                "details": response.data,
                "status_code": response.status_code,
            }
        }
        response.data = custom_response_data
        
        # Log the error
        logger.error(
            f"API Error: {exc} | Status: {response.status_code} | "
            f"View: {context.get('view').__class__.__name__}"
        )
    else:
        # Handle non-DRF exceptions
        logger.exception(f"Unhandled exception: {exc}")
        response = Response(
            {
                "success": False,
                "error": {
                    "message": "An unexpected error occurred",
                    "details": str(exc),
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response


def standardize_response(data, message="Success", success=True):
    """
    Standardize API response format
    """
    return {
        "success": success,
        "message": message,
        "data": data,
    }
