#!/bin/bash
# Quick Redeploy Script
echo "Pulling latest changes..."
git pull origin main

echo "Rebuilding containers..."
docker-compose up -d --build

echo "Pruning unused images..."
docker image prune -f

echo "✅ Update Deployed Successfully!"
