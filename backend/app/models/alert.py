from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Index
from datetime import datetime
from app.db.database import Base


class Alert(Base):
    """Alert fraud untuk dashboard dan notifikasi petugas lapangan."""

    __tablename__ = "alerts"

    id = Column(String(30), primary_key=True)  # e.g. "ALR-2026-0429-001"
    anomaly_id = Column(Integer, ForeignKey("anomaly_records.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    province = Column(String(100), nullable=False)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False)
    severity = Column(String(20), nullable=False, default="low")  # low, medium, high, critical
    fraud_score = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="open")  # open, investigating, resolved
    azure_service = Column(String(100), default="Azure Anomaly Detector")

    # Resolution tracking
    assigned_to = Column(String(100), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Recommended actions (JSON-serialized list)
    recommended_actions = Column(Text, nullable=True)

    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_alert_status_severity", "status", "severity"),
        Index("idx_alert_province", "province", "detected_at"),
    )

    def __repr__(self):
        return f"<Alert(id={self.id}, severity={self.severity}, status={self.status})>"
