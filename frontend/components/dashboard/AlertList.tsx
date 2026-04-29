'use client'

import type { Alert } from '@/types/anomaly'

const DEMO_ALERTS: Alert[] = [
  {
    id: 'ALR-2026-0429-001',
    title: 'Lonjakan harga beras premium 18.5% di Jawa Timur',
    province: 'Jawa Timur',
    commodity: 'beras_premium',
    severity: 'high',
    fraud_score: 78.5,
    detected_at: '2026-04-29T08:30:00',
    azure_service: 'Azure Anomaly Detector',
    status: 'open',
  },
  {
    id: 'ALR-2026-0429-002',
    title: 'Discrepancy volume jagung 12.3% di Jawa Barat',
    province: 'Jawa Barat',
    commodity: 'jagung',
    severity: 'critical',
    fraud_score: 89.2,
    detected_at: '2026-04-29T07:15:00',
    azure_service: 'Azure Anomaly Detector',
    status: 'investigating',
  },
  {
    id: 'ALR-2026-0428-005',
    title: 'Pola distribusi mencurigakan minyak goreng di Sumut',
    province: 'Sumatera Utara',
    commodity: 'minyak_goreng',
    severity: 'medium',
    fraud_score: 55.0,
    detected_at: '2026-04-28T14:22:00',
    azure_service: 'Azure OpenAI',
    status: 'open',
  },
  {
    id: 'ALR-2026-0428-003',
    title: 'Anomali volume kedelai di gudang distributor Semarang',
    province: 'Jawa Tengah',
    commodity: 'kedelai',
    severity: 'high',
    fraud_score: 72.1,
    detected_at: '2026-04-28T11:05:00',
    azure_service: 'Azure Anomaly Detector',
    status: 'open',
  },
  {
    id: 'ALR-2026-0427-009',
    title: 'Harga gula pasir naik abnormal 22% di NTT',
    province: 'NTT',
    commodity: 'gula_pasir',
    severity: 'critical',
    fraud_score: 91.4,
    detected_at: '2026-04-27T16:48:00',
    azure_service: 'Azure Anomaly Detector',
    status: 'investigating',
  },
]

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}h lalu`
  if (h >= 1) return `${h}j lalu`
  return `${m}m lalu`
}

export default function AlertList() {
  return (
    <div className="alert-list">
      {DEMO_ALERTS.map((alert) => (
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
