from sqlalchemy import Column, String, Float, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Commodity(Base):
    """Komoditas pangan yang dipantau oleh PanganTrace AI."""

    __tablename__ = "commodities"

    id = Column(String(50), primary_key=True)  # e.g. "beras_premium"
    name = Column(String(100), nullable=False)  # e.g. "Beras Premium"
    unit = Column(String(20), nullable=False, default="kg")
    category = Column(String(50), nullable=False, default="pangan_pokok")
    is_subsidized = Column(Integer, default=0)  # 1 = komoditas bersubsidi
    base_price = Column(Float, nullable=True)  # HET (Harga Eceran Tertinggi) jika ada
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prices = relationship("PriceRecord", back_populates="commodity")
    anomalies = relationship("AnomalyRecord", back_populates="commodity")

    def __repr__(self):
        return f"<Commodity(id={self.id}, name={self.name})>"
