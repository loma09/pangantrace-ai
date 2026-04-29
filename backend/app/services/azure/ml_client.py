import json
from typing import List, Dict
from datetime import datetime, timedelta
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class AzureMLService:
    """
    Client untuk price prediction.
    Falls back to SMA prediction when Azure ML endpoint is not configured.
    """

    def __init__(self):
        self.endpoint = getattr(settings, 'AZURE_ML_ENDPOINT', '') or ''
        self.use_azure = bool(
            self.endpoint
            and 'your-ml-endpoint' not in self.endpoint
        )

    async def predict_prices(
        self,
        commodity: str,
        historical_prices: List[float],
        historical_dates: List[str],
        forecast_days: int = 7,
    ) -> Dict:
        """Prediksi harga menggunakan fallback SMA (Azure ML not deployed)."""
        return self._fallback_prediction(commodity, historical_prices, forecast_days)

    def _fallback_prediction(
        self, commodity: str, prices: List[float], days: int
    ) -> Dict:
        """Simple moving average prediction."""
        if not prices:
            return {"commodity": commodity, "forecast": [], "trend": "unknown"}
        avg = sum(prices[-7:]) / min(len(prices), 7)
        trend_factor = 1.002
        forecast_dates = [
            (datetime.now() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            for i in range(days)
        ]
        return {
            "commodity": commodity,
            "forecast": [
                {
                    "date": date,
                    "predicted_price": round(avg * (trend_factor ** (i + 1)), 0),
                    "lower_bound": round(avg * 0.95, 0),
                    "upper_bound": round(avg * 1.05, 0),
                    "confidence": 60.0,
                }
                for i, date in enumerate(forecast_dates)
            ],
            "trend": "slight_increase",
            "trend_pct": 0.2,
            "model_version": "fallback-sma",
        }


_ml_service = None


def get_ml_service() -> AzureMLService:
    global _ml_service
    if _ml_service is None:
        _ml_service = AzureMLService()
    return _ml_service
