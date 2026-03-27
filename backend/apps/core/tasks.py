from celery import shared_task

from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def call_groq(prompt, max_tokens=1000, temperature=0.3):
    """
    Single shared Groq API call.
    Replaces all OpenRouter calls across all tasks.
    Groq is OpenAI-compatible — same format, much faster.
    Model: llama-3.3-70b-versatile
    Typical response time: 1-2 seconds
    """
    import requests
    import os
    from django.conf import settings

    api_key = getattr(settings, 'GROQ_API_KEY', '') or \
              os.environ.get('GROQ_API_KEY', '')

    if not api_key:
        print('[Groq] ERROR: GROQ_API_KEY not found in settings or environment')
        return ''

    print(f'[Groq] Calling llama-3.3-70b-versatile, max_tokens={max_tokens}')

    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': max_tokens,
                'temperature': temperature,
            },
            timeout=30
        )
        content = response.json()['choices'][0]['message']['content']
        print(f'[Groq] Success — {len(content)} chars returned')
        return content

    except requests.exceptions.Timeout:
        print('[Groq] Request timed out after 30s')
        return ''
    except requests.exceptions.ConnectionError:
        print('[Groq] Connection error')
        return ''
    except KeyError:
        print(f'[Groq] Unexpected response: {response.text[:200]}')
        return ''
    except Exception as e:
        print(f'[Groq] Failed: {type(e).__name__}: {e}')
        return ''


def compute_soil_fix_plan(inputs: dict, rejected_crops: list) -> list:
    """
    Finds the worst nutrient gaps across all rejected crops.
    Returns actionable fertilizer advice with kg/acre quantities.
    Fertilizer factors: Urea=2.17x N gap, DAP=4.35x P gap, MOP=1.67x K gap
    Divide ha values by 2.47 to get per-acre figures.
    """
    from rythu_mitra.crop_thresholds import CROP_THRESHOLDS

    # Find max deficiency per nutrient across all rejected crops
    max_N_gap = max_P_gap = max_K_gap = 0.0
    # Safe conversion to float with fallback to 0.0
    def safe_float(val):
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0

    N = safe_float(inputs.get("nitrogen", inputs.get("N", 0)))
    P = safe_float(inputs.get("phosphorus", inputs.get("P", 0)))
    K = safe_float(inputs.get("potassium", inputs.get("K", 0)))

    for item in rejected_crops:
        crop = item.get("crop") if isinstance(item, dict) else item
        if not crop or not isinstance(crop, str):
            continue
            
        t = CROP_THRESHOLDS.get(crop.lower(), {})
        if t:
            max_N_gap = max(max_N_gap, max(0, t.get("N_min", 0) - N))
            max_P_gap = max(max_P_gap, max(0, t.get("P_min", 0) - P))
            max_K_gap = max(max_K_gap, max(0, t.get("K_min", 0) - K))

    fixes = []

    if max_N_gap > 0:
        urea_ha = round(max_N_gap * 2.17, 1)
        urea_acre = round(urea_ha / 2.47, 1)
        fixes.append({
            "nutrient": "Nitrogen (N)",
            "current": N,
            "gap": max_N_gap,
            "fertilizer": "Urea",
            "qty_per_ha": urea_ha,
            "qty_per_acre": urea_acre,
            "advice_en": f"Your Nitrogen is {N} kg/ha. Apply {urea_acre} kg of Urea per acre (or plant nitrogen-fixing legumes like Chickpea/Mungbean as a cover crop first).",
            "advice_te": f"మీ నత్రజని {N} kg/ha గా ఉంది. ఎకరాకు {urea_acre} కిలోల యూరియా వేయండి (లేదా ముందు శనగ/పెసర వంటి పంటలు వేయండి).",
        })

    if max_P_gap > 0:
        dap_ha = round(max_P_gap * 4.35, 1)
        dap_acre = round(dap_ha / 2.47, 1)
        fixes.append({
            "nutrient": "Phosphorus (P)",
            "current": P,
            "gap": max_P_gap,
            "fertilizer": "DAP",
            "qty_per_ha": dap_ha,
            "qty_per_acre": dap_acre,
            "advice_en": f"Your Phosphorus is {P} kg/ha. Apply {dap_acre} kg of DAP per acre at sowing time for best root development.",
            "advice_te": f"మీ భాస్వరం {P} kg/ha గా ఉంది. విత్తే సమయంలో ఎకరాకు {dap_acre} కిలోల DAP వేయండి.",
        })

    if max_K_gap > 0:
        mop_ha = round(max_K_gap * 1.67, 1)
        mop_acre = round(mop_ha / 2.47, 1)
        fixes.append({
            "nutrient": "Potassium (K)",
            "current": K,
            "gap": max_K_gap,
            "fertilizer": "MOP",
            "qty_per_ha": mop_ha,
            "qty_per_acre": mop_acre,
            "advice_en": f"Your Potassium is {K} kg/ha. Apply {mop_acre} kg of MOP per acre to improve crop strength and disease resistance.",
            "advice_te": f"మీ పొటాషియం {K} kg/ha గా ఉంది. పంట బలం కోసం ఎకరాకు {mop_acre} కిలోల MOP వేయండి.",
        })

    if not fixes:
        fixes.append({
            "nutrient": "All nutrients adequate",
            "advice_en": "Your NPK levels meet minimum thresholds. Focus on pH correction and rainfall/irrigation management.",
            "advice_te": "మీ NPK స్థాయిలు సరిపోతున్నాయి. pH సరిదిద్దడం మరియు నీటిపారుదలపై దృష్టి పెట్టండి.",
        })

    return fixes


