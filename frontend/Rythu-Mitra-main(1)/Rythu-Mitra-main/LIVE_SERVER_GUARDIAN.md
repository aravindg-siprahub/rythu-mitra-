# 🛡️ LIVE SERVER GUARDIAN REPORT
**Target System:** Rythu Mitra Enterprise OS
**Server IP:** `16.170.172.200`
**Status:** SURVEILLANCE MODE

---

## 1️⃣ SERVER LIVE-CHECK COMMANDS (Internal Ops)

**Run these inside the EC2 (`ssh ubuntu@16.170.172.200`):**

### Layer 1: Infrastructure
```bash
# 1. Docker Daemon Check
sudo systemctl is-active docker
# ✅ Expect: "active"

# 2. Open Ports Check
sudo ss -tuln | grep -E ':(80|443|8000)'
# ✅ Expect: 0.0.0.0:80, 0.0.0.0:443 (Nginx) and 0.0.0.0:8000 (Backend) if exposed locally
```

### Layer 2: Container Stack
```bash
# 3. Stack Status
cd ~/rythu-mitra-enterprise
sudo docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
# ✅ Expect: All 5 containers "Up" or "running"
```

### Layer 3: Application Logs
```bash
# 4. Backend Health Logs
sudo docker compose logs --tail=20 backend | grep "Listening at"
# ✅ Expect: "Listening at: http://0.0.0.0:8000"

# 5. Frontend Asset Service
sudo docker compose logs --tail=20 nginx | grep "GET /static"
# ✅ Expect: 200 OK responses
```

---

## 2️⃣ LIVE URL TESTS (External Verification)

**Run these from your LOCAL machine:**

### Test A: Public Web Access
```bash
curl -I http://16.170.172.200
```
*   **SUCCESS**: `HTTP/1.1 200 OK` (Content-Type: text/html)
*   **FAILURE**: `Connection Refused` (Nginx down) or `404` (Build missing).

### Test B: API Health
```bash
curl http://16.170.172.200/health/
```
*   **SUCCESS**: `{"status": "healthy"}`
*   **FAILURE**: `502 Bad Gateway` (Backend crashed/loading).

### Test C: AI Prediction (The "Money" Endpoint)
```bash
curl -X POST http://16.170.172.200/api/v1/ai/predict/ \
     -H "Content-Type: application/json" \
     -d '{"mode": "crop_recommendation", "data": {"N":90,"P":42,"K":43,"temperature":25,"humidity":60,"ph":6.5,"rainfall":200}}'
```
*   **SUCCESS**: JSON with `recommendations`.
*   **FAILURE**: `500 Internal Server Error` (ML Model fail) or `502` (Timeout).

---

## 3️⃣ ROOT CAUSE DETECTION MATRIX

If checks fail, match the symptom to the cause:

| Symptom | Probable Cause |
| :--- | :--- |
| **`Connection Refused`** | Nginx container is not running or Firewall (Security Group) blocks Port 80. |
| **`502 Bad Gateway`** | Nginx is Up, but Backend container is Down/Crashing. |
| **`500 Internal Error`** | Backend is Up, but Code has a bug or DB connection failed. |
| **`404 Not Found`** | Frontend build files were not copied to Nginx container. |
| **`FATAL: password auth`** | DB Password in `.env` does not match the actual Postgres volume data. |
| **`ModuleNotFoundError`** | `requirements.txt` changed but Docker image wasn't rebuilt. |

---

## 4️⃣ EXACT FIX COMMANDS

### 🔧 Fix Nginx (Gateway)
```bash
sudo docker compose up -d --force-recreate nginx
```

### 🔧 Fix Backend (Application)
```bash
# Full Rebuild to catch new dependencies
sudo docker compose build --no-cache backend
sudo docker compose up -d backend
```

### 🔧 Fix Database (Nuclear Reset)
**Warning: Deletes all data.**
```bash
sudo docker compose down
sudo docker volume rm rythu-mitra-enterprise_postgres_data
sudo docker compose up -d
```

### 🔧 Fix Missing .env
```bash
nano backend/.env
# Paste secrets
sudo docker compose restart backend
```

---

## 5️⃣ AUTO-HEAL BLOCK (Copy-Paste Solution)

**If you are panicked or stuck, run this entire block verbatim on the server:**

```bash
# >>> START AUTO-HEAL <<<
cd ~/rythu-mitra-enterprise

echo "🛑 STOPPING ALL SERVICES..."
sudo docker compose down --remove-orphans

echo "🧹 CLEANING CRASHED ARTIFACTS..."
sudo docker system prune -f

echo "🔄 ENSURING LATEST CODE..."
git fetch origin main
git reset --hard origin/main

echo "🏗️ FORCE REBUILDING STACK..."
sudo docker compose build --no-cache

echo "🚀 RELAUNCHING..."
sudo docker compose up -d

echo "⏳ WAITING FOR STABILIZATION (15s)..."
sleep 15

# Quick Validation
sudo docker compose ps
curl -I http://localhost
# >>> END AUTO-HEAL <<<
```

---

## 6️⃣ FINAL STATUS VERDICT

### 🟢 SERVER LIVE & HEALTHY
*   All containers `Up`.
*   `curl` to /health returns JSON.
*   Browser opens Dashboard.

### 🟡 SERVER UNSTABLE — ACTION NEEDED
*   Containers `Up` but `502` errors.
*   **Action**: Check logs (`sudo docker compose logs backend`).

### 🔴 SERVER DOWN — FIX APPLIED
*   `Connection Refused`.
*   **Action**: Run **AUTO-HEAL BLOCK** immediately.

**Guardian Status:** WATCHING. RUN CHECKS NOW.
