'use client'

interface ChainFlowProps {
  commodity?: string
}

const NODES = [
  { id: 'PROD-JT-003', name: 'KUD Tani Sejahtera',    type: 'producer',    volume: 850, status: 'normal' },
  { id: 'DIST-JT-001', name: 'PT Pangan Makmur',      type: 'distributor', volume: 1250, status: 'suspicious' },
  { id: 'DIST-JT-002', name: 'CV Distribusi Nusantara', type: 'distributor', volume: 400, status: 'normal' },
  { id: 'RET-JT-012',  name: 'Pasar Induk Surabaya',   type: 'retailer',    volume: 620, status: 'normal' },
  { id: 'RET-JT-015',  name: 'Pasar Wonokromo',        type: 'retailer',    volume: 380, status: 'warning' },
]

const TYPE_ICONS: Record<string, string> = {
  producer: 'agriculture',
  distributor: 'local_shipping',
  retailer: 'storefront',
}

const TYPE_COLORS: Record<string, string> = {
  producer: '#10B981',
  distributor: '#3B82F6',
  retailer: '#8B5CF6',
}

export default function ChainFlow({ commodity }: ChainFlowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {NODES.map((node, i) => (
        <div key={node.id}>
          <div
            className="alert-item"
            style={{
              borderColor: node.status === 'suspicious' ? 'var(--risk-critical)' : 'var(--border-subtle)',
              boxShadow: node.status === 'suspicious' ? 'var(--shadow-glow-red)' : 'none',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: `${TYPE_COLORS[node.type]}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: TYPE_COLORS[node.type] }}>
                {TYPE_ICONS[node.type]}
              </span>
            </div>
            <div className="alert-content">
              <div className="alert-title">{node.name}</div>
              <div className="alert-meta">
                <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{node.id}</span>
                <span className="commodity-tag">{node.type}</span>
                {node.status === 'suspicious' && (
                  <span className="risk-badge critical">suspicious</span>
                )}
                {node.status === 'warning' && (
                  <span className="risk-badge medium">warning</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {node.volume.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>ton</div>
            </div>
          </div>
          {i < NODES.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-tertiary)' }}>
                south
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