@shared_task(bind=True, max_retries=3)
def task_crop_recommendation(self, farmer_id, input_data):
    """Async Celery task for crop recommendation via Groq.
    
    Pipeline:
      1. Map field names from views.py format → validator format
      2. Run deterministic validator to get eligible crops
      3. Short-circuit if no eligible crops (no LLM call)
      4. Call LLM with eligible-only shortlist + structured JSON spec
    """
    try:
        from apps.predictions.models import Prediction
        from rythu_mitra.crop_validator import validate_crops

        # ── Step 1: Map views.py field names → validator field names ──────────
        validator_inputs = {
            "N":           input_data.get("nitrogen"),
            "P":           input_data.get("phosphorus"),
            "K":           input_data.get("potassium"),
            "ph":          input_data.get("soil_ph"),
            "rainfall":    input_data.get("annual_rainfall"),
            "temperature": input_data.get("temperature"),
            "humidity":    input_data.get("humidity"),
            "season":      input_data.get("season", ""),
            "agricultural_season": input_data.get("agricultural_season", []),
        }
        logger.info(f"[Validator] Inputs: {validator_inputs}")

        # ── Step 2: Deterministic pre-filter ──────────────────────────────────
        validation = validate_crops(validator_inputs)
        eligible   = validation["eligible_crops"]
        rejected   = validation["rejected_crops"]
        logger.info(f"[Validator] Eligible: {eligible} | Rejected count: {len(rejected)}")

        # Calculate soil fix plan based on rejected crops' gaps
        soil_fix_plan = compute_soil_fix_plan(input_data, rejected)

        # ── Step 3: Short-circuit — no eligible crops → return immediately ────
        if not eligible:
            top_reasons = []
            for r in rejected[:5]:
                top_reasons.extend(r.get("reasons", []))
            result = {
                "top_crops": [],
                "recommendations": [],
                "soil_health_summary": "Your current soil and climate conditions do not meet the minimum requirements for any crop in our database.",
                "soil_assessment": "Soil conditions require improvement before planting.",
                "warnings": list(set(top_reasons[:5])),
                "not_recommended": [
                    {"crop": r["crop"], "reason": r["reasons"][0]} for r in rejected[:6]
                ],
                "soil_fix_plan": soil_fix_plan
            }
            # Save and return without calling LLM
            Prediction.objects.create(
                farmer_uuid=str(farmer_id),
                prediction_type='crop_recommendation',
                input_data=input_data,
                result=result,
                created_at=timezone.now()
            )
            return result

        # ── Step 4: Call LLM with eligible shortlist ───────────────────────────
        season = input_data.get('season', '')
        ag_seasons = input_data.get('agricultural_season', [])
        ag_season_str = ", ".join(ag_seasons) if ag_seasons else "All"
        
        season_context = ""
        if season:
            season_context = f"""
The farmer has selected the {season} season (Indian agricultural equivalent: {ag_season_str} season). 
Only recommend crops that are traditionally grown during {ag_season_str} season in India. 
Do NOT reject crops based on season mismatch — the season mapping has already been handled.
Valid temperature range for Indian agriculture: 15°C to 42°C. 
Temperatures between 28–42°C are normal for Andhra Pradesh.
"""

        eligible_str = ", ".join(eligible) if eligible else "None"
        
        system = f"""
You are an expert agricultural scientist specializing in Indian farming.
Your job is to analyze a farmer's exact soil and climate measurements 
and recommend the most suitable crops for their specific conditions.

You must reason directly from the numbers provided. Do not give 
generic recommendations. If the values are extreme or unusual, 
reflect that in your answer.

INDIAN CROP KNOWLEDGE BASE — use this to reason:

Crop suitability rules (all ranges are for Indian conditions):

Rice:
  N: 80–120 kg/ha, P: 40–60, K: 40–60
  Temp: 20–35°C, Humidity: 70–90%, pH: 5.5–7.0
  Rainfall: 1000–2000mm, Season: Kharif (Monsoon)

Wheat:
  N: 60–120 kg/ha, P: 30–60, K: 30–60
  Temp: 10–25°C, Humidity: 40–70%, pH: 6.0–7.5
  Rainfall: 300–500mm, Season: Rabi (Winter)

Cotton:
  N: 60–100 kg/ha, P: 30–60, K: 30–60
  Temp: 25–40°C, Humidity: 50–80%, pH: 6.0–7.5
  Rainfall: 500–1000mm, Season: Kharif (Monsoon)

Maize:
  N: 80–120 kg/ha, P: 40–60, K: 40–60
  Temp: 18–35°C, Humidity: 50–80%, pH: 5.5–7.5
  Rainfall: 500–900mm, Season: Kharif (Monsoon)

Chickpea:
  N: 20–40 kg/ha, P: 40–60, K: 20–40
  Temp: 10–25°C, Humidity: 30–60%, pH: 6.0–7.5
  Rainfall: 300–500mm, Season: Rabi (Winter)

Mustard:
  N: 40–80 kg/ha, P: 20–40, K: 20–40
  Temp: 10–25°C, Humidity: 30–60%, pH: 6.0–7.5
  Rainfall: 250–400mm, Season: Rabi (Winter)

Sugarcane:
  N: 100–150 kg/ha, P: 50–80, K: 80–120
  Temp: 25–38°C, Humidity: 60–90%, pH: 6.0–7.5
  Rainfall: 1200–1500mm, Season: Zaid/Summer

Groundnut:
  N: 20–40 kg/ha, P: 40–80, K: 20–40
  Temp: 25–35°C, Humidity: 50–70%, pH: 5.5–7.0
  Rainfall: 500–800mm, Season: Kharif/Zaid

Turmeric:
  N: 60–80 kg/ha, P: 40–60, K: 80–100
  Temp: 20–35°C, Humidity: 65–90%, pH: 5.5–7.0
  Rainfall: 1200–1800mm, Season: Kharif (Monsoon)

Tomato:
  N: 80–120 kg/ha, P: 60–80, K: 60–80
  Temp: 18–30°C, Humidity: 50–70%, pH: 6.0–7.0
  Rainfall: 400–600mm, Season: Rabi/Zaid

Banana:
  N: 100–150 kg/ha, P: 50–80, K: 150–200
  Temp: 25–38°C, Humidity: 70–90%, pH: 5.5–7.0
  Rainfall: 1200–2200mm, Season: Year-round

Jowar (Sorghum):
  N: 40–80 kg/ha, P: 20–40, K: 20–40
  Temp: 25–40°C, Humidity: 30–60%, pH: 6.0–7.5
  Rainfall: 300–600mm, Season: Kharif

Bajra (Pearl Millet):
  N: 40–80 kg/ha, P: 20–40, K: 20–40
  Temp: 28–42°C, Humidity: 30–60%, pH: 6.0–8.0
  Rainfall: 200–500mm, Season: Kharif

Based on agronomic validation, ONLY these crops are 
suitable for this soil profile:
{eligible_str}

From ONLY this list, recommend the top 3 crops ranked
by suitability. Do NOT recommend any crop outside this list.

SCORING INSTRUCTION:
For each crop in the eligible list above, calculate a match score by checking how many of the 
farmer's values fall within the crop's ideal ranges above.
Score each parameter: 1 if in range, 0.5 if slightly outside, 0 if 
far outside.
Rank crops by total score. Top 3 scores become recommendations.

CONFIDENCE SCORE:
Express confidence as a percentage based on the score:
  90–100% = 5 of 5 parameters match
  70–89%  = 4 parameters match
  50–69%  = 3 parameters match
  Below 50% = do not recommend this crop

WARNINGS:
If any farmer value is significantly outside normal ranges, 
add a specific warning with the actual number. Use these thresholds:
  Nitrogen:   low < 40,  high > 250
  Phosphorus: low < 20,  high > 150 (Normal range is 20-150 kg/ha)
  Potassium:  low < 20,  high > 250
Only flag phosphorus if it is below 20 or above 150. For example:
  "Phosphorus is very high at 160 kg/ha — may block zinc uptake."
  "Phosphorus is low at 15 kg/ha — crop yield may suffer."
Never generate a generic warning. Always include the actual number.
"""

        user = f"""
  Analyze this farmer's data and recommend the top 3 crops:

  Location: {input_data.get('state', 'Unknown')}, {input_data.get('district', 'Unknown')}
  Season selected: {season} (Agricultural: {ag_season_str})
  
  Soil nutrients:
    Nitrogen (N):   {input_data.get('nitrogen')} kg/ha
    Phosphorus (P): {input_data.get('phosphorus')} kg/ha
    Potassium (K):  {input_data.get('potassium')} kg/ha
  
  Climate:
    Temperature: {input_data.get('temperature')}°C
    Humidity:    {input_data.get('humidity')}%
    Rainfall:    {input_data.get('annual_rainfall')} mm/year
  
  Soil:
    pH: {input_data.get('soil_ph')}

  Step 1: For each crop in your knowledge base, score it against 
          these exact numbers.
  Step 2: List the top 3 scoring crops only.
  Step 3: For each recommended crop explain exactly which of the 
          farmer's values matched and which were close.
  Step 4: Generate warnings only for values that are genuinely 
          outside normal range — include the actual number.
  Step 5: Return confidence as a percentage based on match score.

  IMPORTANT: You MUST include ALL of these 
  fields for each crop. Missing fields will 
  cause the system to fail:

  - sowing_window: The optimal sowing months 
    for this crop in India during {season} season.
    Format EXACTLY as "Month-Month" e.g. 
    "March-April" or "June-July". 
    Use the current season: {season}.

  - price_trend: Current market price direction 
    for this crop in India this season.
    Return EXACTLY one of these three values: 
    "up", "down", or "stable".
    Base this on typical seasonal demand patterns.

  {{
    "top_crops": [
      {{
        "crop": "crop name in English",
        "confidence": 85,
        "expected_yield": "X-Y tonnes/hectare",
        "why_this_crop": "explanation using farmer's exact values",
        "feature_influence": {{
          "Nitrogen": 85,
          "Temperature": 100,
          "Soil pH": 90
        }},
        "market_price": "₹X,XXX - ₹X,XXX/qtl",
        "sowing_window": "Month-Month (e.g. March-April)",
        "price_trend": "up"
      }}
    ],
    "warnings": [
      {{
        "type": "nutrient",
        "message": "Phosphorus is very high at {input_data.get('phosphorus')} kg/ha..."
      }}
    ],
    "soil_fix_plan": [
      {{
        "step": 1,
        "title": "Step title",
        "description": "Specific advice based on farmer's numbers"
      }}
    ]
  }}

  Respond ONLY with valid JSON.
"""
        prompt = f"{system}\n\n{user}"
        response_text = call_groq(prompt, max_tokens=1000)
        
        import json, re
        try:
            cleaned = re.sub(r'```(?:json)?', '', str(response_text)).strip()
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3].strip()
            result = json.loads(cleaned)
        except Exception:
            result = None

        if not result or not isinstance(result, dict):
            return {"error": "Unable to generate prediction. Please try again."}

        def _fallback_sowing_window(season_name: str) -> str:
            s = (season_name or "").strip().lower()
            if s == "monsoon" or s == "kharif":
                return "June-July"
            if s == "winter" or s == "rabi":
                return "October-November"
            # Default to Summer/Zaid
            return "March-April"

        def _normalize_price_trend(val) -> str:
            if not val:
                return "stable"
            s = str(val).strip().lower()
            if s in ("up", "rising", "increase", "increasing"):
                return "up"
            if s in ("down", "falling", "decrease", "decreasing"):
                return "down"
            return "stable"

        # Confidence validation logic
        if "top_crops" in result and isinstance(result["top_crops"], list):
            valid_crops = []
            for crop in result["top_crops"]:
                # Sometimes LLMs return decimal confidence (0.87 instead of 87)
                conf = crop.get("confidence", 0)
                if isinstance(conf, (float, int)):
                    if conf <= 1.0:
                        conf = int(conf * 100)
                    else:
                        conf = int(conf)
                    
                    crop["confidence"] = conf
                    if conf > 50:
                        # Ensure new fields always exist (frontend displays them)
                        crop.setdefault("sowing_window", _fallback_sowing_window(season))
                        crop["price_trend"] = _normalize_price_trend(crop.get("price_trend"))
                        valid_crops.append(crop)
            result["top_crops"] = valid_crops
        
        if not result.get("top_crops"):
            return {"error": "No crops met the confidence threshold for your inputs. Try adjusting your soil or climate values."}
            
        # Optional: Enrich result with validator's rejected list if desired
        if rejected:
            result["not_recommended"] = [
                {"crop": r["crop"], "reason": r["reasons"][0]} for r in rejected[:4]
            ]
        
        # Add soil fix plan directly from validator output or LLM (if preferred validator version, just extend)
        if "soil_fix_plan" not in result or not result["soil_fix_plan"]:
            result["soil_fix_plan"] = soil_fix_plan

        # Save to Supabase DB
        try:
            import os
            from supabase import create_client
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
            supabase = create_client(supabase_url, supabase_key)

            supabase.table("crop_recommendations").insert({
                "user_id": str(farmer_id),
                "input_data": input_data,
                "recommendation": result,
                "language": input_data.get("language", "te"),
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save crop recommendation to Supabase: {e}")

        # Still save to local Prediction model for backup
        Prediction.objects.create(
            farmer_uuid=str(farmer_id),
            prediction_type='crop_recommendation',
            input_data=input_data,
            result=result,
            created_at=timezone.now()
        )

        return result

    except Exception as exc:
        logger.error(f"Crop recommendation task failed: {exc}")
        raise self.retry(exc=exc, countdown=5)



@shared_task(bind=True, max_retries=3)
def task_disease_detection(self, farmer_id, input_data, image_base64=None):
    """Async Celery task for disease detection via Groq Vision."""
    try:
        from apps.predictions.models import Prediction

        system = """Agricultural plant pathologist for Indian farmers (AP/Telangana).
Analyze plant disease images. Return ONLY valid JSON — no markdown, no backticks, no extra text.
Use only chemicals available in Indian markets. Include dosage, schedule, safety interval.
Unknown fields: use descriptive string, never null."""

        crop_name   = input_data.get('crop_name', 'Unknown')
        temperature = input_data.get('temperature', 28)
        humidity    = input_data.get('humidity', 65)
        district    = input_data.get('district', '')
        state       = input_data.get('state', input_data.get('farmer_state', 'Andhra Pradesh'))
        season      = input_data.get('season', 'Kharif')

        user = f"""Analyze this {crop_name} plant image for disease.

Current field conditions:
- Location: {district}, {state}
- Temperature: {temperature}°C
- Humidity: {humidity}%
- Season: {season}

Return ONLY this JSON (no markdown, no backticks, nothing else before or after):
{{
  "disease_name": "Common name of the disease",
  "scientific_name": "Scientific name e.g. Phytophthora infestans",
  "crop": "{crop_name}",
  "confidence": 85,
  "disease_stage": "Early or Mid or Late",
  "plain_description": "2 plain-language sentences: what this disease is and what it does to the plant.",
  "spread_risk": "Low or Medium or High or Very High",
  "spread_mechanism": "One sentence: exactly how it spreads e.g. via water splash, wind-borne spores, soil contact.",
  "weather_urgency": "STRICT RULE — follow this logic exactly: IF disease_stage is Early or Mid AND confidence >= 70 AND spread_risk is Medium/High/Very High → write one urgent sentence saying current weather accelerates spread and farmer must spray today. IF disease_stage is Early AND spread_risk is Low AND humidity < 70 → write one sentence saying conditions are currently stable but farmer should monitor daily and spray at first sign of worsening. NEVER say monitoring is sufficient when confidence >= 70 and disease_stage is Mid or Late. NEVER contradict the chemical_treatment recommendation.",
  "immediate_action": "The single most critical action the farmer must do in the next 24 hours.",
  "chemical_treatment": {{
    "product_name": "Indian market chemical name e.g. Mancozeb 75WP or Copper Oxychloride 50WP",
    "dosage": "e.g. 2g per litre of water",
    "spray_schedule": "e.g. Every 7 days for 3 rounds",
    "safety_interval_days": 10,
    "application_tip": "One sentence best practice e.g. spray early morning, cover leaf undersides, avoid rain"
  }},
  "treatment_steps": [
    {{"step": 1, "action": "Remove infected leaves", "detail": "Cut all leaves showing spots or yellowing. Burn them immediately — do not compost or leave on the ground."}},
    {{"step": 2, "action": "Spray [product_name] [dosage]", "detail": "IMPORTANT: Replace [product_name] with the exact product_name value and [dosage] with the exact dosage value from chemical_treatment. Always write the specific gram/ml amount — never say 'recommended dosage'. Example: 'Mix 2g of Mancozeb 75WP per litre of water. For a 15-litre knapsack sprayer, use 30g total.'"}},
    {{"step": 3, "action": "Switch irrigation method", "detail": "Avoid overhead/sprinkler irrigation. Switch to drip or furrow irrigation — water splash spreads fungal spores to healthy plants."}},
    {{"step": 4, "action": "Re-scan in 7 days", "detail": "Use Rythu Mitra to photograph the same plant. If worsening, isolate affected rows and increase spray frequency."}}
  ],
  "monitoring_frequency": "Daily or Every 3 days or Weekly",
  "yield_loss_if_untreated_percent": "40-70",
  "estimated_crop_value_at_risk_per_acre_inr": "18000-32000",
  "cost_of_treatment_inr": "350-500",
  "prevention_tip": "One sentence: how to prevent this disease next season.",
  "is_outbreak_season": true
}}"""

        prompt = f"{system}\n\n{user}"
        if image_base64:
            import requests as req
            import os
            from django.conf import settings

            api_key = getattr(settings, 'GROQ_API_KEY', '') or \
                      os.environ.get('GROQ_API_KEY', '')
            
            img_url = image_base64 if image_base64.startswith("data:image") else f"data:image/jpeg;base64,{image_base64}"

            try:
                response = req.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'meta-llama/llama-4-scout-17b-16e-instruct',
                        'messages': [
                            {
                                'role': 'user',
                                'content': [
                                    {
                                        'type': 'image_url',
                                        'image_url': {
                                            'url': img_url
                                        }
                                    },
                                    {
                                        'type': 'text',
                                        'text': prompt
                                    }
                                ]
                            }
                        ],
                        'max_tokens': 1500,
                        'temperature': 0.2,
                    },
                    timeout=40
                )
                raw_result = response.json()['choices'][0]['message']['content']
            except Exception as e:
                logger.error(f"Groq Vision API error: {e}")
                raw_result = ""
        else:
            raw_result = call_groq(prompt, max_tokens=1500)

        # Robust JSON parsing — handle dict (already parsed) or raw string
        import json
        import re

        if isinstance(raw_result, dict):
            result = raw_result
        else:
            response_text = str(raw_result)
            cleaned = re.sub(r'```(?:json)?', '', response_text).strip()
            try:
                result = json.loads(cleaned)
            except (json.JSONDecodeError, ValueError):
                result = {
                    "disease_name": "Analysis unclear",
                    "scientific_name": "",
                    "crop": crop_name,
                    "confidence": 0,
                    "disease_stage": "Unknown",
                    "plain_description": "Could not analyse the image clearly. Please retake the photo in good natural lighting with the affected leaf filling the frame.",
                    "spread_risk": "Unknown",
                    "spread_mechanism": "Not determined from this image.",
                    "weather_urgency": "",
                    "immediate_action": "Consult your local Krishi Vigyan Kendra (KVK) officer with a fresh photo.",
                    "chemical_treatment": {
                        "product_name": "Not determined",
                        "dosage": "-",
                        "spray_schedule": "-",
                        "safety_interval_days": 0,
                        "application_tip": ""
                    },
                    "treatment_steps": [
                        {"step": 1, "action": "Retake photo", "detail": "Use natural light. Hold phone 20-30cm from the affected leaf."},
                        {"step": 2, "action": "Consult KVK officer", "detail": "Take the plant sample to your nearest Krishi Vigyan Kendra."}
                    ],
                    "monitoring_frequency": "Daily",
                    "yield_loss_if_untreated_percent": "Unknown",
                    "estimated_crop_value_at_risk_per_acre_inr": "Unknown",
                    "cost_of_treatment_inr": "Unknown",
                    "prevention_tip": "",
                    "is_outbreak_season": False
                }

        # Save to Supabase disease_detections table
        try:
            from apps.core.supabase_client import supabase

            if result.get("disease_name") and result.get("disease_name") != "Analysis unclear":
                supabase.table("disease_detections").insert({
                    "id": str(self.request.id),
                    "user_id": str(farmer_id),
                    "crop_name": crop_name,
                    "symptoms": input_data.get("symptoms", ""),
                    "image_url": input_data.get("image_url", ""),
                    "diagnosis": result,
                    "language": input_data.get("language", "te")
                }).execute()
        except Exception as e:
            logger.warning(f"Failed to save to Supabase: {e}")

        # Still save to local Prediction model for backup
        Prediction.objects.create(
            farmer_uuid=str(farmer_id),
            prediction_type='disease_detection',
            input_data=input_data,
            result=result,
            created_at=timezone.now()
        )

        return result

    except Exception as exc:
        logger.error(f"Disease detection task failed: {exc}")
        raise self.retry(exc=exc, countdown=5)


