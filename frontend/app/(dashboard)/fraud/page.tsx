'use client'

import { useState } from 'react'
import RiskScoreBadge from '@/components/fraud/RiskScoreBadge'
import AIExplanation from '@/components/fraud/AIExplanation'
import AnomalyTable from '@/components/fraud/AnomalyTable'

const SAMPLE_DATA = [
  { timestamp: '2026-04-15T00:00:00', price: 16200, volume: 450, volume_in: 450, volume_out: 430 },
  { timestamp: '2026-04-16T00:00:00', price: 16250, volume: 420, volume_in: 420, volume_out: 405 },
  { timestamp: '2026-04-17T00:00:00', price: 16300, volume: 480, volume_in: 480, volume_out: 460 },
  { timestamp: '2026-04-18T00:00:00', price: 16100, volume: 510, volume_in: 510, volume_out: 490 },
  { timestamp: '2026-04-19T00:00:00', price: 16400, volume: 390, volume_in: 390, volume_out: 375 },
  { timestamp: '2026-04-20T00:00:00', price: 16350, volume: 460, volume_in: 460, volume_out: 440 },
  { timestamp: '2026-04-21T00:00:00', price: 19500, volume: 200, volume_in: 200, volume_out: 120 },
  { timestamp: '2026-04-22T00:00:00', price: 21000, volume: 180, volume_in: 180, volume_out: 95 },
  { timestamp: '2026-04-23T00:00:00', price: 20200, volume: 220, volume_in: 220, volume_out: 140 },
  { timestamp: '2026-04-24T00:00:00', price: 18900, volume: 350, volume_in: 350, volume_out: 280 },
  { timestamp: '2026-04-25T00:00:00', price: 17500, volume: 400, volume_in: 400, volume_out: 370 },
  { timestamp: '2026-04-26T00:00:00', price: 16800, volume: 440, volume_in: 440, volume_out: 415 },
]

const COMMODITIES = ['beras_premium', 'beras_medium', 'jagung', 'kedelai', 'gula_pasir', 'minyak_goreng']
const PROVINCES = ['Jawa Timur', 'Jawa Barat', 'Jawa Tengah', 'NTT', 'NTB', 'Sulawesi Selatan']

export default function FraudPage() {
  const [commodity, setCommodity] = useState('beras_premium')
  const [province, setProvince] = useState('Jawa Timur')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

    try {
      const res = await fetch(`${apiUrl}/api/v1/anomaly/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: SAMPLE_DATA,
          commodity,
          province,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Failed to connect to API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>🔍 Fraud Detection</h2>
        <p>Analisis anomali dan deteksi penyimpangan subsidi pangan secara real-time</p>
      </div>

      {/* Interactive Form */}
      <div className="card animate-in" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">tune</span>
            Konfigurasi Analisis
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500 }}>
              Komoditas
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {COMMODITIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500 }}>
              Provinsi
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{
              padding: '10px 28px',
              background: isLoading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: isLoading ? 'none' : 'var(--shadow-glow-blue)',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {isLoading ? 'hourglass_top' : 'search_insights'}
            </span>
            {isLoading ? 'Menganalisis...' : 'Analisis Fraud'}
          </button>
        </div>

        {/* Sample Data Preview */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            📊 Data Transaksi (12 data points)
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.6 }}>
            Harga: {SAMPLE_DATA.map(d => `Rp${d.price.toLocaleString()}`).join(' → ')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginTop: 4 }}>
            ⚠ Data mengandung lonjakan harga pada 21-23 Apr (spike +29%)
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card animate-in" style={{ marginBottom: 20, borderColor: 'var(--risk-critical)', background: 'var(--risk-critical-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--risk-critical)' }}>
            <span className="material-symbols-outlined">error</span>
            <span style={{ fontWeight: 600 }}>Error: {error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="dashboard-grid animate-in" style={{ gridTemplateColumns: '300px 1fr' }}>
            {/* Fraud Score */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="card-header" style={{ justifyContent: 'center' }}>
                <span className="card-title">
                  <span className="material-symbols-outlined">shield</span>
                  Fraud Score
                </span>
              </div>
              <RiskScoreBadge score={result.fraud_score} size="lg" />
              <div style={{ marginTop: 16 }}>
                <div className={`risk-badge ${result.risk_level}`}>{result.risk_level.toUpperCase()}</div>
                <div style={{ marginTop: 8 }}>
                  <div className="commodity-tag">{commodity.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                  {province} — {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>
            </div>

            {/* Detection Results */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  <span className="material-symbols-outlined">analytics</span>
                  Hasil Deteksi
                </span>
                <span className="live-badge">LIVE</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                    Anomali Harga
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.price_anomalies.count > 0 ? 'var(--risk-critical)' : 'var(--accent-emerald)' }}>
                    {result.price_anomalies.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>terdeteksi</div>
                </div>

                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                    Anomali Volume
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.volume_anomalies.count > 0 ? 'var(--risk-high)' : 'var(--accent-emerald)' }}>
                    {result.volume_anomalies.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>terdeteksi</div>
                </div>

                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                    Discrepancy Volume
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.chain_discrepancy.is_suspicious ? 'var(--risk-high)' : 'var(--accent-emerald)' }}>
                    {result.chain_discrepancy.discrepancy_pct}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {result.chain_discrepancy.is_suspicious ? '⚠ Suspicious' : '✅ Normal'}
                  </div>
                </div>

                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                    Transaksi Dianalisis
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {result.transaction_count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>data points</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          {result.ai_insight && (
            <div style={{ marginBottom: 20 }} className="animate-in">
              <AIExplanation
                insight={result.ai_insight}
                generatedBy="Azure OpenAI GPT-4o"
                severity={result.fraud_score}
              />
            </div>
          )}
        </>
      )}

      {/* Static Table */}
      <div className="card animate-in">
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">table_chart</span>
            Riwayat Anomali Terdeteksi
          </span>
          <span className="azure-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>model_training</span>
            Custom ML Model
          </span>
        </div>
        <AnomalyTable />
      </div>
    </>
  )
}
