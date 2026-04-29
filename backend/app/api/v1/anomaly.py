from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.services.fraud_engine import get_fraud_engine, FraudEngine
from app.services.azure.anomaly_detector import get_anomaly_service

router = APIRouter()


class TransactionPoint(BaseModel):
    timestamp: str
    price: float
    volume: float
    volume_in: float = 0
    volume_out: float = 0
    location: Optional[str] = None


class AnomalyRequest(BaseModel):
    transactions: List[TransactionPoint]
    commodity: str
    province: str


class PriceSeriesRequest(BaseModel):
    timestamps: List[str]
    values: List[float]
    sensitivity: int = 85


@router.post("/detect")
async def detect_anomaly(
    request: AnomalyRequest,
    engine: FraudEngine = Depends(get_fraud_engine),
):
    """
    Endpoint utama: analisis batch transaksi, return fraud score + AI insight.
    Digunakan oleh dashboard untuk setiap refresh data.
    """
    if len(request.transactions) < 12:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum 12 data points required, got {len(request.transactions)}",
        )
    transactions_dict = [t.model_dump() for t in request.transactions]
    result = await engine.analyze_transaction_batch(
        transactions=transactions_dict,
        commodity=request.commodity,
        province=request.province,
    )
    return result


@router.post("/price-series")
async def detect_price_anomaly(
    request: PriceSeriesRequest,
    service=Depends(get_anomaly_service),
):
    """Quick check anomali harga untuk chart dashboard."""
    timestamps = [datetime.fromisoformat(ts) for ts in request.timestamps]
    return await service.detect_price_anomalies(
        timestamps=timestamps,
        values=request.values,
        sensitivity=request.sensitivity,
    )


@router.get("/summary")
async def get_anomaly_summary(
    province: Optional[str] = Query(None),
    commodity: Optional[str] = Query(None),
    days: int = Query(14, ge=1, le=90),
):
    """Ringkasan anomali untuk metrics di dashboard — data dari Azure SQL."""
    # TODO: Replace with actual Azure SQL query
    return {
        "total_anomalies": 47,
        "high_severity": 12,
        "medium_severity": 21,
        "low_severity": 14,
        "most_affected_province": "Jawa Timur",
        "most_affected_commodity": "beras",
        "trend": "increasing",
        "period_days": days,
    }
