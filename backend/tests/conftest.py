import pytest
from unittest.mock import AsyncMock, patch


@pytest.fixture
def mock_settings():
    """Override settings for testing."""
    with patch("app.core.config.get_settings") as mock:
        settings = mock.return_value
        settings.DEBUG = True
        settings.AZURE_ANOMALY_ENDPOINT = "https://test.cognitiveservices.azure.com"
        settings.AZURE_ANOMALY_KEY = "test-key"
        settings.AZURE_ML_ENDPOINT = "https://test.ml.azure.com"
        settings.AZURE_ML_KEY = "test-key"
        settings.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com"
        settings.AZURE_OPENAI_KEY = "test-key"
        settings.AZURE_OPENAI_DEPLOYMENT = "gpt-4o"
        yield settings


@pytest.fixture
def sample_price_data():
    """Sample price time-series for testing."""
    return [
        {"timestamp": f"2026-04-{d:02d}T00:00:00Z", "value": 16000 + (d * 50)}
        for d in range(1, 31)
    ]


@pytest.fixture
def sample_volume_data():
    """Sample volume data for chain discrepancy testing."""
    return {
        "volume_in": 1250.5,
        "volume_out": 1080.2,
        "from_node": "DIST-JT-001",
        "to_node": "RET-JT-012",
        "commodity": "beras_premium",
    }
