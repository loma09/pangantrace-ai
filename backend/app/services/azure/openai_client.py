from openai import AsyncAzureOpenAI
from typing import List, Dict, Optional
from app.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """Kamu adalah sistem AI PanganTrace yang membantu petugas pemerintah Indonesia
memahami anomali distribusi pangan dan potensi fraud subsidi.

Tugasmu:
1. Jelaskan anomali yang terdeteksi dengan bahasa yang mudah dipahami petugas lapangan
2. Identifikasi pola fraud yang mungkin terjadi berdasarkan data
3. Berikan rekomendasi tindakan konkret yang bisa diambil
4. Selalu sertakan tingkat keyakinan (confidence level) dalam analisismu

Format respons: paragraf singkat (maks 3 paragraf), langsung ke poin, tanpa jargon teknis berlebihan.
Bahasa: Indonesia yang formal namun mudah dipahami."""


class AzureOpenAIService:
    def __init__(self):
        self.client = AsyncAzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
        self.deployment = settings.AZURE_OPENAI_DEPLOYMENT

    async def generate_anomaly_insight(
        self,
        commodity: str,
        province: str,
        anomaly_data: Dict,
        chain_data: Optional[Dict] = None,
    ) -> Dict:
        """
        Generate narasi penjelasan anomali untuk petugas lapangan.
        Ini yang membuat alert lebih actionable dibanding angka mentah.
        """
        anomaly_count = anomaly_data.get("anomaly_count", 0)
        severity_scores = anomaly_data.get("severity_scores", [])
        max_severity = max(severity_scores) if severity_scores else 0

        chain_context = ""
        if chain_data:
            chain_context = f"""
Data rantai pasok:
- Volume masuk distributor: {chain_data.get('volume_in', 'N/A')} ton
- Volume keluar distributor: {chain_data.get('volume_out', 'N/A')} ton  
- Selisih: {chain_data.get('discrepancy', 'N/A')} ton ({chain_data.get('discrepancy_pct', 'N/A')}%)
"""

        user_message = f"""Analisis anomali berikut dan berikan insight:

Komoditas: {commodity}
Provinsi: {province}
Jumlah anomali terdeteksi: {anomaly_count} titik data
Severity tertinggi: {round(max_severity, 1)}/100
{chain_context}

Berikan:
1. Penjelasan apa yang kemungkinan terjadi
2. Potensi risiko fraud atau penyimpangan subsidi
3. Rekomendasi tindakan untuk petugas lapangan"""

        try:
            response = await self.client.chat.completions.create(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=500,
                temperature=0.3,  # Low temperature = lebih konsisten & faktual
            )
            insight_text = response.choices[0].message.content
            return {
                "insight": insight_text,
                "commodity": commodity,
                "province": province,
                "severity": round(max_severity, 1),
                "generated_by": "Azure OpenAI GPT-4o",
                "tokens_used": response.usage.total_tokens,
            }
        except Exception as e:
            logger.error(f"Azure OpenAI error: {e}")
            return {
                "insight": f"Terdeteksi {anomaly_count} anomali pada distribusi {commodity} "
                f"di {province}. Harap periksa data distribusi secara manual.",
                "commodity": commodity,
                "province": province,
                "severity": round(max_severity, 1),
                "generated_by": "fallback",
            }

    async def generate_daily_summary(self, stats: Dict) -> str:
        """Generate ringkasan harian untuk dashboard eksekutif."""
        message = f"""Buat ringkasan eksekutif singkat (2 paragraf) untuk laporan harian sistem PanganTrace AI.

Data hari ini:
- Total transaksi: {stats.get('total_transactions', 0):,}
- Anomali terdeteksi: {stats.get('anomaly_count', 0)}
- Komoditas paling berisiko: {stats.get('highest_risk_commodity', 'N/A')}
- Provinsi dengan anomali terbanyak: {stats.get('highest_risk_province', 'N/A')}
- Estimasi potensi kerugian: Rp {stats.get('estimated_loss', 0):,.0f}"""

        response = await self.client.chat.completions.create(
            model=self.deployment,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            max_tokens=300,
            temperature=0.2,
        )
        return response.choices[0].message.content


_openai_service = None


def get_openai_service() -> AzureOpenAIService:
    global _openai_service
    if _openai_service is None:
        _openai_service = AzureOpenAIService()
    return _openai_service
