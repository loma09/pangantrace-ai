'use client'

import { useParams } from 'next/navigation'
import RiskScoreBadge from '@/components/fraud/RiskScoreBadge'
import AIExplanation from '@/components/fraud/AIExplanation'
import AnomalyDetail from '@/components/fraud/AnomalyDetail'

export default function FraudDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h2>Detail Anomali</h2>
          <span className="risk-badge critical">critical</span>
        </div>
        <p>ID: {id} — Analisis mendalam anomali terdeteksi</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '240px 1fr' }}>
        <div className="card animate-in" style={{ textAlign: 'center' }}>
          <RiskScoreBadge score={89.2} size="lg" />
          <div style={{ marginTop: 14 }}>
            <div className="commodity-tag">Jagung</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 6 }}>Jawa Barat</div>
          </div>
        </div>
        <div className="animate-in">
          <AnomalyDetail
            commodity="Jagung"
            province="Jawa Barat"
            fraudScore={89.2}
            riskLevel="critical"
            priceAnomalies={4}
            volumeAnomalies={3}
            volumeIn={980.0}
            volumeOut={858.6}
            discrepancyPct={12.3}
          />
        </div>
      </div>

      <div className="animate-in" style={{ marginTop: 20 }}>
        <AIExplanation
          insight="Volume jagung yang masuk ke distributor di Jawa Barat tercatat 980 ton, namun hanya 858.6 ton yang terdistribusi ke retail — selisih 12.3% yang jauh melebihi batas wajar. Bersamaan dengan itu, harga jagung di wilayah ini menunjukkan 4 titik anomali dalam 2 minggu terakhir. Pola ini konsisten dengan skenario pengalihan komoditas bersubsidi ke pasar non-subsidi. Tindakan yang direkomendasikan: (1) audit stok gudang distributor, (2) verifikasi dokumen pengiriman, dan (3) koordinasi dengan Bulog untuk cross-check data."
          generatedBy="Azure OpenAI GPT-4o"
          severity={89.2}
        />
      </div>
    </>
  )
}
