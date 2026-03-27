"""
apps/i18n_app/views.py
Internationalisation and translation endpoints.
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = [
    {'code': 'te', 'name': 'Telugu', 'native': 'తెలుగు'},
    {'code': 'hi', 'name': 'Hindi', 'native': 'हिन्दी'},
    {'code': 'en', 'name': 'English', 'native': 'English'},
    {'code': 'kn', 'name': 'Kannada', 'native': 'ಕನ್ನಡ'},
]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def languages_list(request):
    """GET /api/v1/i18n/languages/ — list supported languages."""
    return Response({'languages': SUPPORTED_LANGUAGES})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def translate_text(request):
    """POST /api/v1/translate/ — translate text to target language."""
    text = request.data.get('text', '')
    target_lang = request.data.get('target_language', 'te')

    # Best-effort translation via Groq
    try:
        from apps.core.openrouter import call_openrouter
        system = "You are a professional translator for Indian languages. Return ONLY the translated text, nothing else."
        prompt = f"Translate this to {target_lang}: {text}"
        result = call_openrouter(system, prompt)
        translated = result if isinstance(result, str) else str(result)
    except Exception as e:
        logger.warning(f"Translation error: {e}")
        translated = text  # Fallback: return original

    return Response({
        'original': text,
        'translated': translated,
        'target_language': target_lang,
    })
