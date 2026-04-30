'use client'

import { useState, useEffect } from 'react'
import MetricCard from '@/components/dashboard/MetricCard'
import AlertList from '@/components/dashboard/AlertList'
import ProvinceBarChart from '@/components/dashboard/BarChart'
import AnomalyMap from '@/components/dashboard/AnomalyMap'

export default function DashboardPage() {
  const [prices, setPrices] = useState<Record<string, any>>({})
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!apiUrl) { setLoading(false); return }

    Promise.all([
      fetch(`${apiUrl}/api/v1/prices/current`).then(r => r.json()).catch(() => ({})),
      fetch(`${apiUrl}/api/v1/anomaly/summary`).then(r => r.json()).catch(() => null),
    ]).then(([priceData, summaryData]) => {
      setPrices(priceData || {})
      setSummary(summaryData)
    }).finally(() => setLoading(false))
  }, [])

  const LABEL_MAP: Record<string, { label: string; unit: string }> = {
    beras_premium:  { label: 'Beras Premium', unit: '/kg' },
    beras_medium:   { label: 'Beras Medium',  unit: '/kg' },
    jagung:         { label: 'Jagung',        unit: '/kg' },
    kedelai:        { label: 'Kedelai',       unit: '/kg' },
    gula_pasir:     { label: 'Gula Pasir',    unit: '/kg' },
    minyak_goreng:  { label: 'Minyak Goreng', unit: '/L' },
  }

  return (
    <>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Monitoring rantai pasok pangan nasional &mdash; data real-time dari Azure AI Services</p>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────── */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Anomali"
          value={summary?.total_anomalies ?? '—'}
          change={summary ? `${summary.high_severity} high severity` : 'Loading...'}
          changeType="up"
          icon="warning"
          accentColor="#EF4444"
        />
        <MetricCard
          label="Komoditas Paling Berisiko"
          value={summary?.most_affected_commodity?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ?? '—'}
          change={summary?.most_affected_province ?? ''}
          icon="shield"
          accentColor="#F97316"
        />
        <MetricCard
          label="Provinsi Terdampak"
          value={summary?.most_affected_province ?? '—'}
          change={`${summary?.period_days ?? 14} hari terakhir`}
          changeType="up"
          icon="location_on"
          accentColor="#3B82F6"
        />
        <MetricCard
          label="Trend"
          value={summary?.trend?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ?? '—'}
          change="Berdasarkan analisis anomali"
          icon="trending_up"
          accentColor="#8B5CF6"
        />
      </div>

      {/* ── Main Grid ─────────────────────────────────────────── */}
      <div className="dashboard-grid">
        {/* Alert Feed */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">notifications_active</span>
              Alert Terbaru
            </span>
            <span className="azure-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>model_training</span>
              ML Engine
            </span>
          </div>
          <AlertList />
        </div>

        {/* Province Chart */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">bar_chart</span>
              Anomali per Provinsi
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>14 hari terakhir</span>
          </div>
          <ProvinceBarChart />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Map */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">map</span>
              Peta Anomali Indonesia
            </span>
            <span className="live-badge">● Live</span>
          </div>
          <AnomalyMap />
        </div>

        {/* Price Table - from API */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">attach_money</span>
              Harga Komoditas Hari Ini
            </span>
            <span className="azure-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>model_training</span>
              ML Engine
            </span>
          </div>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 20, marginBottom: 12, borderRadius: 4 }} />)}
            </div>
          ) : (
            <table className="data-table" id="price-table">
              <thead>
                <tr>
                  <th>Komoditas</th>
                  <th>Harga</th>
                  <th>Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(prices).map(([key, val]: [string, any]) => {
                  const info = LABEL_MAP[key] || { label: key, unit: '' }
                  return (
                    <tr key={key}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{info.label}</td>
                      <td>
                        Rp {val.price?.toLocaleString('id-ID')}
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{info.unit}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            color:
                              val.trend === 'up'
                                ? 'var(--accent-emerald)'
                                : val.trend === 'down'
                                  ? 'var(--accent-rose)'
                                  : 'var(--text-tertiary)',
                            fontWeight: 600,
                          }}
                        >
                          {val.change_pct > 0 ? '+' : ''}{val.change_pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── AI Insight ────────────────────────────────────────── */}
      <div className="ai-insight-card animate-in" id="ai-daily-summary">
        <div className="ai-insight-header">
          <span className="material-symbols-outlined">auto_awesome</span>
          <h4>AI Daily Summary — Azure OpenAI GPT-4o</h4>
        </div>
        <div className="ai-insight-body">
          <p style={{ marginBottom: 12 }}>
            Sistem PanganTrace AI mendeteksi <strong>{summary?.total_anomalies ?? '—'} anomali</strong> dalam {summary?.period_days ?? 14} hari terakhir.
            {summary?.most_affected_province && (
              <> {summary.most_affected_province} menjadi provinsi dengan risiko tertinggi, terutama
              pada komoditas {summary.most_affected_commodity?.replace(/_/g, ' ')} yang mengalami lonjakan harga tidak wajar.</>
            )}
          </p>
          <p>
            Rekomendasi: prioritaskan audit fisik pada distributor yang menunjukkan selisih volume di atas 10%
            dan verifikasi silang dengan data pengiriman dari Bulog regional.
          </p>
        </div>
      </div>
    </>
  )
}
