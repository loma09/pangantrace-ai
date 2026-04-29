'use client'

interface AnomalyDetailProps {
  commodity: string
  province: string
  fraudScore: number
  riskLevel: string
  priceAnomalies: number
  volumeAnomalies: number
  volumeIn: number
  volumeOut: number
  discrepancyPct: number
}

export default function AnomalyDetail({
  commodity,
  province,
  fraudScore,
  riskLevel,
  priceAnomalies,
  volumeAnomalies,
  volumeIn,
  volumeOut,
  discrepancyPct,
}: AnomalyDetailProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>
          <span className="material-symbols-outlined">analytics</span>
          Price Anomalies
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--risk-high)', marginBottom: 4 }}>
          {priceAnomalies}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>titik data anomali harga</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 14 }}>
          <span className="material-symbols-outlined">inventory_2</span>
          Volume Anomalies
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 4 }}>
          {volumeAnomalies}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>titik data anomali volume</div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-title" style={{ marginBottom: 14 }}>
          <span className="material-symbols-outlined">compare_arrows</span>
          Chain Discrepancy
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Masuk</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{volumeIn.toLocaleString('id-ID')} ton</div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--text-tertiary)' }}>arrow_forward</span>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Keluar</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{volumeOut.toLocaleString('id-ID')} ton</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Selisih</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: discrepancyPct > 5 ? 'var(--risk-critical)' : 'var(--risk-medium)' }}>
              {discrepancyPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
