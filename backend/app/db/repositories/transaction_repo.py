from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.models.chain import ChainTransaction


class TransactionRepository:
    """Repository untuk operasi transaksi rantai pasok."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, transaction: ChainTransaction) -> ChainTransaction:
        self.session.add(transaction)
        await self.session.flush()
        return transaction

    async def get_by_commodity(
        self,
        commodity_id: str,
        days: int = 14,
        limit: int = 500,
    ) -> List[ChainTransaction]:
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.session.execute(
            select(ChainTransaction)
            .where(
                ChainTransaction.commodity_id == commodity_id,
                ChainTransaction.transaction_date >= since,
            )
            .order_by(desc(ChainTransaction.transaction_date))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_volume_by_node(
        self, node_id: str, days: int = 14
    ) -> dict:
        """Calculate total volume in/out for a specific node."""
        since = datetime.utcnow() - timedelta(days=days)

        # Volume out (node is sender)
        out_result = await self.session.execute(
            select(func.sum(ChainTransaction.volume))
            .where(
                ChainTransaction.from_node_id == node_id,
                ChainTransaction.transaction_date >= since,
            )
        )
        volume_out = out_result.scalar() or 0

        # Volume in (node is receiver)
        in_result = await self.session.execute(
            select(func.sum(ChainTransaction.volume))
            .where(
                ChainTransaction.to_node_id == node_id,
                ChainTransaction.transaction_date >= since,
            )
        )
        volume_in = in_result.scalar() or 0

        return {
            "node_id": node_id,
            "volume_in": round(float(volume_in), 2),
            "volume_out": round(float(volume_out), 2),
            "discrepancy": round(float(volume_in - volume_out), 2),
            "period_days": days,
        }
