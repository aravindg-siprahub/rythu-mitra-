# Rythu Mitra Public API Documentation

**Version:** v1.0.0  
**Base URL:** `https://rythumitra.com/api/v1`

## Authentication
All API requests require an API Key or JWT Token in the header.
`Authorization: Bearer <your-token>`

---

## 1. AI Predictions
### Unified Prediction Endpoint
**POST** `/ai/predict/`

**Description**: Main gateway for all AI services.

**Headers**:
- `Content-Type: application/json`

**Body Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | One of: `crop_recommendation`, `weather_forecast`, `market_forecast`, `profit_optimizer` |
| `data` | object | Yes | Input data specific to the mode. |

#### A. Crop Recommendation
**Mode**: `crop_recommendation`
**Data Payload**:
```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 25.5,
  "humidity": 60,
  "ph": 6.5,
  "rainfall": 200
}
```
**Response**:
```json
{
  "status": "success",
  "recommendations": [
    {"crop": "Rice", "confidence": 98.2},
    {"crop": "Coconut", "confidence": 12.5}
  ]
}
```

#### B. Disease Detection
**Mode**: `disease_detection` (Multipart Form Data)
**Field**: `image` (File)
**Response**:
```json
{
  "disease": "Tomato___Early_blight",
  "confidence": 96.5,
  "severity": "High",
  "recommendation": "Use Mancozeb fungicide."
}
```

#### C. Hyperlocal Weather
**Mode**: `weather_forecast`
**Data Payload**:
```json
{
  "lat": 17.385,
  "lon": 78.486,
  "days": 7
}
```
**Response**:
```json
{
  "forecast": [
    {"date": "2026-02-04", "temp_max": 32.5, "rain_prob": 12}
  ],
  "risks": [
    {"type": "Drought", "severity": "Medium", "msg": "Low rainfall expected."}
  ]
}
```

---

## 2. Market Intelligence
#### Price Forecast
**Mode**: `market_forecast`
**Data Payload**:
```json
{
  "crop": "Cotton",
  "region": "Telangana",
  "days": 30
}
```
**Response**:
```json
{
  "best_strategy": {
    "action": "Hold",
    "best_date": "2026-02-20",
    "expected_gain": 250.00
  },
  "forecast": [...]
}
```

---

## 3. Errors & Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized |
| 429 | Rate Limit Exceeded (Limit: 10 req/s) |
| 500 | Internal Server Error |
