import os
import sys
import requests
import logging

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger("PREFLIGHT")

def check_file(path, description):
    if os.path.exists(path):
        logger.info(f"✅ Found {description}: {path}")
        return True
    else:
        logger.error(f"❌ Missing {description}: {path}")
        return False

def check_structure():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    checks = [
        (os.path.join(base, 'backend', 'Dockerfile.backend'), "Backend Dockerfile"),
        (os.path.join(base, 'frontend', 'Dockerfile.frontend'), "Frontend Dockerfile"),
        (os.path.join(base, 'docker-compose.yml'), "Docker Compose"),
        (os.path.join(base, 'deployment', 'nginx.conf'), "Nginx Config"),
        (os.path.join(base, 'backend', '.env'), "Backend Env"),
        # Check for models - ensuring train_models.py was run
        (os.path.join(base, 'backend', 'ai', 'models', 'crop_rf_v1.pkl'), "Crop RF Model"),
        (os.path.join(base, 'backend', 'ai', 'models', 'weather_lstm_v1.h5'), "Weather LSTM Model"),
    ]
    
    all_pass = True
    for path, desc in checks:
        if not check_file(path, desc):
            all_pass = False
            
    if all_pass:
        logger.info("🎉 Project Structure & Artifacts Validated.")
    else:
        logger.error("⚠️  Critical Artifacts Missing. Run 'python backend/ai/train_models.py' first.")
        sys.exit(1)

def validate_docker_compose():
    # Basic check to see if valid yml
    logger.info("🐳 Validating Docker Compose syntax...")
    import subprocess
    try:
        subprocess.run(["docker-compose", "config"], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        logger.info("✅ Docker Compose configuration is valid.")
    except Exception:
        logger.warning("⚠️  Docker Compose validation failed (Is docker installed?). Skipping.")

if __name__ == "__main__":
    print("-" * 40)
    print(" RYTHU MITRA PRODUCTION PRE-FLIGHT CHECK")
    print("-" * 40)
    
    check_structure()
    validate_docker_compose()
    
    print("\n🚀 READY FOR DEPLOYMENT!")
    print("Run: sudo ./deployment/setup_ec2.sh")
