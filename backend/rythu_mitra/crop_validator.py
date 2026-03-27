"""
Deterministic crop validator.
Runs BEFORE the LLM — eliminates crops that scientifically cannot grow
given the farmer's inputs. The LLM only sees the eligible shortlist.
"""
from .crop_thresholds import CROP_THRESHOLDS


def validate_crops(inputs: dict) -> dict:
    """
    Args:
        inputs: dict with keys N, P, K, temperature, humidity, ph,
                rainfall, season (string), agricultural_season (list).
                All values should be numeric (float/int) except seasons.
    Returns:
        {
          "eligible_crops":  ["rice", "maize", ...],
          "rejected_crops":  [{"crop": "sugarcane", "reasons": ["N too low …"]}, …]
        }
    """
    try:
        N        = float(inputs.get("N") or 0)
        P        = float(inputs.get("P") or 0)
        K        = float(inputs.get("K") or 0)
        temp     = float(inputs.get("temperature") or 0)
        humidity = float(inputs.get("humidity") or 0)
        ph       = float(inputs.get("ph") or 7)
        rainfall = float(inputs.get("rainfall") or 0)
        agricultural_seasons = inputs.get("agricultural_season", [])
        if not isinstance(agricultural_seasons, list):
            agricultural_seasons = []
    except (TypeError, ValueError):
        # If we can't parse anything, pass all crops through so LLM can decide
        return {
            "eligible_crops": list(CROP_THRESHOLDS.keys()),
            "rejected_crops": [],
            "parse_error": True,
        }

    eligible = []
    rejected = []

    for crop, t in CROP_THRESHOLDS.items():
        reasons = []

        if N < t["N_min"]:
            reasons.append(f"Nitrogen too low ({N:.0f} kg/ha, needs {t['N_min']}+)")
        if P < t["P_min"]:
            reasons.append(f"Phosphorus too low ({P:.0f} kg/ha, needs {t['P_min']}+)")
        if K < t["K_min"]:
            reasons.append(f"Potassium too low ({K:.0f} kg/ha, needs {t['K_min']}+)")
        if not (t["temp_min"] <= temp <= t["temp_max"]):
            reasons.append(f"Temperature {temp}°C out of range ({t['temp_min']}–{t['temp_max']}°C)")
        if humidity < t["humidity_min"]:
            reasons.append(f"Humidity too low ({humidity:.0f}%, needs {t['humidity_min']}%+)")
        if not (t["ph_min"] <= ph <= t["ph_max"]):
            reasons.append(f"Soil pH {ph} out of range ({t['ph_min']}–{t['ph_max']})")
        if rainfall < t["rainfall_min"]:
            reasons.append(f"Rainfall too low ({rainfall:.0f}mm, needs {t['rainfall_min']}mm+)")
        
        # Season check using the agricultural_seasons array
        if agricultural_seasons:
            match_found = any(s in t["seasons"] for s in agricultural_seasons)
            if not match_found:
                reasons.append(f"Wrong season (Valid: {', '.join(t['seasons'])})")

        if reasons:
            rejected.append({"crop": crop, "reasons": reasons})
        else:
            eligible.append(crop)

    return {"eligible_crops": eligible, "rejected_crops": rejected}
