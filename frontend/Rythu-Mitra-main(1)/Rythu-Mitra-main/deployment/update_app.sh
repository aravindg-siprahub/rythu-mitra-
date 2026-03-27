#!/bin/bash
# update_app.sh

echo "🔄 Updating Rythu Mitra..."
cd ~/rythu-mitra-enterprise

# Sync
git pull origin main

# Docker Refresh
sudo docker compose pull
sudo docker compose up -d --remove-orphans
sudo docker system prune -f

echo "✅ App Updated."
