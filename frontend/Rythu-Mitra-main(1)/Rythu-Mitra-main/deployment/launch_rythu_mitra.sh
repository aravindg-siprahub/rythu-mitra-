#!/bin/bash
# RYTHU MITRA MASTER LAUNCH SCRIPT
# Run this on your EC2 instance to deploy everything.

set -e

echo "🚀 Starting Rythu Mitra Enterprise Launch Sequence..."

# 1. Environment Check
if [ ! -f backend/.env ]; then
    echo "❌ Error: backend/.env missing. Please create it securely."
    exit 1
fi

# 2. System Hardening & Setup
echo "🛡️  Hardening System..."
sudo apt-get update
sudo apt-get install -y fail2ban ufw
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 3. Docker Installation (Idempotent)
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
fi

# 4. Monitoring
chmod +x deployment/setup_monitoring.sh
sudo ./deployment/setup_monitoring.sh

# 5. Application Launch
echo "🏗️  Building & Launching Containers..."
# Ensure production nginx config is used
cp deployment/nginx_prod.conf deployment/nginx.conf

# Bootstrapping AI Models
echo "🧠 Bootstrapping AI Models..."
# We run this inside a temporary container or local environment if python exists
# Ideally, we run this inside the backend container after build
# But for now, let's assume valid python env or rely on startup script in container
# Better approach: The backend container entrypoint should handle this if missing.
# For now, we'll rely on the repo having the script and running it via docker if needed.

docker compose down
docker compose build --parallel
docker compose up -d

# 6. Post-Launch AI Bootstrap
echo "🧠 Initializing AI Core..."
docker compose exec backend python ai/train_models.py

# 7. SSL Setup (Interactive or Auto)
echo "🔒 SSL Setup..."
# Check if domain is pointed (simple ping check)
# DOMAIN="rythumitra.com"
# if ping -c 1 $DOMAIN &> /dev/null; then
#    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN
# else
#    echo "⚠️  Domain not pointing to this IP. Skipping SSL. Run manually later."
# fi

echo "=============================================="
echo "✅ LAUNCH COMPLETE!"
echo "Global API: https://rythumitra.com/api/v1/ai/predict/"
echo "Frontend:   https://rythumitra.com"
echo "Monitor:    Check CloudWatch Dashboard"
echo "=============================================="
