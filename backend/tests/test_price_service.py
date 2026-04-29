import pytest
from unittest.mock import AsyncMock, patch


class TestPriceService:
    """Tests for price data service."""

    @pytest.mark.asyncio
    async def test_get_current_prices(self):
        """Should return prices for all 6 commodities."""
        from app.services.price_service import PriceService

        service = PriceService()
        prices = await service.get_current_prices()

        assert len(prices) == 6
        assert "beras_premium" in prices
        assert "minyak_goreng" in prices
        assert prices["beras_premium"]["price"] > 0

    @pytest.mark.asyncio
    async def test_filter_commodities(self):
        """Should filter by specified commodity IDs."""
        from app.services.price_service import PriceService

        service = PriceService()
        prices = await service.get_current_prices(commodities=["beras_premium", "jagung"])

        assert len(prices) == 2
        assert "beras_premium" in prices
        assert "jagung" in prices
        assert "kedelai" not in prices

    @pytest.mark.asyncio
    async def test_historical_prices_structure(self):
        """Historical prices should have dates and prices arrays of equal length."""
        from app.services.price_service import PriceService

        service = PriceService()
        result = await service.get_historical_prices("beras_premium", days=30)

        assert len(result["prices"]) == 30
        assert len(result["dates"]) == 30
        assert result["commodity"] == "beras_premium"

    @pytest.mark.asyncio
    async def test_historical_prices_positive_values(self):
        """All prices should be positive numbers."""
        from app.services.price_service import PriceService

        service = PriceService()
        result = await service.get_historical_prices("jagung", days=14)

        for price in result["prices"]:
            assert price > 0
