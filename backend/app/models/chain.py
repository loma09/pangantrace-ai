from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Index
from datetime import datetime
from app.db.database import Base


class ChainNode(Base):
    """Node dalam rantai pasok — produsen, distributor, atau retailer."""

    __tablename__ = "chain_nodes"

    id = Column(String(30), primary_key=True)  # e.g. "DIST-JT-001"
    name = Column(String(150), nullable=False)
    node_type = Column(String(20), nullable=False)  # producer, distributor, retailer
    province = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_node_type_province", "node_type", "province"),
    )

    def __repr__(self):
        return f"<ChainNode(id={self.id}, name={self.name}, type={self.node_type})>"


class ChainTransaction(Base):
    """Transaksi distribusi antar node rantai pasok."""

    __tablename__ = "chain_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    from_node_id = Column(String(30), ForeignKey("chain_nodes.id"), nullable=False)
    to_node_id = Column(String(30), ForeignKey("chain_nodes.id"), nullable=False)
    commodity_id = Column(String(50), ForeignKey("commodities.id"), nullable=False)
    volume = Column(Float, nullable=False)  # ton
    price_per_unit = Column(Float, nullable=True)
    total_value = Column(Float, nullable=True)
    document_number = Column(String(50), nullable=True)  # nomor surat jalan
    transaction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_chain_tx_date", "commodity_id", "transaction_date"),
        Index("idx_chain_tx_from", "from_node_id", "transaction_date"),
        Index("idx_chain_tx_to", "to_node_id", "transaction_date"),
    )

    def __repr__(self):
        return f"<ChainTransaction(from={self.from_node_id}, to={self.to_node_id}, volume={self.volume})>"
