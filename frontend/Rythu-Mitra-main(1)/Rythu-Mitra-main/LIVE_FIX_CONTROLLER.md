# ⚡ LIVE-FIX CONTROLLER: 16.170.172.200
**Role:** Immediate Response & Repair

---

## 1️⃣ FAST DIAGNOSTIC COMMANDS (Run via SSH)

1.  **Check Docker Daemon**: `sudo systemctl status docker`
2.  **Check Container State**: `cd ~/rythu-mitra-enterprise && sudo docker compose ps`
3.  **Check Open Ports**: `sudo ss -tuln | grep -E ':(80|443|8000)'`
4.  **Backend Logs**: `sudo docker compose logs --tail=20 backend`
5.  **Nginx Logs**: `sudo docker compose logs --tail=20 nginx`
6.  **Frontend Logs**: `sudo docker compose logs --tail=20 frontend`
7.  **Internal API Check**: `curl -v http://localhost/health/`
8.  **Public IP Check**: `curl -I http://16.170.172.200`
9.  **Disk Space**: `df -h`
10. **Memory/Swap**: `free -h`

---

## 2️⃣ DIAGNOSIS LOGIC

| Result | Verdict | Exact Cause |
| :--- | :--- | :--- |
| **`docker compose ps` empty** | **NO** | Code not deployed or `deploy_full_stack.sh` skipped. |
| **Containers "Exit"** | **NO** | Crash loop. Check logs (usually DB password or missing build). |
| **Ports 80/443 missing** | **NO** | Nginx failed to bind (Port conflict or Config error). |
| **`curl localhost` fails** | **NO** | Nginx running but backend upstream is down (502 Gateway). |
| **`curl public IP` fails** | **NO** | AWS Security Group blocking Port 80, or IP changed. |
| **ALL PASS** | **YES** | System is LIVE. |

---

## 3️⃣ SELF-HEAL COMMAND BLOCK (Copy & Paste to Fix ALL)

```bash
# >>> START HEALING <<<
cd ~/rythu-mitra-enterprise

# 1. Stop & Clean
echo "🛑 STOPPING..."
sudo docker compose down --remove-orphans
sudo docker system prune -f

# 2. Reset Code
echo "🔄 SYNCING..."
git fetch origin main
git reset --hard origin/main

# 3. Ensure Permissions
echo "🔑 FIXING PERMISSIONS..."
chmod +x deployment/*.sh

# 4. Rebuild & Launch
echo "🚀 REBUILDING..."
sudo docker compose build --no-cache
sudo docker compose up -d

# 5. Wait for Database
echo "⏳ INITIALIZING (15s)..."
sleep 15

# 6. Verify Status
sudo docker compose ps
# >>> END HEALING <<<
```

---

## 4️⃣ FINAL VALIDATION COMMANDS

1.  **Frontend Reachability**:
    ```bash
    curl -I http://16.170.172.200
    # Expected: HTTP/1.1 200 OK
    ```

2.  **API Health**:
    ```bash
    curl http://16.170.172.200/health/
    # Expected: {"status": "healthy"}
    ```

3.  **AI Prediction (Mock)**:
    ```bash
    curl -X POST http://16.170.172.200/api/v1/ai/predict/ \
      -H "Content-Type: application/json" \
      -d '{"mode": "crop_recommendation", "data": {"N":90}}'
    # Expected: JSON Response
    ```
