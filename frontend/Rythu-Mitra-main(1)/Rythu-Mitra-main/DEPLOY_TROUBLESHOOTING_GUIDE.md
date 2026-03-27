# 🩺 RYTHU MITRA: DEPLOYMENT TROUBLESHOOTING & VERIFICATION

## 1️⃣ LIVE HEALTH CHECK COMMANDS
Run these inside your EC2 instance (`ssh ubuntu@<IP>`) to verify system status.

### Backend Health
```bash
# Check if Django replies to Health Check (Internal)
docker compose exec backend curl -f http://localhost:8000/health/
# Expected: {"status": "healthy", ...}
```

### Frontend Health
```bash
# Check if Nginx is serving the React App (Internal)
curl -I http://localhost:80
# Expected: HTTP/1.1 200 OK
```

### AI Prediction Endpoint
```bash
# Test a mock prediction
curl -X POST http://localhost/api/v1/ai/predict/ \
     -H "Content-Type: application/json" \
     -d '{"mode": "crop_recommendation", "data": {"N":90,"P":40,"K":40}}'
# Expected: JSON response with recommendations
```

### Database & Cache
```bash
# Postgres Connectivity
docker compose exec backend ncat -zv db 5432
# Expected: Connection refused vs Open (Should be Open inside network)

# Redis PING
docker compose exec redis redis-cli ping
# Expected: PONG
```

### Container Status
```bash
docker compose ps
# Expected: All services (nginx, backend, frontend, db, redis) -> "Up"
```

---

## 2️⃣ FAILURE DIAGNOSIS (Top 10 Prediction)

| Symptom | Probable Cause | Fix Command |
| :--- | :--- | :--- |
| `ERR_CONNECTION_REFUSED` | Nginx container is down or AWS Security Group blocks Port 80. | `docker compose up -d nginx` OR Check AWS Security Groups. |
| `502 Bad Gateway` | Backend container is crashing or not ready. | `docker compose logs backend` (Fix python errors). |
| `CrashLoopBackOff` (DB) | Volume permission issue or OOM. | `docker compose down -v` (reset) OR Check swap (`free -h`). |
| `OperationalError: connection...` | Django starting before DB is ready. | Wait 30s. Docker `healthcheck` in compose file handles this. |
| `ModuleNotFoundError` | `requirements.txt` likely changed but image not rebuilt. | `docker compose up -d --build backend` |
| `React Screen Blank` | Frontend build failed or Nginx config incorrect. | `docker compose logs frontend` |
| `CSRF Failed` | `ALLOWED_HOSTS` or `CSRF_TRUSTED_ORIGINS` mismatch. | Edit `backend/.env`, add public IP/Domain. Restart backend. |
| `Disk Full` | Docker images utilized all space. | `docker system prune -a -f` |
| `Permission Denied` (Docker) | User `ubuntu` not in `docker` group. | `sudo usermod -aG docker ubuntu` then re-login. |
| `GitHub Actions Failure` | SSH Key invalid or Secrets missing. | Update GitHub Secrets (`EC2_SSH_KEY`). |

---

## 3️⃣ SELF-HEALING COMMANDS

### 🚑 Nginx Failure Fix
```bash
# Test config configuration
docker compose exec nginx nginx -t
# Reload
docker compose exec nginx nginx -s reload
# Hard Restart
docker compose restart nginx
```

### 🚑 Backend Crash Fix
```bash
# Rebuild without cache
docker compose build --no-cache backend
docker compose up -d backend
```

### 🚑 Database Hard Reset (Caution: Deletes Data)
```bash
docker compose down
docker volume rm rythu-mitra-enterprise_postgres_data
docker compose up -d
```

### 🚑 Fix Docker Socket Permissions
```bash
sudo chmod 666 /var/run/docker.sock
```

---

## 4️⃣ FINAL LAUNCH VERIFICATION CHECKLIST

1.  [ ] **Public URL**: `http://<YOUR_EC2_IP>` loads the Rythu Mitra Dashboard.
2.  [ ] **API Health**: `http://<YOUR_EC2_IP>/health/` returns `{"status": "healthy"}`.
3.  [ ] **AI Model**: submitting data on `/crop-recommendation` returns a result card.
4.  [ ] **HTTPS**: (If SSL setup) `https://<YOUR_DOMAIN>` works with valid lock icon.

**If all checked:** 🚀 **SYSTEM IS GO FOR LAUNCH.**