import concurrent.futures
import hashlib
import json
import re
import datetime
import requests
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
import logging
import threading

logger = logging.getLogger(__name__)

def call_groq_price(commodity, mandi, state, season,
                          forecast_days, temperature, humidity):
    """Fast minimal call — prices only. Target: under 3 seconds."""
    days_list = '\n    '.join([
        f'{{"day": {i+1}, "price": 0, "upper": 0, "lower": 0}}'
        for i in range(int(forecast_days))
    ])

    prompt = f"""Indian commodity price analyst. Return ONLY valid JSON, no markdown.

{forecast_days}-day price forecast for {commodity} at {mandi}, {state}.
Season: {season}. Weather: {temperature}°C, {humidity}% humidity.

Return ONLY:
{{
  "today_price": 2020,
  "day_forecast": [
    {{"day": 1, "price": 2020, "upper": 2060, "lower": 1980}},
    {{"day": 2, "price": 2025, "upper": 2065, "lower": 1985}},
    {{"day": 3, "price": 2030, "upper": 2070, "lower": 1990}},
    {{"day": 4, "price": 2035, "upper": 2075, "lower": 1995}},
    {{"day": 5, "price": 2038, "upper": 2078, "lower": 1998}},
    {{"day": 6, "price": 2042, "upper": 2082, "lower": 2002}},
    {{"day": 7, "price": 2045, "upper": 2085, "lower": 2005}}
  ],
  "price_trend": "rising",
  "trend_percent": 2.0,
  "unit": "per quintal"
}}
Rules: realistic Indian prices, max ±8% movement, upper=price+2%, lower=price-2%
If {forecast_days}=14 return 14 days."""

    response_text = call_groq(prompt, max_tokens=600, temperature=0.2)
    return safe_parse_json(response_text, get_price_fallback(commodity, forecast_days))

