'use client'

import RiskScoreBadge from '@/components/fraud/RiskScoreBadge'
import AIExplanation from '@/components/fraud/AIExplanation'
import AnomalyTable from '@/components/fraud/AnomalyTable'
import AnomalyDetail from '@/components/fraud/AnomalyDetail'

export default function FraudPage() {
  return (
    <>
      <div className="page-header">
        <h2>Fraud Detection</h2>
        <p>Analisis anomali dan deteksi penyimpangan subsidi pangan — powered by Azure Anomaly Detector</p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
        {/* Fraud Score */}
        <div className="card animate-in" style={{ textAlign: 'center' }}>
          <div className="card-header" style={{ justifyContent: 'center' }}>
            <span className="card-title">
              <span className="material-symbols-outlined">shield</span>
              Fraud Score Tertinggi
            </span>
          </div>
          <RiskScoreBadge score={91.4} size="lg" />
          <div style={{ marginTop: 16 }}>
            <div className="commodity-tag">Gula Pasir</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
              NTT — 29 Apr 2026
            </div>
          </div>
        </div>

        {/* Anomaly Details */}
        <div className="animate-in">
          <AnomalyDetail
            commodity="Gula Pasir"
            province="NTT"
            fraudScore={91.4}
            riskLevel="critical"
            priceAnomalies={5}
            volumeAnomalies={3}
            volumeIn={1250.5}
            volumeOut={1080.2}
            discrepancyPct={13.6}
          />
        </div>
      </div>

      {/* AI Insight */}
      <div style={{ marginBottom: 20 }} className="animate-in">
        <AIExplanation
          insight="Terdeteksi lonjakan harga gula pasir sebesar 22% di NTT dalam 3 hari terakhir, disertai discrepancy volume distribusi sebesar 13.6% di layer distributor. Pola ini mengindikasikan potensi pengalihan subsidi — volume yang masuk ke distributor tidak sebanding dengan yang sampai ke pasar retail. Rekomendasi: lakukan audit fisik stok gudang distributor PT Manis Sejahtera (DIST-NTT-004) dan verifikasi silang dengan data pengiriman dari Bulog regional."
          generatedBy="Azure OpenAI GPT-4o"
          severity={91.4}
        />
      </div>

      {/* Anomaly Table */}
      <div className="card animate-in">
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">table_chart</span>
            Semua Anomali Terdeteksi
          </span>
          <span className="azure-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
            Azure Anomaly Detector
          </span>
        </div>
        <AnomalyTable />
      </div>
    </>
  )
}
