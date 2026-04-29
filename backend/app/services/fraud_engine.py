from typing import List, Dict, Optional
from datetime import datetime
from app.services.azure.anomaly_detector import get_anomaly_service
from app.services.azure.openai_client import get_openai_service
import logging

logger = logging.getLogger(__name__)

FRAUD_THRESHOLDS = {
    "price_spike_pct": 15.0,  # Lonjakan harga > 15% dalam 1 hari = suspicious
    "volume_discrepancy_pct": 5.0,  # Selisih volume > 5% = potensi fraud
    "severity_high": 70.0,
    "severity_medium": 40.0,
}


class FraudEngine:
    def __init__(self):
        self.anomaly_service = get_anomaly_service()
        self.openai_service = get_openai_service()

    async def analyze_transaction_batch(
        self,
        transactions: List[Dict],
        commodity: str,
        province: str,
    ) -> Dict:
        """
        Pipeline utama: ambil batch transaksi, deteksi anomali,
        score fraud, generate AI insight.
        """
        if len(transactions) < 12:
            return {"status": "insufficient_data", "min_required": 12}

        timestamps = [datetime.fromisoformat(t["timestamp"]) for t in transactions]
        prices = [float(t["price"]) for t in transactions]
        volumes = [float(t["volume"]) for t in transactions]

        price_anomalies = await self.anomaly_service.detect_price_anomalies(
            timestamps=timestamps,
            values=prices,
        )
        volume_anomalies = await self.anomaly_service.detect_volume_anomalies(
            timestamps=timestamps,
            volumes=volumes,
            commodity=commodity,
        )

        fraud_score = self._calculate_fraud_score(price_anomalies, volume_anomalies)
        risk_level = self._classify_risk(fraud_score)

        chain_data = self._analyze_chain_discrepancy(transactions)

        insight = None
        if risk_level in ("high", "critical"):
            insight = await self.openai_service.generate_anomaly_insight(
                commodity=commodity,
                province=province,
                anomaly_data=price_anomalies,
                chain_data=chain_data,
            )

        return {
            "commodity": commodity,
            "province": province,
            "fraud_score": round(fraud_score, 1),
            "risk_level": risk_level,
            "price_anomalies": {
                "count": price_anomalies["anomaly_count"],
                "indices": price_anomalies["anomaly_indices"],
                "severity_scores": price_anomalies["severity_scores"],
            },
            "volume_anomalies": {
                "count": volume_anomalies["anomaly_count"],
                "indices": volume_anomalies["anomaly_indices"],
            },
            "chain_discrepancy": chain_data,
            "ai_insight": insight,
            "analyzed_at": datetime.now().isoformat(),
            "transaction_count": len(transactions),
        }

    def _calculate_fraud_score(
        self,
        price_anomalies: Dict,
        volume_anomalies: Dict,
    ) -> float:
        """
        Weighted fraud score 0-100:
        - 50% dari price anomaly severity
        - 30% dari volume anomaly count
        - 20% dari kombinasi keduanya (korelasi = lebih suspicious)
        """
        price_severity = max(price_anomalies.get("severity_scores", [0]))
        price_count_score = min(price_anomalies["anomaly_count"] * 5, 50)
        volume_count_score = min(volume_anomalies["anomaly_count"] * 5, 50)

        both_anomalous = (
            price_anomalies["anomaly_count"] > 0
            and volume_anomalies["anomaly_count"] > 0
        )
        correlation_bonus = 20 if both_anomalous else 0

        score = (
            price_severity * 0.5
            + price_count_score * 0.3
            + volume_count_score * 0.2
            + correlation_bonus
        )
        return min(score, 100)

    def _classify_risk(self, score: float) -> str:
        if score >= 80:
            return "critical"
        if score >= FRAUD_THRESHOLDS["severity_high"]:
            return "high"
        if score >= FRAUD_THRESHOLDS["severity_medium"]:
            return "medium"
        return "low"

    def _analyze_chain_discrepancy(self, transactions: List[Dict]) -> Dict:
        inbound = sum(t.get("volume_in", 0) for t in transactions)
        outbound = sum(t.get("volume_out", 0) for t in transactions)
        discrepancy = inbound - outbound
        discrepancy_pct = (discrepancy / inbound * 100) if inbound > 0 else 0
        return {
            "volume_in": round(inbound, 2),
            "volume_out": round(outbound, 2),
            "discrepancy": round(discrepancy, 2),
            "discrepancy_pct": round(discrepancy_pct, 2),
            "is_suspicious": discrepancy_pct
            > FRAUD_THRESHOLDS["volume_discrepancy_pct"],
        }


_fraud_engine = None


def get_fraud_engine() -> FraudEngine:
    global _fraud_engine
    if _fraud_engine is None:
        _fraud_engine = FraudEngine()
    return _fraud_engine
