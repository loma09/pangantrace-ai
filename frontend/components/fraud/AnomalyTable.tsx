'use client'

import { useState, useEffect } from 'react'

interface AnomalyRow {
  id: string
  commodity: string
  province: string
  fraudScore: number
  severity: string
  date: string
  status: string
}

function mapAlertToRow(alert: any, idx: number): AnomalyRow {
  return {
    id: `A-${String(idx + 1).padStart(3, '0')}`,
    commodity: (alert.commodity || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    province: alert.province || '',
    fraudScore: alert.fraud_score || 0,
    severity: alert.severity || 'low',
    date: alert.detected_at ? alert.detected_at.split('T')[0] : '',
    status: alert.status || 'open',
  }
}

export default function AnomalyTable() {
  const [rows, setRows] = useState<AnomalyRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!apiUrl) { setLoading(false); return }
    fetch(`${apiUrl}/api/v1/alerts/?limit=10`)
      .then(res => res.json())
      .then(data => setRows((data.alerts || []).map(mapAlertToRow)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 20, marginBottom: 12, borderRadius: 4 }} />)}
      </div>
    )
  }

  return (
    <table className="data-table" id="anomaly-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Komoditas</th>
          <th>Provinsi</th>
          <th>Fraud Score</th>
          <th>Severity</th>
          <th>Tanggal</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>{row.id}</td>
            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.commodity}</td>
            <td>{row.province}</td>
            <td>
              <span
                style={{
                  fontWeight: 700,
                  color:
                    row.fraudScore >= 80
                      ? 'var(--risk-critical)'
                      : row.fraudScore >= 70
                        ? 'var(--risk-high)'
                        : row.fraudScore >= 40
                          ? 'var(--risk-medium)'
                          : 'var(--risk-low)',
                }}
              >
                {row.fraudScore}
              </span>
            </td>
            <td>
              <span className={`risk-badge ${row.severity}`}>{row.severity}</span>
            </td>
            <td style={{ color: 'var(--text-tertiary)' }}>{row.date}</td>
            <td>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: row.status === 'investigating' ? 'var(--accent-amber)' : 'var(--accent-primary)',
                }}
              >
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
