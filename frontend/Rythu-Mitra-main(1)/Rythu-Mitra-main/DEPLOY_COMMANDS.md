# Rythu Mitra - Final Deployment Commands

## 1. Launch AWS EC2 (Ubuntu 22.04)
# Open Ports: 22, 80, 443

## 2. Install Docker & Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
# Ensure valid `docker-compose` alias if needed, or use `docker compose`

## 3. Clone & Setup
git clone https://github.com/your-repo/rythu-mitra.git
cd rythu-mitra

# Create Env file (Paste your secrets)
nano backend/.env

## 4. Run Production Build
sudo docker compose -f deployment/docker-compose.yml up -d --build

## 5. SSL Interface
chmod +x deployment/setup_ssl.sh
sudo ./deployment/setup_ssl.sh

## 6. Verification
# Frontend: https://rythumitra.com
# Backend: https://rythumitra.com/api/v1/ai/predict/
# Check logs: sudo docker compose logs -f
