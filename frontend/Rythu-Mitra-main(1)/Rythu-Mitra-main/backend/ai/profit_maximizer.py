"""
Farmer Profit Maximization Engine
Combines all AI predictions to maximize farmer profitability
"""

import logging
from typing import Dict, Any
from datetime import datetime

from .crop_recommendation import get_crop_engine
from .weather_ai import get_weather_engine
from .market_forecast import get_market_engine

logger = logging.getLogger(__name__)


class ProfitMaximizationEngine:
    """
    Unified engine that combines crop, weather, and market predictions
    to generate actionable profit maximization strategies
    """
    
    def __init__(self):
        self.crop_engine = get_crop_engine()
        self.weather_engine = get_weather_engine()
        self.market_engine = get_market_engine()
    
    def maximize_profit(self, farmer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive profit maximization plan
        
        Args:
            farmer_data: Dictionary containing:
                - soil: {N, P, K, pH, etc.}
                - location: Location string
                - region: Region name
                - land_size_acres: Farm size
                - current_crop: Optional current crop
                
        Returns:
            Complete profit maximization strategy
        """
        try:
            logger.info("Generating profit maximization plan")
            
            # Get soil and farm data
            soil_data = farmer_data.get("soil", {})
            location = farmer_data.get("location", "Unknown")
            region = farmer_data.get("region", "Central")
            land_size = farmer_data.get("land_size_acres", 1.0)
            
            # Step 1: Get crop recommendations
            crop_recommendations = self.crop_engine.predict(soil_data, land_size)
            top_crop = crop_recommendations["recommendations"][0]
            
            # Step 2: Get weather forecast
            weather_forecast = self.weather_engine.forecast(location, days=30)
            
            # Step 3: Get market predictions for top crop
            estimated_yield = top_crop["expected_yield_kg"]
            market_forecast = self.market_engine.predict(
                top_crop["crop"], region, estimated_yield, days=15
            )
            
            # Step 4: Calculate planting date based on weather
            planting_date = self._calculate_planting_date(
                weather_forecast, top_crop["season"]
            )
            
            # Step 5: Generate fertilizer schedule
            fertilizer_schedule = self._optimize_fertilizer_schedule(
                soil_data, top_crop["crop"], weather_forecast
            )
            
            # Step 6: Calculate harvest date
            harvest_date = self._calculate_harvest_date(
                planting_date, top_crop["crop"]
            )
            
            # Step 7: Assess risks
            risk_assessment = self._assess_risks(
                weather_forecast, market_forecast, top_crop
            )
            
            # Step 8: Calculate expected profit
            profit_analysis = self._calculate_profit(
                top_crop, market_forecast, land_size, fertilizer_schedule
            )
            
            # Step 9: Generate actionable insights
            action_plan = self._generate_action_plan(
                top_crop, planting_date, harvest_date, market_forecast, risk_assessment
            )
            
            result = {
                "generated_at": datetime.now().isoformat(),
                "farm_details": {
                    "location": location,
                    "region": region,
                    "land_size_acres": land_size,
                },
                "recommended_crop": {
                    "name": top_crop["crop"],
                    "confidence": top_crop["confidence"],
                    "season": top_crop["season"],
                },
                "planting_strategy": {
                    "recommended_planting_date": planting_date,
                    "harvest_date": harvest_date,
                    "growing_period_days": self._get_growing_period(top_crop["crop"]),
                },
                "fertilizer_schedule": fertilizer_schedule,
                "market_strategy": {
                    "optimal_sell_date": market_forecast["optimal_timing"]["optimal_date"],
                    "expected_price": market_forecast["optimal_timing"]["optimal_price"],
                    "sell_recommendation": market_forecast["recommendation"]["action"],
                },
                "profit_analysis": profit_analysis,
                "risk_assessment": risk_assessment,
                "action_plan": action_plan,
                "weather_summary": {
                    "drought_risk": weather_forecast["drought_risk"]["risk_level"],
                    "pest_risk": weather_forecast["pest_outbreak_risk"]["risk_level"],
                    "extreme_alerts": len(weather_forecast["extreme_weather_alerts"]),
                },
            }
            
            logger.info(f"Profit maximization plan generated for {top_crop['crop']}")
            return result
            
        except Exception as e:
            logger.error(f"Error in profit maximization: {e}")
            raise
    
    def _calculate_planting_date(self, weather: Dict, season: str) -> str:
        """Calculate optimal planting date based on weather and season"""
        # Simplified logic - in production, use more sophisticated analysis
        from datetime import datetime, timedelta
        
        # Check for favorable conditions in next 7 days
        for day in weather["daily_forecast"][:7]:
            if day["rain_probability"] < 70 and day["temperature_avg"] > 15:
                return day["date"]
        
        # Default to 3 days from now
        return (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    
    def _optimize_fertilizer_schedule(
        self, soil: Dict, crop: str, weather: Dict
    ) -> list:
        """Generate optimized fertilizer application schedule"""
        schedule = []
        
        # Base fertilizer at planting
        schedule.append({
            "stage": "Planting",
            "days_after_planting": 0,
            "fertilizer_type": "NPK (10:26:26)",
            "quantity_per_acre_kg": 50,
            "application_method": "Basal application",
            "cost_per_acre_inr": 1500,
        })
        
        # First top dressing
        schedule.append({
            "stage": "Vegetative Growth",
            "days_after_planting": 20,
            "fertilizer_type": "Urea (46% N)",
            "quantity_per_acre_kg": 25,
            "application_method": "Top dressing",
            "cost_per_acre_inr": 500,
        })
        
        # Second top dressing
        schedule.append({
            "stage": "Flowering/Fruiting",
            "days_after_planting": 45,
            "fertilizer_type": "NPK (19:19:19)",
            "quantity_per_acre_kg": 30,
            "application_method": "Top dressing",
            "cost_per_acre_inr": 900,
        })
        
        return schedule
    
    def _calculate_harvest_date(self, planting_date: str, crop: str) -> str:
        """Calculate expected harvest date"""
        from datetime import datetime, timedelta
        
        growing_period = self._get_growing_period(crop)
        planting = datetime.strptime(planting_date, "%Y-%m-%d")
        harvest = planting + timedelta(days=growing_period)
        
        return harvest.strftime("%Y-%m-%d")
    
    def _get_growing_period(self, crop: str) -> int:
        """Get typical growing period in days"""
        periods = {
            "Rice": 120,
            "Wheat": 110,
            "Cotton": 150,
            "Maize": 90,
            "Tomato": 75,
            "Potato": 90,
            "Onion": 120,
            "Sugarcane": 365,
            "Pulses": 100,
            "Groundnut": 110,
            "Soybean": 100,
            "Chilli": 120,
        }
        return periods.get(crop, 100)
    
    def _assess_risks(self, weather: Dict, market: Dict, crop: Dict) -> Dict:
        """Comprehensive risk assessment"""
        risks = []
        overall_risk_score = 0
        
        # Weather risks
        if weather["drought_risk"]["risk_level"] == "High":
            risks.append({
                "type": "Drought",
                "severity": "High",
                "impact": "Reduced yield by 20-40%",
                "mitigation": "Install drip irrigation system",
            })
            overall_risk_score += 3
        
        if weather["pest_outbreak_risk"]["risk_level"] == "High":
            risks.append({
                "type": "Pest Outbreak",
                "severity": "High",
                "impact": "Potential crop damage",
                "mitigation": "Apply preventive pesticides",
            })
            overall_risk_score += 2
        
        # Market risks
        if market["volatility_analysis"]["volatility_level"] == "High":
            risks.append({
                "type": "Price Volatility",
                "severity": "Moderate",
                "impact": "Uncertain revenue",
                "mitigation": "Consider contract farming",
            })
            overall_risk_score += 2
        
        # Determine overall risk level
        if overall_risk_score >= 5:
            risk_level = "High"
        elif overall_risk_score >= 3:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        return {
            "overall_risk_level": risk_level,
            "risk_score": overall_risk_score,
            "identified_risks": risks,
            "risk_count": len(risks),
        }
    
    def _calculate_profit(
        self, crop: Dict, market: Dict, land_size: float, fertilizer: list
    ) -> Dict:
        """Calculate expected profit"""
        # Revenue
        expected_yield = crop["expected_yield_kg"]
        expected_price = market["optimal_timing"]["optimal_price"]
        gross_revenue = expected_yield * expected_price
        
        # Costs
        seed_cost = land_size * 2000  # ₹2000 per acre
        fertilizer_cost = sum(f["cost_per_acre_inr"] for f in fertilizer) * land_size
        pesticide_cost = land_size * 1500  # ₹1500 per acre
        labor_cost = land_size * 5000  # ₹5000 per acre
        irrigation_cost = land_size * 3000  # ₹3000 per acre
        
        total_cost = seed_cost + fertilizer_cost + pesticide_cost + labor_cost + irrigation_cost
        
        # Profit
        net_profit = gross_revenue - total_cost
        profit_margin = (net_profit / gross_revenue) * 100 if gross_revenue > 0 else 0
        roi = (net_profit / total_cost) * 100 if total_cost > 0 else 0
        
        return {
            "gross_revenue_inr": round(gross_revenue, 2),
            "total_cost_inr": round(total_cost, 2),
            "net_profit_inr": round(net_profit, 2),
            "profit_margin_percent": round(profit_margin, 2),
            "roi_percent": round(roi, 2),
            "cost_breakdown": {
                "seeds": round(seed_cost, 2),
                "fertilizers": round(fertilizer_cost, 2),
                "pesticides": round(pesticide_cost, 2),
                "labor": round(labor_cost, 2),
                "irrigation": round(irrigation_cost, 2),
            },
            "profitability_rating": self._get_profitability_rating(roi),
        }
    
    def _get_profitability_rating(self, roi: float) -> str:
        """Get profitability rating based on ROI"""
        if roi > 100:
            return "Excellent"
        elif roi > 50:
            return "Very Good"
        elif roi > 25:
            return "Good"
        elif roi > 0:
            return "Moderate"
        else:
            return "Poor"
    
    def _generate_action_plan(
        self, crop: Dict, planting_date: str, harvest_date: str, market: Dict, risks: Dict
    ) -> list:
        """Generate step-by-step action plan"""
        actions = []
        
        # Immediate actions
        actions.append({
            "priority": "High",
            "timeline": "This Week",
            "action": f"Prepare land for {crop['crop']} cultivation",
            "details": "Plow, level, and prepare seedbed",
        })
        
        actions.append({
            "priority": "High",
            "timeline": f"By {planting_date}",
            "action": "Procure quality seeds and fertilizers",
            "details": "Purchase certified seeds from authorized dealers",
        })
        
        # Planting
        actions.append({
            "priority": "Critical",
            "timeline": planting_date,
            "action": "Plant seeds with proper spacing",
            "details": "Follow recommended seed rate and spacing",
        })
        
        # Risk mitigation
        if risks["overall_risk_level"] in ["High", "Moderate"]:
            for risk in risks["identified_risks"]:
                actions.append({
                    "priority": "High",
                    "timeline": "Ongoing",
                    "action": f"Mitigate {risk['type']} risk",
                    "details": risk["mitigation"],
                })
        
        # Harvest and sell
        actions.append({
            "priority": "Critical",
            "timeline": harvest_date,
            "action": "Harvest crop at optimal maturity",
            "details": "Ensure proper harvesting techniques to minimize losses",
        })
        
        actions.append({
            "priority": "High",
            "timeline": market["optimal_timing"]["optimal_date"],
            "action": f"Sell produce - {market['recommendation']['action']}",
            "details": market["recommendation"]["reason"],
        })
        
        return actions


# Global instance
_profit_engine = None


def get_profit_engine() -> ProfitMaximizationEngine:
    """Get or create singleton instance of profit maximization engine"""
    global _profit_engine
    if _profit_engine is None:
        _profit_engine = ProfitMaximizationEngine()
    return _profit_engine
