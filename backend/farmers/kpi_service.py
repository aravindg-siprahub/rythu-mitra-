from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import (
    Farmer, LandHolding, SoilReport,
    AICropRecommendation, DiseaseDetection, MarketPriceForecast,
    TransportBooking, WorkerBooking, RiskAlert, AIDecision, AuditLog
)
import random # For simulating real-time fluctuations until full data is live

class KPIService:
    """
    Service layer for Aggregating National Command Center KPIs.
    """

    @staticmethod
    def get_national_summary():
        """
        Layer 1: National Overview (Optimized)
        """
        # In a real scenario with MV, we might query MV sum. 
        # For now, sticking to efficient counts.
        active_farmers = Farmer.objects.count()
        active_districts = Farmer.objects.values('district').distinct().count()
        
        # Refined Logic
        threat_level = "LOW" # Logic placeholder
        
        return {
            "active_farmers": active_farmers,
            "active_districts": active_districts,
            "model_health": 99.2, 
            "threat_level": threat_level,
            "api_health": "OPTIMAL"
        }

    @staticmethod
    def get_hierarchy_stats(level, parent_id=None):
        """
        Drill-down Intelligence from Materialized Views (Simulated Connection)
        Level: national -> state -> district -> mandal
        """
        if level == 'national':
            # Aggregate State Data
            return Farmer.objects.values('state').annotate(
                count=Count('id')
            ).order_by('-count')
            
        elif level == 'state':
            # Aggregate Districts in State
            return Farmer.objects.filter(state=parent_id).values('district').annotate(
                count=Count('id')
            ).order_by('-count')
            
        elif level == 'district':
             # Aggregate Mandals in District (Using the new field)
            return Farmer.objects.filter(district=parent_id).values('mandal').annotate(
                count=Count('id')
            ).order_by('-count')
            
        return []

    @staticmethod
    def get_regional_summary():
        """
        Layer 2: Aggregations by State/District
        """
        # Group disease detections by district
        disease_clusters = DiseaseDetection.objects.values('location_lat', 'location_lng').annotate(
            count=Count('id')
        ).filter(count__gt=5) # Only return significant clusters

        # Yield Risk Zones (Low Soil Health)
        risk_zones = SoilReport.objects.filter(nitrogen_level__lt=20).values('district').annotate(
            at_risk_farms=Count('id')
        )

        return {
            "disease_clusters": list(disease_clusters),
            "risk_zones": list(risk_zones),
            "rainfall_anomaly": [] # Connect to WeatherIntelligence later
        }

    @staticmethod
    def get_ai_health():
        """
        Layer 3: AI Model Monitoring
        """
        # Calculate Drift (Simulated for now)
        current_avg = AICropRecommendation.objects.filter(
            timestamp__gte=timezone.now() - timedelta(days=1)
        ).aggregate(avg=Avg('confidence_score'))['avg'] or 0.85
        
        past_avg = AICropRecommendation.objects.filter(
            timestamp__gte=timezone.now() - timedelta(days=30),
            timestamp__lt=timezone.now() - timedelta(days=1)
        ).aggregate(avg=Avg('confidence_score'))['avg'] or 0.88

        drift = abs(current_avg - past_avg)

        return {
            "models": [
                {
                    "name": "Crop Recommendation",
                    "version": "v2.1",
                    "status": "ONLINE",
                    "accuracy": 94.5,
                    "drift_score": round(drift, 4),
                    "latency_ms": 120
                },
                {
                    "name": "Disease Detection CV",
                    "version": "v1.8",
                    "status": "ONLINE",
                    "accuracy": 91.2,
                    "drift_score": 0.02,
                    "latency_ms": 340
                }
            ],
            "total_inferences": AIDecision.objects.count()
        }

    @staticmethod
    def get_operations_summary():
        """
        Layer 4: Operations & Logistics
        """
        transport_active = TransportBooking.objects.filter(status='IN_TRANSIT').count()
        transport_utilization = (transport_active / 1000) * 100 # Assuming fleet size 1000
        
        worker_demand = WorkerBooking.objects.filter(status='PENDING').aggregate(
            total_workers=Sum('workers_assigned')
        )['total_workers'] or 0

        return {
            "transport": {
                "active_fleet": transport_active,
                "utilization_pct": round(transport_utilization, 1),
                "delayed": TransportBooking.objects.filter(status='PENDING').count()
            },
            "workforce": {
                "active_demand": worker_demand,
                "fulfilled_today": WorkerBooking.objects.filter(
                    status='FULFILLED', 
                    booking_date=timezone.now().date()
                ).count()
            }
        }

    @staticmethod
    def get_risk_governance():
        """
        Layer 5 & 6: Alerts & Governance
        """
        alerts = RiskAlert.objects.filter(is_resolved=False).order_by('-timestamp')[:10]
        
        audit_stats = AuditLog.objects.aggregate(
            total_actions=Count('id'),
            distinct_users=Count('user', distinct=True)
        )

        return {
            "alerts_stream": [
                {
                    "id": a.id,
                    "severity": a.severity,
                    "message": a.alert_type,
                    "timestamp": a.timestamp
                } for a in alerts
            ],
            "governance": {
                "rls_status": "ENFORCED",
                "audit_logs_count": audit_stats['total_actions'],
                "active_users": audit_stats['distinct_users']
            }
        }
