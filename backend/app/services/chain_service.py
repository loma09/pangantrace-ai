from typing import List, Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ChainService:
    """Service untuk tracking rantai pasok dan mendeteksi discrepancy."""

    async def get_chain_nodes(
        self, province: Optional[str] = None, node_type: Optional[str] = None
    ) -> List[Dict]:
        """Ambil daftar node rantai pasok dari database."""
        # TODO: Replace with actual Azure SQL query via chain_repo
        nodes = [
            {"id": "DIST-JT-001", "name": "PT Pangan Makmur", "type": "distributor", "province": "Jawa Timur", "volume_in": 1250.5, "volume_out": 1180.2, "discrepancy_pct": 5.6},
            {"id": "PROD-JT-003", "name": "KUD Tani Sejahtera", "type": "producer", "province": "Jawa Timur", "volume_in": 0, "volume_out": 850.0, "discrepancy_pct": 0},
            {"id": "RET-JT-012", "name": "Pasar Induk Surabaya", "type": "retailer", "province": "Jawa Timur", "volume_in": 620.3, "volume_out": 615.8, "discrepancy_pct": 0.7},
        ]
        if province:
            nodes = [n for n in nodes if n["province"] == province]
        if node_type:
            nodes = [n for n in nodes if n["type"] == node_type]
        return nodes

    async def calculate_chain_loss(
        self, commodity: str, province: Optional[str] = None
    ) -> Dict:
        """Hitung total loss/discrepancy di rantai pasok untuk satu komoditas."""
        nodes = await self.get_chain_nodes(province=province, node_type="distributor")
        total_in = sum(n.get("volume_in", 0) for n in nodes)
        total_out = sum(n.get("volume_out", 0) for n in nodes)
        loss = total_in - total_out
        loss_pct = (loss / total_in * 100) if total_in > 0 else 0

        return {
            "commodity": commodity,
            "total_volume_in": round(total_in, 2),
            "total_volume_out": round(total_out, 2),
            "total_loss": round(loss, 2),
            "loss_pct": round(loss_pct, 2),
            "suspicious_nodes": [n["id"] for n in nodes if n.get("discrepancy_pct", 0) > 5],
            "analyzed_at": datetime.now().isoformat(),
        }


_chain_service = None


def get_chain_service() -> ChainService:
    global _chain_service
    if _chain_service is None:
        _chain_service = ChainService()
    return _chain_service
