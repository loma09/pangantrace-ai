from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class PriceService:
    """Service untuk mengambil dan mengolah data harga komoditas."""

    async def get_historical_prices(
        self,
        commodity: str,
        days: int = 30,
        province: Optional[str] = None,
    ) -> Dict:
        """Ambil data harga historis dari Azure SQL."""
        # TODO: Replace with actual Azure SQL query via price_repo
        base_prices = {
            "beras_premium": 16200,
            "beras_medium": 13100,
            "jagung": 5200,
            "kedelai": 9800,
            "gula_pasir": 17500,
            "minyak_goreng": 15000,
        }
        base = base_prices.get(commodity, 10000)

        import random
        random.seed(hash(commodity))
        prices = []
        dates = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=days - i)).strftime("%Y-%m-%d")
            variation = random.uniform(-0.03, 0.03)
            price = round(base * (1 + variation))
            prices.append(price)
            dates.append(date)

        return {
            "commodity": commodity,
            "province": province or "Nasional",
            "prices": prices,
            "dates": dates,
            "period_days": days,
        }

    async def get_current_prices(self, commodities: Optional[List[str]] = None) -> Dict:
        """Harga terkini semua komoditas."""
        all_prices = {
            "beras_premium": {"price": 16200, "unit": "kg", "change_pct": 1.2, "trend": "up"},
            "beras_medium": {"price": 13100, "unit": "kg", "change_pct": 0.8, "trend": "up"},
            "jagung": {"price": 5200, "unit": "kg", "change_pct": -0.5, "trend": "down"},
            "kedelai": {"price": 9800, "unit": "kg", "change_pct": 2.1, "trend": "up"},
            "gula_pasir": {"price": 17500, "unit": "kg", "change_pct": -0.1, "trend": "stable"},
            "minyak_goreng": {"price": 15000, "unit": "liter", "change_pct": 0.3, "trend": "up"},
        }
        if commodities:
            return {k: v for k, v in all_prices.items() if k in commodities}
        return all_prices


_price_service = None


def get_price_service() -> PriceService:
    global _price_service
    if _price_service is None:
        _price_service = PriceService()
    return _price_service
