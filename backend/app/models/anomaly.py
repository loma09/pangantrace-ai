from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class AnomalyRecord(Base):
    """Anomali yang terdeteksi oleh Azure Anomaly Detector."""

    __tablename__ = "anomaly_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False)
    province = Column(String(100), nullable=False)
    detection_type = Column(String(30), nullable=False)  # price_spike, volume_fraud, pattern
    fraud_score = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(20), nullable=False, default="low")  # low, medium, high, critical
    severity_score = Column(Float, nullable=True)

    # Anomaly details
    expected_value = Column(Float, nullable=True)
    actual_value = Column(Float, nullable=True)
    deviation_pct = Column(Float, nullable=True)

    # Chain discrepancy
    volume_in = Column(Float, nullable=True)
    volume_out = Column(Float, nullable=True)
    discrepancy_pct = Column(Float, nullable=True)

    # AI insight (from Azure OpenAI)
    ai_insight = Column(Text, nullable=True)
    ai_generated_by = Column(String(50), nullable=True)  # e.g. "Azure OpenAI GPT-4o"

    # Azure service metadata
    azure_service = Column(String(100), default="Azure Anomaly Detector")
    azure_request_id = Column(String(100), nullable=True)

    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    commodity = relationship("Commodity", back_populates="anomalies")

    __table_args__ = (
        Index("idx_anomaly_risk", "risk_level", "detected_at"),
        Index("idx_anomaly_province", "province", "detected_at"),
        Index("idx_anomaly_commodity", "commodity_id", "detected_at"),
    )

    def __repr__(self):
        return f"<AnomalyRecord(id={self.id}, type={self.detection_type}, score={self.fraud_score})>"
