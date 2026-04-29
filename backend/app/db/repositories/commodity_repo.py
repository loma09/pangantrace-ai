from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.commodity import Commodity


class CommodityRepository:
    """Repository untuk operasi CRUD komoditas."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, commodity_id: str) -> Optional[Commodity]:
        result = await self.session.execute(
            select(Commodity).where(Commodity.id == commodity_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> List[Commodity]:
        result = await self.session.execute(
            select(Commodity).order_by(Commodity.name)
        )
        return list(result.scalars().all())

    async def list_subsidized(self) -> List[Commodity]:
        """Ambil semua komoditas bersubsidi — fokus monitoring fraud."""
        result = await self.session.execute(
            select(Commodity).where(Commodity.is_subsidized == 1)
        )
        return list(result.scalars().all())

    async def upsert(self, commodity: Commodity) -> Commodity:
        existing = await self.get_by_id(commodity.id)
        if existing:
            existing.name = commodity.name
            existing.unit = commodity.unit
            existing.base_price = commodity.base_price
            existing.is_subsidized = commodity.is_subsidized
            return existing
        self.session.add(commodity)
        await self.session.flush()
        return commodity