def call_groq_insight(commodity, mandi, state, season,
                             temperature, humidity):
    """Insight + strategy call — cached 6 hours, runs in parallel with price."""
    prompt = f"""Indian agricultural market advisor for farmers in {state}.
Return ONLY valid JSON, no markdown, no backticks.

Market strategy for {commodity} at {mandi} in {season} season.
Weather: {temperature}°C, {humidity}% humidity.

Return ONLY:
{{
  "strategy_summary": "One sentence: price outlook and what farmer should do now.",
  "best_time_to_sell": "Specific timing e.g. '1 week after harvest' or 'Sell immediately'",
  "recommended_mandi": "Best mandi name near {mandi} for {commodity}",
  "what_to_do": "2 specific sentences of actionable advice for a small farmer.",
  "storage_advice": "One sentence: store or sell immediately and why.",
  "risk_factors": [
    "Specific {commodity} risk in {season} season in {state}",
    "Risk from current weather: {temperature}°C and {humidity}% humidity",
    "Market-specific risk for {commodity} right now"
  ],
  "price_drivers": [
    "Main factor driving {commodity} prices in {season}",
    "Secondary factor affecting {mandi} prices"
  ],
  "nearby_mandis": [
    {{"name": "Nearby mandi 1 name", "distance_km": 15, "known_for": "{commodity}"}},
    {{"name": "Nearby mandi 2 name", "distance_km": 30, "known_for": "{commodity}"}}
  ]
}}"""

    response_text = call_groq(prompt, max_tokens=800, temperature=0.3)
    return safe_parse_json(response_text, get_insight_fallback(commodity, mandi))

