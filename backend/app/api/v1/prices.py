from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.azure.ml_client import get_ml_service, AzureMLService

router = APIRouter()

COMMODITIES = [
    "beras_premium",
    "beras_medium",
    "jagung",
    "kedelai",
    "gula_pasir",
    "minyak_goreng",
]


class PricePredictionRequest(BaseModel):
    commodity: str
    historical_prices: List[float]
    historical_dates: List[str]
    forecast_days: int = 7


@router.post("/predict")
async def predict_prices(
    request: PricePredictionRequest,
    ml_service: AzureMLService = Depends(get_ml_service),
):
    """Prediksi harga 7 hari ke depan menggunakan Azure ML."""
    if request.commodity not in COMMODITIES:
        raise HTTPException(
            status_code=400, detail=f"Commodity must be one of {COMMODITIES}"
        )

    return await ml_service.predict_prices(
        commodity=request.commodity,
        historical_prices=request.historical_prices,
        historical_dates=request.historical_dates,
        forecast_days=request.forecast_days,
    )


@router.get("/current")
async def get_current_prices(
    commodities: Optional[str] = Query(None, description="Comma-separated list"),
):
    """Harga terkini semua komoditas dari Azure SQL + BPS feed."""
    selected = commodities.split(",") if commodities else COMMODITIES
    # TODO: Replace with actual Azure SQL query + BPS API
    prices = {
        "beras_premium": {
            "price": 16200,
            "unit": "kg",
            "change_pct": 1.2,
            "trend": "up",
        },
        "beras_medium": {
            "price": 13100,
            "unit": "kg",
            "change_pct": 0.8,
            "trend": "up",
        },
        "jagung": {
            "price": 5200,
            "unit": "kg",
            "change_pct": -0.5,
            "trend": "down",
        },
        "kedelai": {
            "price": 9800,
            "unit": "kg",
            "change_pct": 2.1,
            "trend": "up",
        },
        "gula_pasir": {
            "price": 17500,
            "unit": "kg",
            "change_pct": -0.1,
            "trend": "stable",
        },
        "minyak_goreng": {
            "price": 15000,
            "unit": "liter",
            "change_pct": 0.3,
            "trend": "up",
        },
    }
    return {k: v for k, v in prices.items() if k in selected}
