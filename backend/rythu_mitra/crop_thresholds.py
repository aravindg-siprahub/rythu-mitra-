"""
ICAR-standard crop thresholds.
All 25 crops from the Kaggle Crop Recommendation dataset + ICAR calibration.
Fields:
  N_min, P_min, K_min         — soil nutrients (kg/ha)
  temp_min, temp_max          — air temperature (°C)
  humidity_min                — relative humidity (%)
  rainfall_min                — annual rainfall (mm)
  ph_min, ph_max              — soil pH
  seasons                     — Indian cropping seasons: Kharif / Rabi / Zaid
"""

CROP_THRESHOLDS = {
    "rice":        {"N_min": 60,  "P_min": 30, "K_min": 30,  "temp_min": 20, "temp_max": 42, "humidity_min": 60, "rainfall_min": 800,  "ph_min": 5.0, "ph_max": 8.0, "seasons": ["Kharif"]},
    "sugarcane":   {"N_min": 80,  "P_min": 40, "K_min": 40,  "temp_min": 21, "temp_max": 42, "humidity_min": 50, "rainfall_min": 1500, "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif", "Rabi"]},
    "jute":        {"N_min": 60,  "P_min": 30, "K_min": 40,  "temp_min": 24, "temp_max": 42, "humidity_min": 70, "rainfall_min": 1200, "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif"]},
    "coffee":      {"N_min": 60,  "P_min": 30, "K_min": 30,  "temp_min": 15, "temp_max": 42, "humidity_min": 70, "rainfall_min": 1500, "ph_min": 6.0, "ph_max": 6.5, "seasons": ["Kharif"]},
    "banana":      {"N_min": 80,  "P_min": 30, "K_min": 50,  "temp_min": 20, "temp_max": 42, "humidity_min": 60, "rainfall_min": 1200, "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif", "Rabi"]},
    "cotton":      {"N_min": 40,  "P_min": 20, "K_min": 20,  "temp_min": 21, "temp_max": 42, "humidity_min": 40, "rainfall_min": 600,  "ph_min": 5.8, "ph_max": 8.0, "seasons": ["Kharif"]},
    "maize":       {"N_min": 30,  "P_min": 15, "K_min": 20,  "temp_min": 18, "temp_max": 42, "humidity_min": 40, "rainfall_min": 500,  "ph_min": 5.5, "ph_max": 7.5, "seasons": ["Kharif", "Rabi", "Zaid"]},
    "papaya":      {"N_min": 40,  "P_min": 20, "K_min": 30,  "temp_min": 22, "temp_max": 42, "humidity_min": 60, "rainfall_min": 1000, "ph_min": 6.0, "ph_max": 7.0, "seasons": ["Kharif", "Rabi"]},
    "coconut":     {"N_min": 30,  "P_min": 20, "K_min": 50,  "temp_min": 20, "temp_max": 42, "humidity_min": 60, "rainfall_min": 1000, "ph_min": 5.5, "ph_max": 8.0, "seasons": ["Kharif"]},
    "mango":       {"N_min": 20,  "P_min": 10, "K_min": 15,  "temp_min": 21, "temp_max": 43, "humidity_min": 30, "rainfall_min": 500,  "ph_min": 5.5, "ph_max": 7.5, "seasons": ["Zaid", "Kharif"]},
    "grapes":      {"N_min": 30,  "P_min": 30, "K_min": 30,  "temp_min": 15, "temp_max": 42, "humidity_min": 40, "rainfall_min": 700,  "ph_min": 5.5, "ph_max": 6.5, "seasons": ["Rabi", "Zaid"]},
    "orange":      {"N_min": 30,  "P_min": 20, "K_min": 20,  "temp_min": 13, "temp_max": 42, "humidity_min": 40, "rainfall_min": 600,  "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Rabi", "Zaid"]},
    "pomegranate": {"N_min": 20,  "P_min": 10, "K_min": 15,  "temp_min": 15, "temp_max": 42, "humidity_min": 20, "rainfall_min": 200,  "ph_min": 5.5, "ph_max": 7.5, "seasons": ["Kharif", "Rabi", "Zaid"]},
    "watermelon":  {"N_min": 20,  "P_min": 15, "K_min": 20,  "temp_min": 24, "temp_max": 42, "humidity_min": 40, "rainfall_min": 400,  "ph_min": 6.0, "ph_max": 7.0, "seasons": ["Zaid", "Kharif"]},
    "muskmelon":   {"N_min": 20,  "P_min": 15, "K_min": 20,  "temp_min": 24, "temp_max": 42, "humidity_min": 40, "rainfall_min": 300,  "ph_min": 6.0, "ph_max": 7.0, "seasons": ["Zaid"]},
    "apple":       {"N_min": 20,  "P_min": 10, "K_min": 20,  "temp_min": 5,  "temp_max": 42, "humidity_min": 50, "rainfall_min": 1000, "ph_min": 5.5, "ph_max": 6.5, "seasons": ["Rabi"]},
    "kidneybeans": {"N_min": 10,  "P_min": 40, "K_min": 20,  "temp_min": 15, "temp_max": 42, "humidity_min": 50, "rainfall_min": 600,  "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif", "Rabi"]},
    "chickpea":    {"N_min": 10,  "P_min": 20, "K_min": 15,  "temp_min": 10, "temp_max": 42, "humidity_min": 14, "rainfall_min": 60,   "ph_min": 6.0, "ph_max": 8.0, "seasons": ["Rabi"]},
    "lentil":      {"N_min": 10,  "P_min": 30, "K_min": 20,  "temp_min": 10, "temp_max": 42, "humidity_min": 30, "rainfall_min": 200,  "ph_min": 6.0, "ph_max": 8.0, "seasons": ["Rabi"]},
    "pigeonpeas":  {"N_min": 10,  "P_min": 20, "K_min": 20,  "temp_min": 18, "temp_max": 42, "humidity_min": 30, "rainfall_min": 400,  "ph_min": 5.5, "ph_max": 7.0, "seasons": ["Kharif"]},
    "mothbeans":   {"N_min": 10,  "P_min": 10, "K_min": 15,  "temp_min": 24, "temp_max": 42, "humidity_min": 20, "rainfall_min": 200,  "ph_min": 7.0, "ph_max": 8.5, "seasons": ["Kharif", "Zaid"]},
    "mungbean":    {"N_min": 10,  "P_min": 20, "K_min": 20,  "temp_min": 25, "temp_max": 42, "humidity_min": 40, "rainfall_min": 300,  "ph_min": 6.2, "ph_max": 7.2, "seasons": ["Kharif", "Zaid"]},
    "blackgram":   {"N_min": 10,  "P_min": 25, "K_min": 20,  "temp_min": 25, "temp_max": 42, "humidity_min": 50, "rainfall_min": 300,  "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif", "Rabi"]},
    "groundnut":   {"N_min": 10,  "P_min": 20, "K_min": 20,  "temp_min": 24, "temp_max": 42, "humidity_min": 40, "rainfall_min": 500,  "ph_min": 6.0, "ph_max": 7.5, "seasons": ["Kharif", "Rabi", "Zaid"]},
}