def safe_parse_json(text, fallback):
    import re, json
    try:
        cleaned = re.sub(r'```(?:json)?', '', str(text)).strip()
        return json.loads(cleaned)
    except Exception:
        return fallback

def get_timestamp():
    import datetime
    return datetime.datetime.now().strftime('%d %b %Y, %I:%M %p')

def get_price_fallback(commodity, forecast_days=7):
    defaults = {
        'Rice': 2100, 'Wheat': 2150, 'Maize': 1850, 'Groundnut': 5200,
        'Tomato': 1200, 'Onion': 1400, 'Cotton': 6500, 'Sugarcane': 340,
        'Soybean': 4200, 'Turmeric': 8500,
    }
    base = defaults.get(commodity, 2000)
    days = int(forecast_days)
    return {
        'today_price': base,
        'day_forecast': [
            {'day': i+1, 'price': base+(i*5),
             'upper': base+(i*5)+40, 'lower': base+(i*5)-40}
            for i in range(days)
        ],
        'price_trend': 'stable',
        'trend_percent': 0.0,
        'unit': 'per quintal',
        'is_fallback': True
    }

def get_insight_fallback(commodity, mandi):
    return {
        'strategy_summary': f'Monitor {commodity} prices at {mandi} daily.',
        'best_time_to_sell': 'Check prices daily before deciding',
        'recommended_mandi': mandi,
        'what_to_do': 'Compare prices at 2-3 nearby mandis. Store safely until prices stabilise.',
        'storage_advice': 'Store in cool dry place if prices are below expected rate.',
        'risk_factors': [
            'Seasonal price volatility during harvest',
            'Transportation cost changes',
            'Weather-related supply shifts'
        ],
        'price_drivers': ['Local supply and demand', 'Seasonal harvest arrivals'],
        'nearby_mandis': []
    }

