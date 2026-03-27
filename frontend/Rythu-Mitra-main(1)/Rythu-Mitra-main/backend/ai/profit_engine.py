class FarmerProfitEngine:
    """
    Calculates the financial viability and recommendations for farmers.
    Integrates Market Price Intelligence + Cost of Cultivation.
    """
    
    # Generic Cost of Cultivation (INR per acre) - approximates
    COST_DB = {
        'Rice': 25000,
        'Wheat': 18000,
        'Cotton': 30000,
        'Maize': 15000,
        'Sugarcane': 45000,
        'Tomato': 40000,
        'Potato': 35000
    }

    # Generic Average Yield (Quintals per acre)
    YIELD_DB = {
        'Rice': 25,
        'Wheat': 20,
        'Cotton': 15,
        'Maize': 25,
        'Sugarcane': 300,
        'Tomato': 150,
        'Potato': 100
    }

    @staticmethod
    def calculate_profit(crop, predicted_price_per_quintal, acres=1):
        """
        Computes ROI and net profit for a given crop.
        """
        cost = FarmerProfitEngine.COST_DB.get(crop, 20000) * acres
        expected_yield = FarmerProfitEngine.YIELD_DB.get(crop, 20) * acres
        
        gross_revenue = expected_yield * predicted_price_per_quintal
        net_profit = gross_revenue - cost
        roi = (net_profit / cost) * 100 if cost > 0 else 0

        return {
            'crop': crop,
            'acres': acres,
            'total_cost': round(cost, 2),
            'expected_revenue': round(gross_revenue, 2),
            'net_profit': round(net_profit, 2),
            'roi_percent': round(roi, 2),
            'market_risk': 'Low' if roi > 50 else 'Medium' if roi > 20 else 'High'
        }

    @staticmethod
    def rank_crops_by_profit(crops_list, market_prices, acres=1):
        """
        Ranks a list of recommended crops by their potential profitability.
        
        Args:
            crops_list (list): ['Rice', 'Maize']
            market_prices (dict): {'Rice': 2200, 'Maize': 1800} -> Predicted future prices
        """
        ranked = []
        for crop in crops_list:
            price = market_prices.get(crop, 1500) # Default conservative price
            stats = FarmerProfitEngine.calculate_profit(crop, price, acres)
            ranked.append(stats)
        
        return sorted(ranked, key=lambda x: x['net_profit'], reverse=True)
