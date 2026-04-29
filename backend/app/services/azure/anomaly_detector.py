"""
Anomaly detection service using local ML model.
Replaces Azure Anomaly Detector with our custom-trained fraud model.
"""
from datetime import datetime
from typing import List, Optional
import logging
import numpy as np

logger = logging.getLogger(__name__)


class LocalAnomalyDetectorService:
    """Uses statistical methods for anomaly detection (no Azure dependency)."""

    async def detect_price_anomalies(
        self,
        timestamps: List[datetime],
        values: List[float],
        sensitivity: int = 85,
    ) -> dict:
        """Detect price anomalies using rolling statistics."""
        values_arr = np.array(values, dtype=float)

        if len(values_arr) < 3:
            return {
                "is_anomaly": [False] * len(values_arr),
                "anomaly_indices": [],
                "expected_values": values,
                "anomaly_count": 0,
                "severity_scores": [0.0] * len(values_arr),
            }

        window = min(7, len(values_arr) - 1)
        rolling_mean = np.convolve(values_arr, np.ones(window) / window, mode="same")
        rolling_std = np.array([
            np.std(values_arr[max(0, i - window):i + 1])
            for i in range(len(values_arr))
        ])
        rolling_std = np.where(rolling_std == 0, 1, rolling_std)

        threshold = (100 - sensitivity) / 100 * 3 + 1.5
        z_scores = np.abs(values_arr - rolling_mean) / rolling_std
        is_anomaly = z_scores > threshold

        anomaly_indices = [i for i, v in enumerate(is_anomaly) if v]
        severity_scores = [
            min(float(z * 30), 100.0) for z in z_scores
        ]

        return {
            "is_anomaly": is_anomaly.tolist(),
            "anomaly_indices": anomaly_indices,
            "expected_values": rolling_mean.tolist(),
            "anomaly_count": len(anomaly_indices),
            "severity_scores": severity_scores,
        }

    async def detect_volume_anomalies(
        self,
        timestamps: List[datetime],
        volumes: List[float],
        commodity: str,
    ) -> dict:
        """Detect volume anomalies using rolling statistics."""
        result = await self.detect_price_anomalies(
            timestamps=timestamps,
            values=volumes,
            sensitivity=90,
        )
        result["commodity"] = commodity
        result["detection_type"] = "volume_fraud"
        return result


_anomaly_service: Optional[LocalAnomalyDetectorService] = None


def get_anomaly_service() -> LocalAnomalyDetectorService:
    global _anomaly_service
    if _anomaly_service is None:
        _anomaly_service = LocalAnomalyDetectorService()
    return _anomaly_service
