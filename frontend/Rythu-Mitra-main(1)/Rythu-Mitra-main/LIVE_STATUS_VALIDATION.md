# 🏥 LIVE STATUS SUPERVISOR: RYTHU MITRA
**Target:** EC2 Production (`16.170.172.200`) | **OS:** Ubuntu 24.04

---

## 1️⃣ LIVE VALIDATION COMMANDS
**Execute these commands inside your EC2 via SSH.**

### A. Infrastructure Health
```bash
# 1. Docker Daemon Status
sudo systemctl status docker --no-pager
# ✅ SUCCESS: "Active: active (running)"
# ❌ FAILURE: "Inactive" or "Failed" -> Docker crashed.

# 2. Container State
cd ~/rythu-mitra-enterprise
sudo docker compose ps
# ✅ SUCCESS: All 5 services (nginx, backend, frontend, db, redis) show "Up"
# ❌ FAILURE: Any service shows "Exit", "Restarting", or is missing.

# 3. Port Bindings
sudo ss -tuln | grep -E ':(80|443|8000)'
# ✅ SUCCESS: LISTEN 0.0.0.0:80 and 0.0.0.0:443
# ❌ FAILURE: Nothing listening on 80/443 -> Nginx failed to bind.
```

### B. Application Health
```bash
# 4. Backend Internal Health
sudo docker compose exec backend curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/
# ✅ SUCCESS: "200"
# ❌ FAILURE: "000" (Connection refused) or "500" (Server Error).

# 5. Frontend Internal Reachability
sudo docker compose exec nginx curl -s -o /dev/null -w "%{http_code}" http://frontend:80
# ✅ SUCCESS: "200"
# ❌ FAILURE: "Could not resolve host" (Network issue) or "404".

# 6. Full Stack API Test (AI Prediction)
curl -X POST http://localhost/api/v1/ai/predict/ \
     -H "Content-Type: application/json" \
     -d '{"mode": "crop_recommendation", "data": {"N":90,"P":40,"K":40}}'
# ✅ SUCCESS: JSON response with "recommendations".
# ❌ FAILURE: HTML Error Page (502 Bad Gateway) -> Backend not reachable by Nginx.
```

### C. Log Forensics
```bash
# 7. Check for Python/Django Crashes
sudo docker compose logs --tail=50 backend

# 8. Check for Nginx Routing Errors
sudo docker compose logs --tail=50 nginx

# 9. Check Database Connections
sudo docker compose logs --tail=50 db
```

---

## 2️⃣ AUTOMATIC DIAGNOSIS MATRIX

| Symptom | Probable Root Cause |
| :--- | :--- |
| **`docker compose ps` is empty** | You never ran `deploy_full_stack.sh` or `git pull` failed. |
| **Nginx `0.0.0.0:80: bind: address already in use`** | Another web server (Apache/System Nginx) is running. |
| **Backend `Exited (1)`** | Missing `.env` file or Syntax Error in Python code. |
| **DB `FATAL: password authentication failed`** | `POSTGRES_PASSWORD` in `.env` doesn't match DB volume data. |
| **Frontend `404 Not Found`** | Docker build failed to copy `build/` folder to Nginx container. |
| **502 Bad Gateway** | Backend is running but taking too long to start (Gunicorn timeout). |
| **Redis `Connection refused`** | Redis container not running or hostname typo in `.env`. |

---

## 3️⃣ FIX COMMANDS (Surgical)

### 🔧 Fix 1: Stop Conflict Web Servers
If Port 80 is blocked:
```bash
sudo systemctl stop nginx apache2
sudo systemctl disable nginx apache2
sudo docker compose restart nginx
```

### 🔧 Fix 2: Database Password Mismatch
If DB authentication fails (Nuclear Option - Resets Data):
```bash
sudo docker compose down
sudo docker volume rm rythu-mitra-enterprise_postgres_data
sudo docker compose up -d
```

### 🔧 Fix 3: Rebuild Frontend
If Frontend is blank/404:
```bash
sudo docker compose build --no-cache frontend
sudo docker compose up -d frontend
```

### 🔧 Fix 4: Backend Crash Loop
If Backend keeps restarting:
1. Check logs: `sudo docker compose logs backend`
2. If env missing: `nano backend/.env` (Paste secrets)
3. Restart: `sudo docker compose restart backend`

---

## 4️⃣ SELF-HEAL SEQUENCE (The "Magic" Button)
**Run this entire block to force a full restoration.**

```bash
#!/bin/bash
# self_heal.sh
echo "🚑 INITIATING SELF-HEAL PROTOCOL..."

cd ~/rythu-mitra-enterprise

# 1. Stop everything safely
sudo docker compose down

# 2. Prune dangling resources causing conflicts
sudo docker system prune -f

# 3. Fix potential Git issues
git reset --hard origin/main
git pull origin main

# 4. Rebuild everything fresh (Ensures code changes are applied)
sudo docker compose build --no-cache

# 5. Start with detached mode
sudo docker compose up -d --remove-orphans

# 6. Wait for DB initialization (10s)
echo "⏳ Waiting for Database..."
sleep 10

# 7. Verify
sudo docker compose ps
echo "✅ SELF-HEAL COMPLETE."
```

---

## 5️⃣ FINAL LIVE VERDICT

**How to determine status:**

*   **[🟢 LIVE]**:
    *   ALL containers "Up".
    *   `curl http://localhost/health/` returns 200/Healthy.
    *   Public IP loads React App in browser.

*   **[🔴 NOT LIVE]**:
    *   Any container "Exit" or "Restarting".
    *   `curl` returns "Connection Refused".
    *   **Action**: Run `SELF-HEAL SEQUENCE` above immediately.
