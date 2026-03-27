"""
apps/core/validators.py
Input sanitisation utilities.
"""
import re


def sanitize_text(text: str, max_length: int = 200) -> str:
    """Strip HTML tags and limit length."""
    if not text:
        return ''
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', str(text))
    # Remove null bytes and control characters
    clean = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', clean)
    return clean.strip()[:max_length]
