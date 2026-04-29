'use client'

interface PredictionCardProps {
  commodity: string
  currentPrice: number
  predictedPrice: number
  trend: string
  trendPct: number
  confidence: number
}

export default function PredictionCard({
  commodity,
  currentPrice,
  predictedPrice,
  trend,
  trendPct,
  confidence,
}: PredictionCardProps) {
  const isUp = trendPct > 0

  return (
    <div className="card animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{commodity}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Rp {predictedPrice.toLocaleString('id-ID')}
          </div>
        </div>
        <span
          className={`metric-card-change ${isUp ? 'up' : 'down'}`}
          style={{ fontSize: '0.82rem', padding: '4px 10px' }}
        >
          {isUp ? '↑' : '↓'} {Math.abs(trendPct)}%
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
        <span>Saat ini: Rp {currentPrice.toLocaleString('id-ID')}</span>
        <span>Confidence: <strong style={{ color: confidence > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{confidence}%</strong></span>
      </div>
    </div>
  )
}
