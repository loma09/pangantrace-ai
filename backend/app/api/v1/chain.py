from fastapi import APIRouter, Query
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()


class ChainNode(BaseModel):
    id: str
    name: str
    type: str  # producer, distributor, retailer
    province: str
    volume_in: float
    volume_out: float
    discrepancy_pct: float


@router.get("/nodes")
async def get_chain_nodes(
    province: Optional[str] = Query(None),
    node_type: Optional[str] = Query(None),
):
    """Ambil semua node rantai pasok, bisa filter per provinsi/tipe."""
    # TODO: Replace with actual Azure SQL query
    nodes = [
        {
            "id": "DIST-JT-001",
            "name": "PT Pangan Makmur",
            "type": "distributor",
            "province": "Jawa Timur",
            "volume_in": 1250.5,
            "volume_out": 1180.2,
            "discrepancy_pct": 5.6,
        },
        {
            "id": "PROD-JT-003",
            "name": "KUD Tani Sejahtera",
            "type": "producer",
            "province": "Jawa Timur",
            "volume_in": 0,
            "volume_out": 850.0,
            "discrepancy_pct": 0,
        },
        {
            "id": "RET-JT-012",
            "name": "Pasar Induk Surabaya",
            "type": "retailer",
            "province": "Jawa Timur",
            "volume_in": 620.3,
            "volume_out": 615.8,
            "discrepancy_pct": 0.7,
        },
    ]

    if province:
        nodes = [n for n in nodes if n["province"] == province]
    if node_type:
        nodes = [n for n in nodes if n["type"] == node_type]

    return {"nodes": nodes, "total": len(nodes)}


@router.get("/flow")
async def get_supply_flow(
    commodity: str = Query("beras_premium"),
    province: Optional[str] = Query(None),
):
    """Alur distribusi komoditas — dari produsen ke konsumen."""
    return {
        "commodity": commodity,
        "flows": [
            {
                "from": "PROD-JT-003",
                "to": "DIST-JT-001",
                "volume": 850.0,
                "date": "2026-04-28",
            },
            {
                "from": "DIST-JT-001",
                "to": "RET-JT-012",
                "volume": 620.3,
                "date": "2026-04-28",
            },
        ],
        "total_volume": 850.0,
        "loss_pct": 5.6,
    }
