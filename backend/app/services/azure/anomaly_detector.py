from azure.ai.anomalydetector import AnomalyDetectorClient
from azure.ai.anomalydetector.models import (
    UnivariateDetectionOptions,
    TimeSeriesPoint,
    TimeGranularity,
    ImputeMode,
)
from azure.core.credentials import AzureKeyCredential
from datetime import datetime
from typing import List, Optional
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class AzureAnomalyDetectorService:
    def __init__(self):
        self.client = AnomalyDetectorClient(
            endpoint=settings.AZURE_ANOMALY_ENDPOINT,
            credential=AzureKeyCredential(settings.AZURE_ANOMALY_KEY),
        )

    async def detect_price_anomalies(
        self,
        timestamps: List[datetime],
        values: List[float],
        sensitivity: int = 85,
    ) -> dict:
        """
        Deteksi anomali harga komoditas menggunakan Azure Anomaly Detector.
        Sensitivity 85 = cukup sensitif untuk fraud detection tanpa false positive berlebihan.
        """
        series = [
            TimeSeriesPoint(timestamp=ts, value=val)
            for ts, val in zip(timestamps, values)
        ]

        request = UnivariateDetectionOptions(
            series=series,
            granularity=TimeGranularity.DAILY,
            sensitivity=sensitivity,
            impute_mode=ImputeMode.AUTO,
        )

        try:
            response = self.client.detect_univariate_entire_series(request)
            anomaly_indices = [
                i for i, is_anomaly in enumerate(response.is_anomaly) if is_anomaly
            ]
            return {
                "is_anomaly": response.is_anomaly,
                "anomaly_indices": anomaly_indices,
                "expected_values": response.expected_values,
                "upper_margins": response.upper_margins,
                "lower_margins": response.lower_margins,
                "anomaly_count": len(anomaly_indices),
                "severity_scores": self._calculate_severity(
                    values,
                    response.expected_values,
                    response.upper_margins,
                    response.lower_margins,
                ),
            }
        except Exception as e:
            logger.error(f"Azure Anomaly Detector error: {e}")
            raise

    async def detect_volume_anomalies(
        self,
        timestamps: List[datetime],
        volumes: List[float],
        commodity: str,
    ) -> dict:
        """
        Deteksi anomali volume distribusi — kunci untuk mendeteksi
        kebocoran subsidi di layer distributor.
        """
        result = await self.detect_price_anomalies(
            timestamps=timestamps,
            values=volumes,
            sensitivity=90,  # Lebih sensitif untuk volume fraud
        )
        result["commodity"] = commodity
        result["detection_type"] = "volume_fraud"
        return result

    def _calculate_severity(
        self,
        actual: List[float],
        expected: List[float],
        upper: List[float],
        lower: List[float],
    ) -> List[Optional[float]]:
        """
        Hitung severity score 0-100 berdasarkan seberapa jauh nilai dari expected range.
        """
        scores = []
        for a, e, u, l in zip(actual, expected, upper, lower):
            if a > e:
                margin = u if u and u > e else e * 0.1
                deviation = (a - e) / max(margin, 0.001)
            else:
                margin = abs(l - e) if l and l < e else e * 0.1
                deviation = (e - a) / max(margin, 0.001)
            score = min(deviation * 50, 100)
            scores.append(round(score, 2))
        return scores


_anomaly_service: Optional[AzureAnomalyDetectorService] = None


def get_anomaly_service() -> AzureAnomalyDetectorService:
    global _anomaly_service
    if _anomaly_service is None:
        _anomaly_service = AzureAnomalyDetectorService()
    return _anomaly_service
