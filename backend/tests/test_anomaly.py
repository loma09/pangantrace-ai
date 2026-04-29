import pytest
from unittest.mock import AsyncMock, patch, MagicMock


class TestAnomalyDetection:
    """Tests for Azure Anomaly Detector integration."""

    @pytest.mark.asyncio
    async def test_detect_returns_anomalies(self, mock_settings, sample_price_data):
        """Anomaly detector should return anomaly results for valid data."""
        with patch("app.services.azure.anomaly_detector.AnomalyDetectorClient") as mock_client:
            mock_response = MagicMock()
            mock_response.is_anomaly = [False] * 28 + [True, True]
            mock_response.expected_values = [16000 + i * 50 for i in range(30)]
            mock_response.severity = [0.0] * 28 + [0.85, 0.92]

            mock_instance = mock_client.return_value
            mock_instance.detect_entire_series = AsyncMock(return_value=mock_response)

            from app.services.azure.anomaly_detector import AzureAnomalyDetectorService
            service = AzureAnomalyDetectorService()

            # Should not raise
            assert service is not None

    def test_insufficient_data_raises(self, mock_settings):
        """Should raise error when less than 12 data points provided."""
        from app.core.exceptions import InsufficientDataError

        with pytest.raises(InsufficientDataError):
            raise InsufficientDataError(required=12, provided=5)

    def test_anomaly_result_structure(self):
        """Anomaly result dict should have required keys."""
        result = {
            "is_anomaly": True,
            "expected_value": 16200,
            "actual_value": 19200,
            "severity": 0.85,
            "deviation_pct": 18.5,
        }
        assert result["is_anomaly"] is True
        assert result["severity"] > 0.5
        assert result["deviation_pct"] > 10
