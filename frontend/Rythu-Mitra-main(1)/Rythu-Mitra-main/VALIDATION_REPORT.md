# Rythu Mitra Production Validation

## 🚀 Live Endpoints (After Deployment)
- **Frontend App**: `https://rythumitra.com`
- **API Gateway**: `https://rythumitra.com/api/v1/ai/predict/`
- **Health Check**: `https://rythumitra.com/health/`

## 🧪 Verification Commands

### 1. Check System Health
```bash
curl -k https://rythumitra.com/health/
# Expected: {"status": "healthy", "version": "1.0.0"}
```

### 2. Test AI Prediction (Crop)
```bash
curl -X POST https://rythumitra.com/api/v1/ai/predict/ \
     -H "Content-Type: application/json" \
     -d '{"mode": "crop_recommendation", "data": {"N": 90, "P": 40, "K": 40, "temperature": 25, "humidity": 60, "ph": 6.5, "rainfall": 200}}'
```

### 3. Test Market Forecast
```bash
curl -X POST https://rythumitra.com/api/v1/ai/predict/ \
     -H "Content-Type: application/json" \
     -d '{"mode": "market_forecast", "data": {"crop": "Rice", "region": "Telangana"}}'
```

### 4. Worker Simulation
```bash
curl https://rythumitra.com/api/v1/workers/availability/?region=Telangana
```

## 📋 Pre-Launch Checklist
- [ ] `backend/.env` created with `DEBUG=False`.
- [ ] `setup_ssl.sh` ran successfully (Certbot).
- [ ] Docker containers are `Up` (`docker ps`).
- [ ] Nginx logs show `200 OK` for traffic.
