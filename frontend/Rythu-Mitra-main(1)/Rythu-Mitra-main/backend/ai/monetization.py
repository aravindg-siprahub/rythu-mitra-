class MonetizationEngine:
    """
    Handles business logic for pricing, subscriptions, and fees.
    """
    
    SUBSCRIPTION_TIERS = {
        'FREE': {
            'price': 0,
            'features': ['basic_weather', 'market_prices', 'community_posts'],
            'daily_limit': 5
        },
        'PRO': {
            'price': 199, # INR per month
            'features': ['crop_recommendation', 'disease_detection', 'sms_alerts'],
            'daily_limit': 50
        },
        'ENTERPRISE': {
            'price': 999, # INR per month
            'features': ['all', 'api_access', 'dedicated_support', 'drone_integration'],
            'daily_limit': 1000
        }
    }

    TRANSACTION_FEES = {
        'worker_hiring': 0.05, # 5%
        'transport_booking': 0.08, # 8%
        'market_sale': 0.02 # 2%
    }

    @staticmethod
    def get_user_tier(user):
        # In production this would query UserProfile model
        # Defaulting to FREE for now
        return 'FREE'

    @staticmethod
    def calculate_platform_fee(amount, service_type):
        """
        Calculates the platform fee for a marketplace transaction.
        """
        fee_percent = MonetizationEngine.TRANSACTION_FEES.get(service_type, 0.0)
        fee = amount * fee_percent
        return {
            'total_amount': amount,
            'platform_fee': round(fee, 2),
            'payable_to_provider': round(amount - fee, 2)
        }

    @staticmethod
    def check_limit(user, current_usage):
        tier = MonetizationEngine.get_user_tier(user)
        limit = MonetizationEngine.SUBSCRIPTION_TIERS[tier]['daily_limit']
        
        if current_usage >= limit:
             return {'allowed': False, 'message': f"Daily limit reached for {tier} tier. Upgrade to PRO."}
        
        return {'allowed': True}
