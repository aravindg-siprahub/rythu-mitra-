#!/bin/bash
# deploy_full_stack.sh
# MASTER DEPLOYMENT SCRIPT for Rythu Mitra Enterprise OS
# Compatible with Ubuntu 24.04 LTS (t3.micro)

set -e

APP_DIR=~/rythu-mitra-enterprise
REPO_URL="https://github.com/YOUR_GITHUB_USERNAME/rythu-mitra-enterprise.git" # REPLACE THIS

echo "🚜 STARTING RYTHU MITRA FULL STACK DEPLOYMENT..."

# ====================================================
# 1. SYSTEM PREP & SWAP (Critical for t3.micro)
# ====================================================
echo "📦 Updating System & Installing Dependencies..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw net-tools

echo "💾 Configuring 2GB Swap (Prevents OOM Crashes)..."
if ! grep -q "swapfile" /etc/fstab; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo "✅ Swap Created."
else
    echo "✅ Swap already exists."
fi

# ====================================================
# 2. FIREWALL (UFW)
# ====================================================
echo "🛡️ Configuring Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
echo "✅ Firewall Active."

# ====================================================
# 3. DOCKER INSTALLATION
# ====================================================
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker ubuntu
    echo "✅ Docker Installed."
else
    echo "✅ Docker already present."
fi

# ====================================================
# 4. CODEBASE SETUP
# ====================================================
echo "📂 Setting up Application Directory..."
if [ -d "$APP_DIR" ]; then
    echo "   Directory exists. Pulling latest code..."
    cd $APP_DIR
    # Handle explicit git dir if needed, mainly relying on git pull if initialized
    if [ -d ".git" ]; then
        git pull origin main
    else
        echo "⚠️  Repo directory exists but no .git found. Skipping pull."
    fi
else
    echo "   Cloning Repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# ====================================================
# 5. ENVIRONMENT VARIABLES
# ====================================================
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env is missing!"
    echo "   Creating template .env..."
    mkdir -p backend
    cat <<EOF > backend/.env
DEBUG=False
SECRET_KEY=change_this_in_production_$(openssl rand -hex 12)
ALLOWED_HOSTS=localhost,127.0.0.1,$(curl -s ifconfig.me)
DB_HOST=db
REDIS_URL=redis://redis:6379
EOF
    echo "✅ Template .env created. PLEASE EDIT IT with real secrets."
fi

# ====================================================
# 6. DOCKER DEPLOYMENT
# ====================================================
echo "🚀 Building and Starting Containers..."

# Force build to ensure latest code is used
sudo docker compose build

# Start services
sudo docker compose up -d --remove-orphans

# Prune to save space
sudo docker image prune -f

# ====================================================
# 7. VERIFICATION
# ====================================================
echo "🔍 Verifying Deployment..."
sleep 10 # Give containers a moment to boot

if sudo docker compose ps | grep "Up"; then
    echo "✅ Containers are UP."
else
    echo "❌ Containers failed to start. Check logs."
    exit 1
fi

echo "🎉 DEPLOYMENT COMPLETE!"
echo "👉 Access your app at: http://$(curl -s ifconfig.me)"
