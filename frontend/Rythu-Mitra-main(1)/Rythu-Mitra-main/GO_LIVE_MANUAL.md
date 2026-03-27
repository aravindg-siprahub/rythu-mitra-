# 🚀 RYTHU MITRA GO-LIVE MANUAL

**Target Server:** `16.170.172.200` (eu-north-1)
**Role:** Go-Live Supervisor
**Status:** **READY FOR LAUNCH**

---

## 1️⃣ FINAL_LAUNCH_STEPS

**Execute these steps in EXACT order.**

### Phase 1: GitHub Configuration
1.  **Create Repository**:
    *   Go to GitHub -> New Repository -> Name: `rythu-mitra-enterprise` -> Private.
2.  **Add Secrets**:
    *   Go to **Settings > Secrets and variables > Actions**.
    *   Add the following **6 CRITICAL SECRETS**:

| Secret Name | Value Example | Description |
|:---|:---|:---|
| `EC2_HOST` | `16.170.172.200` | Your Public IP |
| `EC2_USER` | `ubuntu` | Server Username |
| `EC2_SSH_KEY` | *(Paste content of rythu_1.pem)* | Private Key |
| `DOCKERHUB_USERNAME` | `your_docker_user` | For Registry Access |
| `DOCKERHUB_PASSWORD` | `dckr_pat_...` | Docker Access Token |
| `BACKEND_ENV` | *(Copy from backend/.env)* | Production Variables |

### Phase 2: Server Provisioning
3.  **SSH into EC2 (Local Terminal)**:
    ```bash
    chmod 400 rythu_1.pem
    ssh -i rythu_1.pem ubuntu@16.170.172.200
    ```
4.  **Run Setup Script (On EC2)**:
    ```bash
    # Create the setup file
    nano setup_ec2.sh
    # [PASTE content from deployment/setup_ec2.sh]
    # Save (Ctrl+O, Enter) and Exit (Ctrl+X)
    
    chmod +x setup_ec2.sh
    ./setup_ec2.sh
    
    # ⚠️ CRITICAL: Log out and log back in to apply Docker permissions
    exit
    ssh -i rythu_1.pem ubuntu@16.170.172.200
    ```

### Phase 3: Trigger Deployment
5.  **Push Code (Local Terminal)**:
    ```bash
    git init
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/rythu-mitra-enterprise.git
    git add .
    git commit -m "🚀 PREPARING FOR LIFTOFF: v1.0 Launch"
    git push -u origin main
    ```
6.  **Monitor**:
    *   Go to GitHub Repo -> **Actions** tab.
    *   Watch **"Deploy to EC2"** workflow.
    *   Wait for **Green Checkmark** (approx 3-5 mins).

---

## 2️⃣ LIVE_VALIDATION_COMMANDS

**Run these from your Local Terminal or SSH session to confirm success.**

### A. System Health Check
```bash
# 1. Check API Health Endpoint
curl -I http://16.170.172.200/health/
# ✅ Expected: HTTP/1.1 200 OK

# 2. Check Frontend Load
curl -I http://16.170.172.200/
# ✅ Expected: HTTP/1.1 200 OK (Serving React)
```

### B. Container Status (SSH Required)
```bash
ssh -i rythu_1.pem ubuntu@16.170.172.200 "cd ~/rythu-mitra-enterprise && sudo docker compose ps"
```
**✅ Expected Output:**
- `nginx` ... `Up` (0.0.0.0:80->80/tcp)
- `backend` ... `Up` (8000/tcp)
- `frontend` ... `Up` (80/tcp)
- `db` ... `Up` (5432/tcp)
- `redis` ... `Up` (6379/tcp)

### C. Log Verification
```bash
# View Real-time Nginx Logs
ssh -i rythu_1.pem ubuntu@16.170.172.200 "cd ~/rythu-mitra-enterprise && sudo docker compose logs -f nginx"
```

---

## 3️⃣ SSL_ACTIVATION_STEPS

**Execute ONLY after `http://(domain)` is working.**

1.  **Ensure DNS Propagation**:
    *   `rythumitra.com` -> `A Record` -> `16.170.172.200`
    *   `www.rythumitra.com` -> `CNAME` -> `rythumitra.com`

2.  **Run Certbot (On EC2)**:
    ```bash
    cd ~/rythu-mitra-enterprise
    sudo ./deployment/setup_ssl.sh
    # Follow prompts if interactive, or watch for "Congratulations!"
    ```

3.  **Enforce HTTPS**:
    *   Open `nginx.conf`: `nano nginx.conf`
    *   **Uncomment** the `server { listen 443 ssl ... }` block.
    *   **Uncomment** the `return 301 https://...` line in port 80 block.
    *   Apply changes:
        ```bash
        sudo docker compose restart nginx
        ```

4.  **Verify HTTPS**:
    ```bash
    curl -I https://rythumitra.com
    # ✅ Expected: HTTP/1.1 200 OK
    ```

---

## 4️⃣ DOMAIN_BINDING_GUIDE

If you haven't bought `rythumitra.com`, use a free domain or Cloudflare:

1.  **Register Domain**: Go to Namecheap / GoDaddy / Freenom.
2.  **DNS Management**:
    *   **Type**: `A`
    *   **Host**: `@`
    *   **Value**: `16.170.172.200`
    *   **TTL**: `Automatic` or `1 min`
3.  **Cloudflare (Recommended)**:
    *   Point Nameservers to Cloudflare.
    *   In Cloudflare DNS, set **Proxy Status:** `DNS Only` (Grey Cloud) for initial Certbot setup.
    *   After SSL is generated, switch to `Proxied` (Orange Cloud) for CDN/Protection.

---

## 5️⃣ POST_DEPLOYMENT_HARDENING

Apply these immediately after launch:

1.  **Database Backups**:
    ```bash
    # Add to crontab
    0 2 * * * docker exec rythu-mitra-enterprise-db-1 pg_dump -U postgres rythu_mitra > /home/ubuntu/backups/db_$(date +\%F).sql
    ```

2.  **Auto-Restart**:
    *   Docker containers are set to `restart: always`.
    *   Ensure Docker daemon starts on boot:
        ```bash
        sudo systemctl enable docker
        ```

3.  **Cleanup**:
    ```bash
    # Remove unused images to save space
    sudo docker image prune -a -f
    ```

---

## 6️⃣ NEXT_UPGRADE_OPTIONS

1.  **Scaling**: Move from `docker-compose` to **AWS ECS (Fargate)** for auto-scaling based on CPU load.
2.  **Storage**: Move static/media files from EC2 volume to **AWS S3** + CloudFront.
3.  **Database**: Migrate PostgreSQL from container to **AWS RDS** for managed reliability.

---

**🏁 END OF MANUAL**
*Rythu Mitra Enterprise OS is Ready for the World.*
