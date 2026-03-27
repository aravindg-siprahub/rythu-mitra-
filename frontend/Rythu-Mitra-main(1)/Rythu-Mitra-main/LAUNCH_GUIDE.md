# 🚀 Rythu Mitra: FAANG-Grade Production Launch Guide

This manual covers the end-to-end deployment of the validated system to AWS EC2.

## 📋 Prerequisites
- **AWS Account** (Free Tier is fine).
- **Domain Name** (Purchased or Free via Freenom).
- **Cloudflare Account** (Recommended for DNS/SSL).
- **GitHub Repository** with this code pushed.

---

## 1️⃣ AWS Infrastructure Setup
1. **Launch Instance**:
   - **OS**: Ubuntu 22.04 LTS (x86_64)
   - **Type**: `t3.medium` (Recommended) or `t2.medium`
   - **Storage**: 30GB gp3 root volume
   - **Security Group**: Allow Ports `22`, `80`, `443` (0.0.0.0/0)

2. **Connect**:
   ```bash
   ssh -i "your-key.pem" ubuntu@<your-ec2-ip>
   ```

---

## 2️⃣ One-Click Deployment
We have automated the entire provisioning process.

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/rythu-mitra.git
   cd rythu-mitra
   ```

2. **Secure Environment Variables**:
   ```bash
   nano backend/.env
   # Paste content from the provided production .env template
   # Ensure DEBUG=False and change SECRET_KEY
   ```

3. **Run Master Launch Script**:
   ```bash
   chmod +x deployment/launch_rythu_mitra.sh
   sudo ./deployment/launch_rythu_mitra.sh
   ```
   *This script installs Docker, Hardens Firewall, Sets up Monitoring, Bootstraps AI Models, and Starts Containers.*

---

## 3️⃣ Domain & SSL Configuration
### Option A: Cloudflare (Easiest & Fastest)
1. Add your site to Cloudflare.
2. Update Nameservers at your Registrar.
3. In Cloudflare Dashboard > DNS:
   - Type `A`, Name `@`, Content `<EC2-Public-IP>`, Proxy Status `Proxied`.
   - Type `CNAME`, Name `www`, Content `@`, Proxy Status `Proxied`.
4. In SSL/TLS > Overview: Set to **Full**.
5. Live URL: `https://rythumitra.com` (Auto-secured by Cloudflare Edge).

### Option B: Certbot (Direct EC2 SSL)
If not using Cloudflare Proxy:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d rythumitra.com -d www.rythumitra.com
```

---

## 4️⃣ Continuous Integration (CI/CD)
A GitHub Actions workflow is included in `.github/workflows/deploy.yml`.

**To Activate**:
1. Go to GitHub Repo > Settings > Secrets > Actions.
2. Add:
   - `EC2_HOST`: Your Public IP
   - `EC2_SSH_KEY`: Content of your .pem key
   - `DOCKERHUB_USERNAME` / `TOKEN`: For registry access
3. Push to `main` -> **Auto-Deploys in ~3 mins**.

---

## 5️⃣ Verification Checklist
- [ ] **Frontend**: https://rythumitra.com loads Dashboard.
- [ ] **API**: `https://rythumitra.com/api/v1/ai/predict/` returns Method Not Allowed (GET) or Valid Response (POST).
- [ ] **Health**: `https://rythumitra.com/health/` returns `{"status": "healthy"}`.
- [ ] **AI Inference**: Valid Crop/Disease prediction in <1s.
- [ ] **Monitoring**: CPU usage visible in CloudWatch.

---

## 🛡️ Security Audit (FAANG Standard)
- **Firewall**: UFW active, only 22/80/443 allowed.
- **Nginx**: Rate limiting enabled (`10r/s`), XSS/Frame protection headers active.
- **Secrets**: Not committed to git, living in `.env`.
- **Least Privilege**: Application runs as non-root (inside container).

**🚀 SYSTEM IS LIVE AND PRODUCTION READY.**
