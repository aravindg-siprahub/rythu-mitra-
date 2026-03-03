import os
import sys
from dotenv import load_dotenv
load_dotenv('.env')

import requests
api_key = os.getenv('OPENROUTER_API_KEY', '')

# Test the correct model IDs
models_to_try = [
    "google/gemini-flash-1.5-8b",
    "openai/gpt-3.5-turbo",
    "meta-llama/llama-3-8b-instruct:free",
]

for model in models_to_try:
    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": model, "messages": [{"role": "user", "content": "Say: hello farmer one sentence"}], "max_tokens": 30},
            timeout=12,
        )
        print(f"[{model}] Status: {resp.status_code}")
        if resp.status_code == 200:
            text = resp.json()["choices"][0]["message"]["content"].strip()
            print(f"  -> {text[:80]}")
            break
        else:
            print(f"  Error: {resp.json().get('error',{}).get('message','')}")
    except Exception as e:
        print(f"  Exception: {e}")
