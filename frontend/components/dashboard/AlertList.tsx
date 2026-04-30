'use client'

import { useState, useEffect } from 'react'
import type { Alert } from '@/types/anomaly'

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}h lalu`
  if (h >= 1) return `${h}j lalu`
  return `${m}m lalu`
}

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!apiUrl) {
      setLoading(false)
      return
    }
    fetch(`${apiUrl}/api/v1/alerts/`)
      .then(res => res.json())
      .then(data => setAlerts(data.alerts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="alert-list">
        {[1,2,3].map(i => (
          <div key={i} className="alert-item" style={{ opacity: 0.4 }}>
            <div className="skeleton" style={{ width: 4, height: 40 }} />
            <div className="alert-content">
              <div className="skeleton" style={{ width: '80%', height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '50%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return <div style={{ color: 'var(--text-tertiary)', fontSize: '0.84rem', padding: 16 }}>Tidak ada alert</div>
  }

  return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <div className="alert-item" key={alert.id} id={`alert-${alert.id}`}>
          <div className={`alert-severity-indicator ${alert.severity}`} />
          <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-meta">
              <span className="azure-badge" style={{ fontSize: '0.65rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>cloud</span>
                {alert.azure_service}
              </span>
              <span>{formatRelative(alert.detected_at)}</span>
              <span className={`risk-badge ${alert.severity}`}>{alert.severity}</span>
            </div>
          </div>
          <div className={`alert-score ${alert.severity}`}>{alert.fraud_score}</div>
        </div>
      ))}
    </div>
  )
}
