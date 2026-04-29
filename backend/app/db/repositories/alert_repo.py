from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.alert import Alert


class AlertRepository:
    """Repository untuk operasi CRUD alert di Azure SQL."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, alert: Alert) -> Alert:
        self.session.add(alert)
        await self.session.flush()
        return alert

    async def get_by_id(self, alert_id: str) -> Optional[Alert]:
        result = await self.session.execute(
            select(Alert).where(Alert.id == alert_id)
        )
        return result.scalar_one_or_none()

    async def list_alerts(
        self,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        province: Optional[str] = None,
        limit: int = 20,
    ) -> List[Alert]:
        query = select(Alert).order_by(desc(Alert.detected_at)).limit(limit)
        if severity:
            query = query.where(Alert.severity == severity)
        if status:
            query = query.where(Alert.status == status)
        if province:
            query = query.where(Alert.province == province)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def update_status(
        self, alert_id: str, status: str, notes: Optional[str] = None
    ) -> Optional[Alert]:
        alert = await self.get_by_id(alert_id)
        if alert:
            alert.status = status
            if notes:
                alert.resolution_notes = notes
            await self.session.flush()
        return alert

    async def count_by_severity(self) -> dict:
        """Count alerts grouped by severity for dashboard metrics."""
        result = {}
        for sev in ["critical", "high", "medium", "low"]:
            query = select(Alert).where(Alert.severity == sev, Alert.status != "resolved")
            res = await self.session.execute(query)
            result[sev] = len(list(res.scalars().all()))
        return result
