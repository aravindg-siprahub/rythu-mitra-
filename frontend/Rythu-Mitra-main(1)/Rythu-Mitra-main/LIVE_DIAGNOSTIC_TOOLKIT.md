# 🏥 LIVE DIAGNOSTIC TOOLKIT & REPAIR GUIDE
**Target:** `16.170.172.200` | **Status:** 🔴 **UNREACHABLE** (Connection Refused)

---

## 🟥 PROBABLE_FAILURE_CAUSES (Why is it down?)
Based on the failed connection check, the likely causes are:
1.  **Security Group**: AWS Firewall blocking Port 80.
2.  **App Not Started**: You haven't run `setup_ec2.sh` or `git push` yet.
3.  **Nginx Crash**: The reverse proxy container exists but exited.
4.  **IP Change**: EC2 was rebooted and got a new Public IP (less likely if static).

---

## 1️⃣ HEALTH_CHECK_COMMANDS
**Run these on your EC2 (`ssh -i rythu_1.pem ubuntu@16.170.172.200`)**:

### Step A: Is Docker Running?
```bash
sudo systemctl status docker
# Expected: "Active: active (running)"
# If Inactive: sudo systemctl start docker
```

### Step B: Are Containers Up?
```bash
cd ~/rythu-mitra-enterprise
sudo docker compose ps
# Expected: 5 services "Up"
# If Empty: You haven't deployed yet! Run Phase 2/3 from GO_LIVE_MANUAL.
```

### Step C: What do the Logs Say?
```bash
# Check Nginx (The Gatekeeper)
sudo docker compose logs --tail=50 nginx

# Check Backend (The Brain)
sudo docker compose logs --tail=50 backend
```

---

## 2️⃣ FIX_COMMANDS (The Repair Kit)

### Option A: "I haven't deployed yet"
If `docker compose ps` is empty, you skipped the launch!
1.  **Local**: `git push -u origin main`
2.  **Wait**: 3 minutes for GitHub Actions.

### Option B: "Containers are crashing"
If State is `Restarting` or `Exited`:
```bash
# Force Rebuild & Restart
sudo docker compose down
sudo docker compose up -d --build --force-recreate
```

### Option C: "AWS Firewall Issue"
If containers are `Up` but you can't connect:
1.  Go to **AWS Console > EC2 > Security Groups**.
2.  Find the group attached to `i-043ec95747f8cd64f`.
3.  **Edit Inbound Rules**:
    *   Add **HTTP (80)** -> `0.0.0.0/0`
    *   Add **HTTPS (443)** -> `0.0.0.0/0`
    *   Add **SSH (22)** -> `Your IP`
4.  Save Rules.

---

## 3️⃣ 5-MINUTE_RECOVERY_PLAN (Nuclear Option)
If nothing works, execute this **full reset** on the EC2:

```bash
#!/bin/bash
# Nuke it all
cd ~/rythu-mitra-enterprise
sudo docker compose down -v
sudo docker system prune -a -f

# Pull Fresh
git pull origin main
sudo docker compose pull

# Restart
sudo docker compose up -d

# Verify
curl -v http://localhost/health/
```

---

## 4️⃣ FINAL_LAUNCH_REPORT (Fill this out)
*   **Public URL**: `http://16.170.172.200`
*   **API Health**: `http://16.170.172.200/health/`
*   **Verdict**: [ ] LIVE [ ] OFFLINE

**Status:** Diagnosed as **OFFLINE**. Immediate action required on EC2/AWS Console.
