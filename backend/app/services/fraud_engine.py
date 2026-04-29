from typing import List, Dict, Optional
from datetime import datetime
from app.services.azure.anomaly_detector import get_anomaly_service
import logging

logger = logging.getLogger(__name__)

FRAUD_THRESHOLDS = {
    "price_spike_pct": 15.0,
    "volume_discrepancy_pct": 5.0,
    "severity_high": 70.0,
    "severity_medium": 40.0,
}


class FraudEngine:
    def __init__(self):
        self.anomaly_service = get_anomaly_service()
        self._openai_service = None

    def _get_openai(self):
        """Lazy-load OpenAI to avoid crash if not configured."""
        if self._openai_service is None:
            try:
                from app.services.azure.openai_client import get_openai_service
                self._openai_service = get_openai_service()
            except Exception as e:
                logger.warning(f"OpenAI service unavailable: {e}")
                self._openai_service = None
        return self._openai_service

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

        # --- AI Insight (non-fatal) ---
        insight = None
        if risk_level in ("high", "critical"):
            openai = self._get_openai()
            if openai:
                try:
                    insight_result = await openai.generate_anomaly_insight(
                        commodity=commodity,
                        province=province,
                        anomaly_data=price_anomalies,
                        chain_data=chain_data,
                    )
                    insight = insight_result.get("insight") if isinstance(insight_result, dict) else str(insight_result)
                except Exception as e:
                    logger.warning(f"AI insight generation failed: {e}")
                    insight = self._generate_local_insight(
                        commodity, province, price_anomalies, chain_data, fraud_score
                    )
            else:
                insight = self._generate_local_insight(
                    commodity, province, price_anomalies, chain_data, fraud_score
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

    def _generate_local_insight(
        self, commodity: str, province: str, price_data: Dict, chain_data: Dict, score: float
    ) -> str:
        """Generate meaningful insight locally when OpenAI is unavailable."""
        anomaly_count = price_data.get("anomaly_count", 0)
        severity_scores = price_data.get("severity_scores", [])
        max_severity = max(severity_scores) if severity_scores else 0
        disc_pct = chain_data.get("discrepancy_pct", 0)

        parts = []
        parts.append(
            f"Terdeteksi {anomaly_count} titik anomali harga pada distribusi "
            f"{commodity.replace('_', ' ')} di {province} dengan severity tertinggi "
            f"{round(max_severity, 1)}/100."
        )

        if disc_pct > 10:
            parts.append(
                f"Discrepancy volume distribusi mencapai {round(disc_pct, 1)}%, "
                f"mengindikasikan potensi kebocoran subsidi yang signifikan di layer distributor. "
                f"Volume masuk ({chain_data.get('volume_in', 0)} ton) tidak sebanding dengan "
                f"volume keluar ({chain_data.get('volume_out', 0)} ton)."
            )
        elif disc_pct > 5:
            parts.append(
                f"Selisih volume distribusi sebesar {round(disc_pct, 1)}% perlu diverifikasi. "
                f"Kemungkinan terdapat penyusutan berlebihan di rantai pasok."
            )

        if score >= 80:
            parts.append(
                "REKOMENDASI: Segera lakukan audit fisik stok gudang distributor terkait "
                "dan verifikasi silang dengan data pengiriman dari Bulog regional."
            )
        elif score >= 60:
            parts.append(
                "REKOMENDASI: Tingkatkan frekuensi monitoring pada titik distribusi "
                "yang terdeteksi anomali dan minta laporan harian dari distributor."
            )

        return " ".join(parts)

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
