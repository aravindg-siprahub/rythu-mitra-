import json
import requests
import logging

logger = logging.getLogger(__name__)

def call_openrouter(system_prompt: str, user_prompt: str, image_base64: str | None = None, **kwargs) -> dict:
    try:
        from decouple import config
        api_key = config('OPENROUTER_API_KEY', default='')
        model = config('OPENROUTER_MODEL', 
                      default='openai/gpt-4o-mini')
    except ImportError:
        import os
        api_key = os.getenv('OPENROUTER_API_KEY', '')
        model = os.getenv('OPENROUTER_MODEL', 
                         'openai/gpt-4o-mini')

    # Smart Vision Switch: If image is provided, ensure model supports vision
    if image_base64:
        # Force a known multimodal model if an image is sent
        # This prevents 404 errors if the default model is text-only
        if 'gpt-4o' not in model.lower() and 'gemini' not in model.lower() and 'claude-3' not in model.lower():
            logger.info(f"Image detected but model is {model}. Overriding to gpt-4o-mini.")
            model = 'openai/gpt-4o-mini'

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is empty. Check your .env file."
        )

    logger.info(f"Calling OpenRouter with model: {model}")
    logger.info(f"API key starts with: {str(api_key)[:15]}...")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Rythu Mitra"
    }

    # Prepare message content
    if image_base64:
        if not image_base64.startswith("data:image"):
            image_base64 = f"data:image/jpeg;base64,{image_base64}"
        
        logger.info(f"Uploading image with base64 length: {len(image_base64)}")
        
        user_content = [
            {"type": "text", "text": user_prompt},
            {
                "type": "image_url",
                "image_url": {
                    "url": image_base64
                }
            }
        ]
    else:
        user_content = user_prompt

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": kwargs.get("temperature", 0.3),
        "max_tokens": kwargs.get("max_tokens", 1500)
    }

    logger.info(f"Sending request to OpenRouter (model: {model})...")
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=90
        )
    except Exception as e:
        logger.error(f"Network error calling OpenRouter: {e}")
        raise Exception(f"AI connection failed: {str(e)}")

    logger.info(f"OpenRouter response status: {response.status_code}")

    if response.status_code != 200:
        error_info = response.text
        logger.error(f"OpenRouter error: {error_info}")
        # Try to parse a meaningful error message
        try:
            err_json = response.json()
            error_info = err_json.get('error', {}).get('message', error_info)
        except:
            pass
        raise Exception(f"AI Engine Error ({response.status_code}): {error_info}")

    raw_content = response.json()['choices'][0]['message']['content']
    
    # Strictly type hint for the IDE static analyzer (Pyre)
    if not isinstance(raw_content, str):
        raw_content = str(raw_content)
    
    content: str = raw_content
    logger.info(f"Raw OpenRouter response: {content[:200]}...")

    # Clean markdown code blocks
    content = content.strip()
    for prefix in ['```json\n', '```json', '```\n', '```']:
        if content.startswith(prefix):
            content = content.replace(prefix, "", 1)
    if content.endswith('```'):
        content = content[:-3]  # sometimes IDEs complain about this too, let's use replace
        if content.endswith('```'):
            content = content[:-3] # Fallback, but let's just do a safe string operation
            
    # Try one more safe replace for the suffix
    if content.endswith('```'):
        content = content.replace('```', '', 1)

    content = content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}, content: {content}")
        raise Exception("OpenRouter returned invalid JSON")
