import pytest


class TestFraudEngine:
    """Tests for fraud scoring engine."""

    def test_fraud_score_calculation(self):
        """Fraud score should be weighted combination of anomaly signals."""
        from app.services.fraud_engine import FraudEngine

        engine = FraudEngine()

        # High anomaly = high score
        result = engine.compute_fraud_score(
            price_anomaly_score=0.9,
            volume_discrepancy_pct=15.0,
            correlation_score=0.7,
        )
        assert result["fraud_score"] > 70
        assert result["risk_level"] in ("high", "critical")

    def test_low_anomaly_low_score(self):
        """Normal data should produce low fraud score."""
        from app.services.fraud_engine import FraudEngine

        engine = FraudEngine()

        result = engine.compute_fraud_score(
            price_anomaly_score=0.1,
            volume_discrepancy_pct=1.0,
            correlation_score=0.1,
        )
        assert result["fraud_score"] < 40
        assert result["risk_level"] == "low"

    def test_risk_level_thresholds(self):
        """Risk levels: <40=low, 40-70=medium, 70-80=high, >80=critical."""
        from app.services.fraud_engine import FraudEngine

        engine = FraudEngine()

        assert engine._get_risk_level(30) == "low"
        assert engine._get_risk_level(55) == "medium"
        assert engine._get_risk_level(75) == "high"
        assert engine._get_risk_level(90) == "critical"

    def test_chain_discrepancy_detection(self, sample_volume_data):
        """Should detect discrepancy above 5% threshold."""
        vol_in = sample_volume_data["volume_in"]
        vol_out = sample_volume_data["volume_out"]
        discrepancy_pct = (vol_in - vol_out) / vol_in * 100

        assert discrepancy_pct > 5.0  # 13.6% — should be flagged


class TestFraudEngineEdgeCases:
    """Edge case tests for fraud engine."""

    def test_zero_volume_no_crash(self):
        """Should handle zero volume gracefully."""
        from app.services.fraud_engine import FraudEngine

        engine = FraudEngine()
        result = engine.compute_fraud_score(
            price_anomaly_score=0.5,
            volume_discrepancy_pct=0.0,
            correlation_score=0.0,
        )
        assert result["fraud_score"] >= 0

    def test_max_score_capped_at_100(self):
        """Fraud score should never exceed 100."""
        from app.services.fraud_engine import FraudEngine

        engine = FraudEngine()
        result = engine.compute_fraud_score(
            price_anomaly_score=1.0,
            volume_discrepancy_pct=50.0,
            correlation_score=1.0,
        )
        assert result["fraud_score"] <= 100