@shared_task(bind=True, max_retries=3)
def task_market_prediction(self, farmer_id, input_data):
    """Async Celery task for market price prediction."""
    try:
        from apps.predictions.models import Prediction
        
        commodity = input_data.get('crop', 'Unknown').strip()
        mandi = input_data.get('district', 'Local Mandi').strip()
        forecast_days = int(input_data.get('forecast_days', 7))
        state = input_data.get('state', 'Unknown').strip()
        temperature = input_data.get('temperature', 28)
        humidity = input_data.get('humidity', 65)
        season = input_data.get('season', 'Kharif').strip()

        # ── Build cache key for insight (stable for 6 hours per commodity+mandi+season) ──
        cache_key = 'market_insight_' + hashlib.md5(
            f"{commodity}_{mandi}_{season}".encode()
        ).hexdigest()

        cached_insight = cache.get(cache_key)

        if cached_insight:
            # Insight is cached — only run price call (fast single call)
            price_data = call_groq_price(
                commodity, mandi, state, season,
                forecast_days, temperature, humidity
            )
            insight_data = cached_insight
        else:
            # Run both calls IN PARALLEL using ThreadPoolExecutor
            try:
                with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                    price_future   = executor.submit(
                        call_groq_price,
                        commodity, mandi, state, season,
                        forecast_days, temperature, humidity
                    )
                    insight_future = executor.submit(
                        call_groq_insight,
                        commodity, mandi, state, season,
                        temperature, humidity
                    )
                    price_data   = price_future.result(timeout=15)
                    insight_data = insight_future.result(timeout=15)

                cache.set(cache_key, insight_data, 60 * 60 * 6)

            except concurrent.futures.TimeoutError:
                print('[Market] Parallel calls timed out — using fallbacks')
                price_data   = get_price_fallback(commodity, forecast_days)
                insight_data = get_insight_fallback(commodity, mandi)
            except Exception as e:
                print(f'[Market] Unexpected error: {e}')
                price_data   = get_price_fallback(commodity, forecast_days)
                insight_data = get_insight_fallback(commodity, mandi)

        result = {**price_data, **insight_data, 'generated_at': get_timestamp()}

        # Fire and forget Logging so it doesn't block the API return speed
        def log_to_databases(res_data):
            try:
                import os
                from supabase import create_client
                supabase_url = os.environ.get("SUPABASE_URL")
                supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
                if supabase_url and supabase_key:
                    supabase = create_client(supabase_url, supabase_key)
                    supabase.table("market_price_queries").insert({
                        "user_id": str(farmer_id),
                        "crop_name": input_data.get("crop", "Unknown"),
                        "location": f"{input_data.get('state', '')}, {input_data.get('district', '')}",
                        "prediction": res_data,
                        "language": input_data.get("language", "te"),
                    }).execute()
            except Exception as e:
                logger.warning(f"Failed to save market query to Supabase: {e}")

            try:
                Prediction.objects.create(
                    farmer_uuid=str(farmer_id),
                    prediction_type='market_prediction',
                    input_data=input_data,
                    result=res_data,
                    created_at=timezone.now()
                )
            except Exception as e:
                logger.warning(f"Failed to save Prediction model: {e}")

        threading.Thread(target=log_to_databases, args=(result,), daemon=True).start()

        return result

    except Exception as exc:
        logger.error(f"Market prediction task failed: {exc}")
        raise self.retry(exc=exc, countdown=5)


