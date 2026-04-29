from fastapi import APIRouter, Query
from typing import Optional, List

router = APIRouter()


@router.get("/")
async def get_alerts(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="open, investigating, resolved"),
    limit: int = Query(20, ge=1, le=100),
):
    """Daftar alert fraud terbaru untuk dashboard dan notifikasi."""
    # TODO: Replace with actual Azure SQL query
    alerts = [
        {
            "id": "ALR-2026-0429-001",
            "title": "Lonjakan harga beras premium 18.5% di Jawa Timur",
            "province": "Jawa Timur",
            "commodity": "beras_premium",
            "severity": "high",
            "fraud_score": 78.5,
            "detected_at": "2026-04-29T08:30:00",
            "azure_service": "Azure Anomaly Detector",
            "status": "open",
        },
        {
            "id": "ALR-2026-0429-002",
            "title": "Discrepancy volume jagung 12.3% di Jawa Barat",
            "province": "Jawa Barat",
            "commodity": "jagung",
            "severity": "critical",
            "fraud_score": 89.2,
            "detected_at": "2026-04-29T07:15:00",
            "azure_service": "Azure Anomaly Detector",
            "status": "investigating",
        },
        {
            "id": "ALR-2026-0428-005",
            "title": "Pola distribusi mencurigakan minyak goreng di Sumatera Utara",
            "province": "Sumatera Utara",
            "commodity": "minyak_goreng",
            "severity": "medium",
            "fraud_score": 55.0,
            "detected_at": "2026-04-28T14:22:00",
            "azure_service": "Azure OpenAI",
            "status": "open",
        },
    ]

    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    if status:
        alerts = [a for a in alerts if a["status"] == status]

    return {"alerts": alerts[:limit], "total": len(alerts)}


@router.get("/{alert_id}")
async def get_alert_detail(alert_id: str):
    """Detail alert spesifik termasuk AI insight."""
    return {
        "id": alert_id,
        "title": "Lonjakan harga beras premium 18.5% di Jawa Timur",
        "province": "Jawa Timur",
        "commodity": "beras_premium",
        "severity": "high",
        "fraud_score": 78.5,
        "detected_at": "2026-04-29T08:30:00",
        "azure_service": "Azure Anomaly Detector",
        "status": "open",
        "ai_insight": "Terdeteksi lonjakan harga beras premium sebesar 18.5% di wilayah "
        "Jawa Timur dalam 24 jam terakhir. Pola ini tidak sesuai dengan "
        "musim panen dan patut dicurigai sebagai potensi penyimpangan subsidi.",
        "recommended_actions": [
            "Verifikasi data distribusi dari gudang Bulog regional",
            "Cross-check dengan data harga BPS terbaru",
            "Hubungi petugas lapangan di Jawa Timur untuk konfirmasi",
        ],
    }
