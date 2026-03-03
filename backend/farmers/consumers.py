import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .kpi_service import KPIService
from asgiref.sync import sync_to_async

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "dashboard_updates"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_status',
            'status': 'connected',
            'message': 'Connected to National Ag Command Center Telemetry'
        }))

        # Start simulated stream in background task (for demo purposes)
        # In production, this would be triggered by Celery tasks or Signals sending to the group
        self.stream_task = asyncio.create_task(self.broadcast_updates())

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if hasattr(self, 'stream_task'):
            self.stream_task.cancel()

    async def receive(self, text_data):
        # Handle messages from frontend if needed (e.g., changing filters)
        pass

    async def broadcast_updates(self):
        """
        Simulates real-time telemetry stream.
        In prod, this loop wouldn't exist here; data would be pushed to the channel layer 
        by external producers (Celery, Signals).
        """
        try:
            while True:
                # 1. Fetch live data (wrapped in sync_to_async because Django ORM is sync)
                kpi_data = await sync_to_async(KPIService.get_national_summary)()
                ops_data = await sync_to_async(KPIService.get_operations_summary)()
                ai_data = await sync_to_async(KPIService.get_ai_health)()
                risk_gov_data = await sync_to_async(KPIService.get_risk_governance)()
                
                # 2. Send data to WebSocket
                await self.send(text_data=json.dumps({
                    'type': 'telemetry_update',
                    'data': {
                        'kpi': kpi_data,
                        'operations': ops_data,
                        'ai': ai_data,
                        'alerts_governance': risk_gov_data,
                        'timestamp': str(asyncio.get_event_loop().time())
                    }
                }))
                
                # Stream frequency: 3 seconds
                await asyncio.sleep(3)
        except asyncio.CancelledError:
            pass
