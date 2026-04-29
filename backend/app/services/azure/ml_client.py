import httpx
import json
from typing import List, Dict
from datetime import datetime, timedelta
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class AzureMLService:
    """
    Client untuk Azure ML managed endpoint.
    Model: Prophet + LSTM hybrid untuk prediksi harga 7 hari ke depan.
    Di-deploy via ml/notebooks/04_azure_ml_deploy.ipynb
    """

    def __init__(self):
        self.endpoint = settings.AZURE_ML_ENDPOINT
        self.headers = {
            "Authorization": f"Bearer {settings.AZURE_ML_KEY}",
            "Content-Type": "application/json",
            "azureml-model-deployment": settings.AZURE_ML_DEPLOYMENT_NAME,
        }

    async def predict_prices(
        self,
        commodity: str,
        historical_prices: List[float],
        historical_dates: List[str],
        forecast_days: int = 7,
    ) -> Dict:
        """
        Kirim data historis ke Azure ML endpoint,
        dapatkan prediksi harga + confidence interval.
        """
        payload = {
            "input_data": {
                "commodity": commodity,
                "historical_prices": historical_prices,
                "historical_dates": historical_dates,
                "forecast_days": forecast_days,
                "features": {
                    "include_seasonality": True,
                    "include_holiday_effects": True,
                    "region": "Indonesia",
                },
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    self.endpoint,
                    headers=self.headers,
                    json=payload,
                )
                response.raise_for_status()
                result = response.json()

                return self._format_prediction(result, commodity, forecast_days)

            except httpx.TimeoutException:
                logger.warning("Azure ML timeout, using fallback prediction")
                return self._fallback_prediction(
                    commodity, historical_prices, forecast_days
                )
            except Exception as e:
                logger.error(f"Azure ML error: {e}")
                raise

    def _format_prediction(self, raw: dict, commodity: str, days: int) -> Dict:
        forecast_dates = [
            (datetime.now() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            for i in range(days)
        ]
        return {
            "commodity": commodity,
            "forecast": [
                {
                    "date": date,
                    "predicted_price": round(price, 0),
                    "lower_bound": round(lower, 0),
                    "upper_bound": round(upper, 0),
                    "confidence": round(conf * 100, 1),
                }
                for date, price, lower, upper, conf in zip(
                    forecast_dates,
                    raw.get("predictions", []),
                    raw.get("lower_bounds", []),
                    raw.get("upper_bounds", []),
                    raw.get("confidence_scores", [0.85] * days),
                )
            ],
            "trend": raw.get("trend", "stable"),
            "trend_pct": round(raw.get("trend_percentage", 0), 1),
            "model_version": raw.get("model_version", "v1"),
        }

    def _fallback_prediction(
        self, commodity: str, prices: List[float], days: int
    ) -> Dict:
        """Simple moving average fallback jika Azure ML tidak tersedia."""
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
