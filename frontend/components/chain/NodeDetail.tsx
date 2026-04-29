'use client'

export default function NodeDetail() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="material-symbols-outlined">info</span>
          Detail Node — PT Pangan Makmur
        </span>
        <span className="risk-badge critical">suspicious</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>DIST-JT-001</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Tipe</div>
          <div>Distributor</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Provinsi</div>
          <div>Jawa Timur</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Masuk</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>1,250.5 <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>ton</span></div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Keluar</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>1,180.2 <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>ton</span></div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Discrepancy</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--risk-critical)' }}>5.6%</div>
        </div>
      </div>
    </div>
  )
}
