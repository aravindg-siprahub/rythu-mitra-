#!/bin/bash
# self_heal.sh
# Emergency Recovery Script looking for trouble? Run me.

set -e

echo "🚑 RYTHU MITRA SELF-HEAL PROTOCOL STARTED"
APP_DIR=~/rythu-mitra-enterprise

if [ ! -d "$APP_DIR" ]; then
    echo "❌ App directory $APP_DIR not found!"
    exit 1
fi

cd $APP_DIR

# 1. Stop Everything
echo "🛑 Stopping Containers..."
sudo docker compose down --remove-orphans

# 2. Clear Networks/Cache
echo "🧹 Cleaning Network/Cache..."
sudo docker network prune -f
sudo docker system prune -f

# 3. Pull & Rebuild
echo "🔄 Updating & Rebuilding..."
git fetch origin main
git reset --hard origin/main
sudo docker compose build --no-cache

# 4. Restart
echo "🚀 Restarting Stack..."
sudo docker compose up -d

# 5. Check Health
echo "🏥 Health Check..."
sleep 10
if sudo docker compose ps | grep "Up"; then
    echo "✅ SYSTEM RESTORED. Services are Up."
else
    echo "❌ SYSTEM CRITICAL. Services failed to start. Check logs."
    exit 1
fi
