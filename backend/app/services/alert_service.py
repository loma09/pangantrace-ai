from typing import List, Dict, Optional
from datetime import datetime
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class AlertService:
    """Service untuk mengelola alert fraud dan notifikasi."""

    async def create_alert_from_anomaly(
        self,
        commodity: str,
        province: str,
        fraud_score: float,
        risk_level: str,
        detection_type: str,
        ai_insight: Optional[str] = None,
    ) -> Dict:
        """Buat alert baru dari hasil deteksi anomali."""
        alert_id = f"ALR-{datetime.now().strftime('%Y-%m%d')}-{hash(commodity + province) % 1000:03d}"
        severity = risk_level
        title = self._generate_title(commodity, province, detection_type, fraud_score)

        alert = {
            "id": alert_id,
            "title": title,
            "province": province,
            "commodity": commodity,
            "severity": severity,
            "fraud_score": round(fraud_score, 1),
            "detected_at": datetime.now().isoformat(),
            "azure_service": "Azure Anomaly Detector",
            "status": "open",
            "ai_insight": ai_insight,
        }

        logger.info(f"Alert created: {alert_id} | {severity} | {title}")
        # TODO: Persist to Azure SQL via alert_repo
        # TODO: Send notification via Azure Event Hubs
        return alert

    async def update_status(
        self, alert_id: str, status: str, notes: Optional[str] = None
    ) -> Dict:
        """Update status alert: open → investigating → resolved."""
        valid_statuses = ["open", "investigating", "resolved"]
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")

        logger.info(f"Alert {alert_id} status updated to: {status}")
        return {"id": alert_id, "status": status, "updated_at": datetime.now().isoformat()}

    def _generate_title(
        self, commodity: str, province: str, detection_type: str, score: float
    ) -> str:
        """Generate judul alert yang deskriptif."""
        commodity_label = commodity.replace("_", " ").title()
        if detection_type == "price_spike":
            return f"Lonjakan harga {commodity_label} di {province} (skor: {score:.1f})"
        elif detection_type == "volume_fraud":
            return f"Discrepancy volume {commodity_label} di {province} (skor: {score:.1f})"
        else:
            return f"Anomali {commodity_label} terdeteksi di {province} (skor: {score:.1f})"


_alert_service = None


def get_alert_service() -> AlertService:
    global _alert_service
    if _alert_service is None:
        _alert_service = AlertService()
    return _alert_service
