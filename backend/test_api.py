import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(method, path, data=None, headers=None):
    url = f"{BASE_URL}{path}"
    start_time = time.time()
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        else:
            response = requests.post(url, json=data, headers=headers, timeout=15)
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        print(f"[{method}] {path} -> Status: {response.status_code} ({elapsed_ms}ms)")
        try:
            res_json = response.json()
            return response.status_code, res_json
        except:
            return response.status_code, response.text
    except Exception as e:
        print(f"[{method}] {path} -> FAILED: {str(e)}")
        return 0, str(e)

print("--- API ENDPOINTS TEST ---")

import uuid
u = str(uuid.uuid4())[:8]
dummy_user = {"email": f"test_{u}@example.com", "password": "Password123!", "username": f"test_{u}"}
test_endpoint("POST", "/auth/register/", data=dummy_user)

status, login_res = test_endpoint("POST", "/auth/login/", data=dummy_user)
if status != 200:
    print("LOGIN FAILED:", login_res)

token = login_res.get("access_token", "") if isinstance(login_res, dict) else ""
headers = {"Authorization": f"Bearer {token}"} if token else {}

# 2. Crop Recommendation
crop_data = {"N":90,"P":42,"K":43,"temperature":20.8,"humidity":82,"ph":6.5,"rainfall":202}
status, crop_res = test_endpoint("POST", "/ai/crop-recommend/", data=crop_data, headers=headers)
print("CROP RES:", json.dumps(crop_res, indent=2)[:500])

# 3. List
test_endpoint("GET", "/farmers/", headers=headers)
test_endpoint("GET", "/market/", headers=headers)
test_endpoint("GET", "/workers/", headers=headers)
test_endpoint("GET", "/transport/", headers=headers)
