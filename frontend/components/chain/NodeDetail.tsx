'use client'

import { useState, useEffect } from 'react'

export default function NodeDetail() {
  const [node, setNode] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!apiUrl) { setLoading(false); return }
    fetch(`${apiUrl}/api/v1/chain/nodes?node_type=distributor`)
      .then(res => res.json())
      .then(data => {
        const nodes = data.nodes || []
        // Pick the most suspicious distributor
        const suspicious = nodes.sort((a: any, b: any) => b.discrepancy_pct - a.discrepancy_pct)[0]
        if (suspicious) setNode(suspicious)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />
      </div>
    )
  }

  if (!node) return null

  const isSuspicious = node.discrepancy_pct > 5

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="material-symbols-outlined">info</span>
          Detail Node — {node.name}
        </span>
        <span className={`risk-badge ${isSuspicious ? 'critical' : 'low'}`}>
          {isSuspicious ? 'suspicious' : 'normal'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{node.id}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Tipe</div>
          <div>{node.type.charAt(0).toUpperCase() + node.type.slice(1)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Provinsi</div>
          <div>{node.province}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Masuk</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {node.volume_in.toLocaleString('id-ID')} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>ton</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Volume Keluar</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {node.volume_out.toLocaleString('id-ID')} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>ton</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Discrepancy</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isSuspicious ? 'var(--risk-critical)' : 'var(--risk-low)' }}>
            {node.discrepancy_pct}%
          </div>
        </div>
      </div>
    </div>
  )
}
