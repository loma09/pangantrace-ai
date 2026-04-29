from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class PriceRecord(Base):
    """Catatan harga komoditas harian per provinsi."""

    __tablename__ = "price_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False)
    province = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    volume = Column(Float, nullable=True)  # ton
    source = Column(String(50), default="bps")  # bps, bulog, manual
    recorded_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    commodity = relationship("Commodity", back_populates="prices")

    # Indexes for fast time-series queries
    __table_args__ = (
        Index("idx_price_commodity_date", "commodity_id", "recorded_at"),
        Index("idx_price_province_date", "province", "recorded_at"),
    )

    def __repr__(self):
        return f"<PriceRecord(commodity={self.commodity_id}, province={self.province}, price={self.price})>"