def get_weather_fallback(crop, location):
    return {
        "overall_risk": "Medium",
        "risk_level": "Medium",
        "risk_summary": f"Monitor {crop} conditions closely this week.",
        "crop_alert": f"Check {crop} plants daily for signs of stress. Adjust irrigation based on daily temperatures.",
        "daily_actions": [],
        "spray_advisory": {
            "best_days": [],
            "avoid_days": [],
            "reason": "Check local weather before spraying."
        },
        "irrigation_advisory": {
            "today_amount_cm": "3-4cm",
            "today_timing": "Early morning",
            "weekly_note": "Irrigate based on daily temperature and rainfall."
        },
        "disease_risk_days": [],
        "harvest_window": {
            "recommended_days": "Consult locally",
            "avoid_days": "Rainy days",
            "note": "Harvest during dry weather for best quality."
        },
        "best_farming_day": "Check forecast daily for best farming conditions.",
        "forecast_7d": [],
        "location": location,
        "explanation": {"farmer_advisory": f"Monitor {crop} fields and adjust irrigation as needed."}
    }


def fetch_openweather_forecast(district, state):
    """
    Fetch 7-day daily forecast from OpenWeatherMap.
    Returns a list of dicts suitable for the Groq prompt.
    """
    import requests as req
    import os
    from django.conf import settings
    import datetime

    api_key = getattr(settings, 'OPENWEATHER_API_KEY', '') or os.environ.get('OPENWEATHER_API_KEY', '')
    if not api_key:
        print('[OpenWeather] No API key — skipping live forecast fetch')
        return []

    try:
        # Use the 5-day / 3-hour forecast endpoint (free tier)
        location_query = f"{district},{state},IN"
        resp = req.get(
            'https://api.openweathermap.org/data/2.5/forecast',
            params={'q': location_query, 'appid': api_key, 'units': 'metric', 'cnt': 56},
            timeout=10
        )
        if resp.status_code != 200:
            print(f'[OpenWeather] Status {resp.status_code} for {location_query}')
            return []

        data = resp.json()
        items = data.get('list', [])

        # Aggregate 3-hour slots into daily summaries
        daily = {}
        for item in items:
            date_str = item['dt_txt'][:10]  # e.g. '2024-03-22'
            dt = datetime.datetime.strptime(date_str, '%Y-%m-%d')
            day_label = dt.strftime('%a')   # e.g. 'Mon'
            date_label = dt.strftime('%d %b')  # e.g. '22 Mar'

            if date_str not in daily:
                daily[date_str] = {
                    'date': date_str,
                    'day': day_label,
                    'date_label': date_label,
                    'temp_max': item['main']['temp_max'],
                    'temp_min': item['main']['temp_min'],
                    'humidity_sum': item['main']['humidity'],
                    'rainfall': item.get('rain', {}).get('3h', 0),
                    'description': item['weather'][0]['description'].title(),
                    'count': 1,
                }
            else:
                d = daily[date_str]
                d['temp_max'] = max(d['temp_max'], item['main']['temp_max'])
                d['temp_min'] = min(d['temp_min'], item['main']['temp_min'])
                d['humidity_sum'] += item['main']['humidity']
                d['rainfall'] += item.get('rain', {}).get('3h', 0)
                d['count'] += 1

        result = []
        for date_str in sorted(daily.keys())[:7]:
            d = daily[date_str]
            entry = {
                'date': d.get('date'),
                'day': d.get('day'),
                'date_label': d.get('date_label'),
                'temp_max': round(float(d.get('temp_max', 0)), 1),
                'temp_min': round(float(d.get('temp_min', 0)), 1),
                'humidity': round(float(d.get('humidity_sum', 0)) / max(1, d.get('count', 1))),
                'rainfall': round(float(d.get('rainfall', 0)), 1),
                'description': d.get('description'),
                'condition': d.get('description'),
                'risk_level': 'High' if d.get('rainfall', 0) > 15 else ('Medium' if d.get('rainfall', 0) > 5 else 'Low'),
                'max_temp': round(float(d.get('temp_max', 0)), 1),
            }
            result.append(entry)

        print(f'[OpenWeather] Fetched {len(result)} days for {location_query}')
        return result

    except Exception as e:
        print(f'[OpenWeather] Fetch failed: {e}')
        return []


