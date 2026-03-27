#!/bin/bash
# setup_ec2.sh
# Validated for Ubuntu 24.04 @ 16.170.172.200

set -e

echo "🚀 Rythu Mitra: Bootstrapping Production Environment..."

# 1. Update & Install
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

# 2. Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Docker Installation
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    echo "✅ Docker Present."
fi

# 4. Permissions
sudo usermod -aG docker ubuntu

# 5. Workspace
mkdir -p ~/rythu-mitra-enterprise
cd ~/rythu-mitra-enterprise

echo "✅ EC2 Setup Ready. Logout and login again to refresh groups."
