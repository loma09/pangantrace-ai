from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.azure.openai_client import get_openai_service, AzureOpenAIService

router = APIRouter()


class InsightRequest(BaseModel):
    commodity: str
    province: str
    anomaly_data: Dict
    chain_data: Optional[Dict] = None


class SummaryRequest(BaseModel):
    total_transactions: int
    anomaly_count: int
    highest_risk_commodity: str
    highest_risk_province: str
    estimated_loss: float


@router.post("/anomaly")
async def get_anomaly_insight(
    request: InsightRequest,
    openai_service: AzureOpenAIService = Depends(get_openai_service),
):
    """
    Generate AI explanation dari anomali yang terdeteksi.
    Output: narasi bahasa Indonesia yang bisa dibaca petugas lapangan.
    """
    return await openai_service.generate_anomaly_insight(
        commodity=request.commodity,
        province=request.province,
        anomaly_data=request.anomaly_data,
        chain_data=request.chain_data,
    )


@router.post("/daily-summary")
async def get_daily_summary(
    request: SummaryRequest,
    openai_service: AzureOpenAIService = Depends(get_openai_service),
):
    return {
        "summary": await openai_service.generate_daily_summary(request.model_dump())
    }
