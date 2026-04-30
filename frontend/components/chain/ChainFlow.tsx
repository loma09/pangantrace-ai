'use client'

import { useState, useEffect } from 'react'

interface ChainFlowProps {
  commodity?: string
}

interface ChainNode {
  id: string
  name: string
  type: string
  volume_in: number
  volume_out: number
  discrepancy_pct: number
}

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
  const [nodes, setNodes] = useState<ChainNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!apiUrl) { setLoading(false); return }
    fetch(`${apiUrl}/api/v1/chain/nodes`)
      .then(res => res.json())
      .then(data => setNodes(data.nodes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [commodity])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
      </div>
    )
  }

  const getStatus = (node: ChainNode) => {
    if (node.discrepancy_pct > 5) return 'suspicious'
    if (node.discrepancy_pct > 2) return 'warning'
    return 'normal'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {nodes.map((node, i) => {
        const status = getStatus(node)
        const volume = node.type === 'producer' ? node.volume_out : node.volume_in
        return (
          <div key={node.id}>
            <div
              className="alert-item"
              style={{
                borderColor: status === 'suspicious' ? 'var(--risk-critical)' : 'var(--border-subtle)',
                boxShadow: status === 'suspicious' ? 'var(--shadow-glow-red)' : 'none',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: `${TYPE_COLORS[node.type] || '#666'}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: TYPE_COLORS[node.type] || '#666' }}>
                  {TYPE_ICONS[node.type] || 'hub'}
                </span>
              </div>
              <div className="alert-content">
                <div className="alert-title">{node.name}</div>
                <div className="alert-meta">
                  <span style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{node.id}</span>
                  <span className="commodity-tag">{node.type}</span>
                  {status === 'suspicious' && (
                    <span className="risk-badge critical">suspicious ({node.discrepancy_pct}%)</span>
                  )}
                  {status === 'warning' && (
                    <span className="risk-badge medium">warning ({node.discrepancy_pct}%)</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {volume.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>ton</div>
              </div>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-tertiary)' }}>
                  south
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