@shared_task(bind=True, max_retries=3)
def task_weather_advisory(self, farmer_id, input_data):
    """Async Celery task for weather advisory with upgraded Groq prompt."""
    try:
        from apps.predictions.models import Prediction
        from django.utils import timezone
        import json, re

        location = input_data.get('district', 'Unknown')
        state = input_data.get('state', 'Andhra Pradesh')
        crop = input_data.get('crop', 'general')
        season = input_data.get('season', 'Kharif')
        current_date = timezone.now().strftime('%Y-%m-%d')

        # ── Step 1: Fetch live 7-day forecast from OpenWeatherMap ────────────
        forecast_data = fetch_openweather_forecast(location, state)

        # ── Step 2: Build forecast summary string for the Groq prompt ────────
        forecast_summary = ""
        if forecast_data:
            for day in forecast_data[:7]:
                forecast_summary += (
                    f"- {day.get('day', '')} {day.get('date_label', day.get('date', ''))}: "
                    f"Max {day.get('temp_max', day.get('temp', ''))}°C, "
                    f"Rain: {day.get('rainfall', day.get('rain', 0))}mm, "
                    f"Humidity: {day.get('humidity', '')}%, "
                    f"Condition: {day.get('description', day.get('condition', ''))}\n"
                )
        else:
            # Fallback forecast summary if live data unavailable
            forecast_summary = "Live forecast unavailable. Provide realistic estimates for the region."

        # ── Step 3: Build the upgraded Groq prompt ────────────────────────────
        prompt = f"""You are an expert agricultural advisor for farmers in {state}, India.
Analyze the 7-day weather forecast and provide specific farming advice.
Return ONLY valid JSON, no markdown, no backticks.

Location: {location}, {state}
Crop: {crop}
Season: {season}
Date: {current_date}

7-Day Forecast:
{forecast_summary}

Return ONLY this JSON:
{{
  "location": "{location}, {state}",
  "overall_risk": "Low or Medium or High",
  "risk_level": "Low or Medium or High",
  "risk_summary": "One sentence summarizing the week's main risk for {crop} farmers.",
  "crop_alert": "2 specific sentences about how this week's weather affects {crop}. Mention specific days and temperatures. No generic advice.",
  "daily_actions": [
    {{
      "day": "Mon",
      "date": "23 Mar",
      "action": "One specific farming action or warning for this day",
      "action_type": "spray or irrigate or harvest or monitor or avoid_spray or rest"
    }}
  ],
  "spray_advisory": {{
    "best_days": ["List day names that are good for spraying e.g. Sun, Mon"],
    "avoid_days": ["List day names to avoid spraying e.g. Wed, Thu"],
    "reason": "One sentence explaining why e.g. Rain forecast Wed-Thu will wash off chemicals"
  }},
  "irrigation_advisory": {{
    "today_amount_cm": "e.g. 3-4cm",
    "today_timing": "e.g. Early morning before 8am",
    "weekly_note": "One sentence irrigation strategy for the week based on rainfall forecast"
  }},
  "disease_risk_days": [
    {{
      "day": "Wed",
      "disease": "Most likely disease for {crop} given humidity and temperature",
      "risk_level": "Low or Medium or High",
      "action": "One preventive action"
    }}
  ],
  "harvest_window": {{
    "recommended_days": "e.g. Sun-Mon or Not applicable if not harvest season",
    "avoid_days": "e.g. Wed-Thu due to rain",
    "note": "One sentence harvest timing advice"
  }},
  "best_farming_day": "The single best day this week for general farm work and why in one sentence",
  "forecast_7d": [
    {{
      "date": "ISO-date e.g. 2024-03-22",
      "day": "Mon",
      "condition": "Sunny or Cloudy or Rain or Storm",
      "max_temp": 33.0,
      "temp_max": 33.0,
      "rainfall": 2.1,
      "humidity": 65,
      "risk_level": "Low or Medium or High"
    }}
  ],
  "crop_alerts": [
    {{
      "title": "Alert title",
      "message": "Specific alert message"
    }}
  ],
  "explanation": {{
    "farmer_advisory": "2-3 sentence overall farming strategy for the week."
  }}
}}

Rules:
- Reference specific days and temperatures from the forecast above
- Never say 'monitor conditions closely' or other generic advice
- If humidity > 70% and temp 20-30°C flag fungal disease risk
- If rainfall > 10mm flag as no-spray day
- If temp > 35°C flag heat stress and recommend morning irrigation
- Always populate forecast_7d with the 7-day forecast data provided above"""

        # ── Step 4: Call Groq ────────────────────────────────────────────────
        response_text = call_groq(prompt, max_tokens=1400, temperature=0.3)
        try:
            cleaned = re.sub(r'```(?:json)?', '', str(response_text)).strip()
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3].strip()
            result = json.loads(cleaned)
        except Exception:
            result = None

        if not result or not isinstance(result, dict):
            result = get_weather_fallback(crop, f"{location}, {state}")

        # Merge live forecast_7d from OWM if Groq didn't return it or returned empty
        if forecast_data and (not result.get('forecast_7d') or len(result.get('forecast_7d', [])) == 0):
            result['forecast_7d'] = forecast_data

        # ── Step 5: Save to databases ────────────────────────────────────────
        try:
            import os
            from supabase import create_client
            supabase_url = os.environ.get("SUPABASE_URL")
            supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
            if supabase_url and supabase_key:
                supabase = create_client(supabase_url, supabase_key)
                supabase.table("weather_queries").insert({
                    "user_id": str(farmer_id),
                    "location": f"{state}, {location}",
                    "weather_data": result.get("forecast_7d", []),
                    "farm_advice": result,
                    "language": input_data.get("language", "te"),
                }).execute()
        except Exception as e:
            logger.warning(f"Failed to save weather query to Supabase: {e}")

        Prediction.objects.create(
            farmer_uuid=str(farmer_id),
            prediction_type='weather_advisory',
            input_data=input_data,
            result=result,
            created_at=timezone.now()
        )

        return result

    except Exception as exc:
        logger.error(f"Weather advisory task failed: {exc}")
        raise self.retry(exc=exc, countdown=5)
