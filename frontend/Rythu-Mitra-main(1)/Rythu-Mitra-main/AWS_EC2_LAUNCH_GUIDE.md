# 🚜 Rythu Mitra: AWS EC2 Launch Guide
**Target Architecture:** Production-Ready Full Stack Host
**OS:** Ubuntu 24.04 LTS | **Region:** eu-north-1 (Stockholm)

---

## 1️⃣ EC2_SETUP_STEPS

Follow these steps exactly in the AWS Console:

1.  **Launch Instance**: Click "Launch Instances" in **eu-north-1**.
2.  **Name**: `Rythu-Mitra-Prod`
3.  **Application and OS Images (AMI)**:
    *   Select **Ubuntu**.
    *   AMI: **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit (x86)).
4.  **Instance Type**:
    *   Select **t3.micro** (2 vCPU, 1 GiB Memory).
5.  **Key Pair**:
    *   Click "Create new key pair".
    *   Name: `rythu_mitra_prod_key`.
    *   Type: `RSA`.
    *   Format: `.pem`.
    *   **Download and Save** this file immediately.
6.  **Network Settings**:
    *   VPC: Default.
    *   Auto-assign public IP: **Enable** (Crucial).
    *   **Security Group**: "Create security group".
    *   Name: `rythu-mitra-sg`.
    *   Description: `Web Traffic and SSH`.
7.  **Configure Storage**:
    *   Change `8 GiB` to **20 GiB**.
    *   Root volume type: **gp3**.
8.  **Launch**: Click "Launch Instance".

---

## 2️⃣ SECURITY_GROUP_RULES

In the Network Settings step (or verify after launch under Security tab -> Security Groups):

| Type | Protocol | Port Range | Source | Description |
|:---|:---|:---|:---|:---|
| **SSH** | TCP | 22 | `0.0.0.0/0` | Remote Access (Restrict to your IP `My IP` for better security if static) |
| **HTTP** | TCP | 80 | `0.0.0.0/0` | Public Web Traffic |
| **HTTPS** | TCP | 443 | `0.0.0.0/0` | SSL Web Traffic |

---

## 3️⃣ POST_LAUNCH_SCRIPT

**Instructions**:
1.  SSH into your new instance: `ssh -i rythu_mitra_prod_key.pem ubuntu@<PUBLIC_IP>`
2.  Create this script: `nano init_server.sh`
3.  Paste the content below.
4.  Run: `chmod +x init_server.sh && ./init_server.sh`

```bash
#!/bin/bash
# init_server.sh
# Production Initialization for Rythu Mitra (Ubuntu 24.04)

set -e

echo "🚀 Starting Production Server Initialization..."

# 1. System Updates
echo "📦 Updating System..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# 2. Swap Setup (CRITICAL for t3.micro)
# t3.micro has 1GB RAM. We need 2GB Swap to prevent Docker OOM crashes.
echo "💾 Configuring Swap Memory..."
if ! grep -q "swapfile" /etc/fstab; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ 2GB Swap Active."
else
    echo "✅ Swap already configured."
fi

# 3. Docker Installation
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    echo "✅ Docker already installed."
fi

# 4. User Permissions (Docker without sudo)
echo "🔑 Configuring Permissions..."
sudo usermod -aG docker ubuntu

# 5. Firewall Setup
echo "🛡️ Configuring UFW Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Enable non-interactive
sudo ufw --force enable

# 6. Deployment Directory
echo "📂 Setting up Workspace..."
mkdir -p ~/rythu-mitra-enterprise
# Ensure GitHub Actions SSH user can write here
sudo chown -R ubuntu:ubuntu ~/rythu-mitra-enterprise

echo "✨ Server Initialization Complete!"
echo "⚠️  PLEASE LOG OUT AND LOG BACK IN FOR DOCKER PERMISSIONS TO TAKE EFFECT."
```

---

## 4️⃣ VALIDATION_COMMANDS

After running the script and re-logging in, verify everything:

1.  **Check Docker & Compose**:
    ```bash
    docker --version
    docker compose version
    # Should output versions without needing 'sudo'
    ```

2.  **Check Swap**:
    ```bash
    free -h
    # Look for 'Swap' row. Should show ~2.0Gi
    ```

3.  **Check Firewall**:
    ```bash
    sudo ufw status
    # Status: active. Ports 22, 80, 443 ALLOW.
    ```

4.  **Check Connectivity**:
    ```bash
    curl -v http://google.com
    # Should connect (outbound verify)
    ```

---

## 5️⃣ READY_FOR_DEPLOY

If all checks pass, you are ready to:
1.  **Add Secrets to GitHub**:
    *   `EC2_HOST`: (Your New Public IP)
    *   `EC2_SSH_KEY`: (Content of `rythu_mitra_prod_key.pem`)
    *   `EC2_USER`: `ubuntu`
2.  **Push to Main**:
    *   GitHub Actions will now successfully deploy to this machine.

**End of Guide.**
