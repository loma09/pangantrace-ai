'use client'

const PROVINCE_MAP_DATA = [
  { id: 'jawa-timur',   name: 'Jawa Timur',      anomalies: 14, risk: 'critical', x: 62, y: 75 },
  { id: 'jawa-barat',   name: 'Jawa Barat',      anomalies: 11, risk: 'high',     x: 48, y: 72 },
  { id: 'jawa-tengah',  name: 'Jawa Tengah',      anomalies: 8,  risk: 'high',     x: 55, y: 73 },
  { id: 'sumatera-utara', name: 'Sumatera Utara', anomalies: 6,  risk: 'medium',   x: 28, y: 28 },
  { id: 'sulawesi-selatan', name: 'Sulawesi Selatan', anomalies: 4, risk: 'medium', x: 72, y: 60 },
  { id: 'ntt',          name: 'NTT',              anomalies: 3,  risk: 'medium',   x: 72, y: 82 },
  { id: 'bali',         name: 'Bali',             anomalies: 1,  risk: 'low',      x: 66, y: 79 },
]

function getRiskColor(risk: string) {
  switch (risk) {
    case 'critical': return '#EF4444'
    case 'high':     return '#F97316'
    case 'medium':   return '#F59E0B'
    default:         return '#10B981'
  }
}

export default function AnomalyMap() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Simplified Indonesia map outline */}
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        {/* Simplified archipelago outline */}
        <path d="M15,35 Q20,28 30,30 Q35,25 40,30 Q45,28 50,32 L52,35 Q48,40 45,38 Q40,42 35,38 Q28,40 22,37 Z" fill="white"/>
        <path d="M42,55 Q48,50 55,52 Q60,48 68,52 Q72,50 78,55 L80,60 Q75,65 70,62 Q65,68 58,64 Q52,68 45,62 Q40,65 38,58 Z" fill="white"/>
        <path d="M45,68 Q50,65 58,68 Q62,65 68,70 Q72,68 78,72 L80,78 Q75,82 70,78 Q65,82 58,78 Q52,82 48,76 Z" fill="white"/>
      </svg>

      {/* Anomaly hotspots */}
      {PROVINCE_MAP_DATA.map((prov) => {
        const color = getRiskColor(prov.risk)
        const size = Math.max(8, prov.anomalies * 1.5)
        return (
          <div
            key={prov.id}
            style={{
              position: 'absolute',
              left: `${prov.x}%`,
              top: `${prov.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
            }}
            title={`${prov.name}: ${prov.anomalies} anomali`}
          >
            {/* Pulse ring */}
            <div
              style={{
                position: 'absolute',
                inset: -size * 0.6,
                borderRadius: '50%',
                background: color,
                opacity: 0.12,
                animation: prov.risk === 'critical' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
              }}
            />
            {/* Dot */}
            <div
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 ${size}px ${color}`,
                position: 'relative',
                zIndex: 1,
              }}
            />
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                top: size + 4,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontSize: '0.6rem',
                color: 'var(--text-tertiary)',
                fontWeight: 500,
                zIndex: 1,
              }}
            >
              {prov.name}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', gap: 12, fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
        {['critical', 'high', 'medium', 'low'].map((r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: getRiskColor(r) }} />
            {r}
          </div>
        ))}
      </div>
    </div>
  )
}
