from azure.eventhub.aio import EventHubProducerClient
from azure.eventhub import EventData
from typing import Dict, List
from app.core.config import get_settings
import json
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class AzureEventHubService:
    """
    Client untuk Azure Event Hubs.
    Digunakan untuk streaming real-time transaksi distribusi pangan.
    """

    def __init__(self):
        self.connection_str = settings.AZURE_EVENTHUB_CONNECTION
        self.eventhub_name = settings.AZURE_EVENTHUB_NAME

    async def send_transaction_event(self, transaction: Dict) -> None:
        """Kirim satu event transaksi ke Event Hub."""
        async with EventHubProducerClient.from_connection_string(
            conn_str=self.connection_str,
            eventhub_name=self.eventhub_name,
        ) as producer:
            event_batch = await producer.create_batch()
            event_batch.add(EventData(json.dumps(transaction)))
            await producer.send_batch(event_batch)
            logger.debug(f"Transaction event sent: {transaction.get('id', 'unknown')}")

    async def send_batch_events(self, transactions: List[Dict]) -> int:
        """Kirim batch transaksi ke Event Hub. Return jumlah event terkirim."""
        sent = 0
        async with EventHubProducerClient.from_connection_string(
            conn_str=self.connection_str,
            eventhub_name=self.eventhub_name,
        ) as producer:
            event_batch = await producer.create_batch()
            for tx in transactions:
                try:
                    event_batch.add(EventData(json.dumps(tx)))
                    sent += 1
                except ValueError:
                    # Batch full, send and create new
                    await producer.send_batch(event_batch)
                    event_batch = await producer.create_batch()
                    event_batch.add(EventData(json.dumps(tx)))
                    sent += 1
            if len(event_batch) > 0:
                await producer.send_batch(event_batch)

        logger.info(f"Batch sent: {sent}/{len(transactions)} events")
        return sent

    async def send_alert_event(self, alert: Dict) -> None:
        """Kirim alert event untuk notifikasi real-time ke dashboard."""
        alert_event = {
            "type": "fraud_alert",
            "data": alert,
        }
        await self.send_transaction_event(alert_event)


_eventhub_service = None


def get_eventhub_service() -> AzureEventHubService:
    global _eventhub_service
    if _eventhub_service is None:
        _eventhub_service = AzureEventHubService()
    return _eventhub_service
