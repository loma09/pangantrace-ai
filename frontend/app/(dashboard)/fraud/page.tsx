'use client'

import { useState } from 'react'
import RiskScoreBadge from '@/components/fraud/RiskScoreBadge'
import AIExplanation from '@/components/fraud/AIExplanation'
import AnomalyTable from '@/components/fraud/AnomalyTable'

// Realistic base prices per commodity (Rp/kg)
const COMMODITY_PROFILES: Record<string, { basePrice: number; baseVolume: number; spikeType: string; spikeFactor: number; leakPct: number }> = {
  beras_premium:  { basePrice: 16200, baseVolume: 450, spikeType: 'price_spike',      spikeFactor: 1.29, leakPct: 0.40 },
  beras_medium:   { basePrice: 13100, baseVolume: 520, spikeType: 'gradual_increase',  spikeFactor: 1.15, leakPct: 0.25 },
  jagung:         { basePrice: 5200,  baseVolume: 380, spikeType: 'volume_drop',       spikeFactor: 1.08, leakPct: 0.55 },
  kedelai:        { basePrice: 9800,  baseVolume: 290, spikeType: 'price_spike',       spikeFactor: 1.35, leakPct: 0.30 },
  gula_pasir:     { basePrice: 17500, baseVolume: 410, spikeType: 'sustained_high',    spikeFactor: 1.22, leakPct: 0.45 },
  minyak_goreng:  { basePrice: 15000, baseVolume: 470, spikeType: 'normal',            spikeFactor: 1.03, leakPct: 0.05 },
}

function generateSampleData(commodityId: string) {
  const profile = COMMODITY_PROFILES[commodityId] || COMMODITY_PROFILES.beras_premium
  const data = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ts = d.toISOString().split('.')[0]

    let price = profile.basePrice
    let volume = profile.baseVolume
    let volOut = volume * 0.96 // normal 4% loss

    // Different fraud patterns per commodity
    if (profile.spikeType === 'price_spike' && i >= 3 && i <= 5) {
      // Sudden price spike + volume crash on days 7-9
      price = Math.round(price * profile.spikeFactor)
      volume = Math.round(volume * 0.45)
      volOut = Math.round(volume * (1 - profile.leakPct))
    } else if (profile.spikeType === 'gradual_increase') {
      // Price slowly climbs
      price = Math.round(price * (1 + (11 - i) * 0.012))
      volOut = Math.round(volume * (1 - profile.leakPct * (i < 4 ? 1 : 0.1)))
    } else if (profile.spikeType === 'volume_drop' && i >= 2 && i <= 6) {
      // Volume drops dramatically, price barely moves
      volume = Math.round(volume * 0.3)
      volOut = Math.round(volume * (1 - profile.leakPct))
      price = Math.round(price * (1 + 0.02))
    } else if (profile.spikeType === 'sustained_high' && i >= 1 && i <= 7) {
      // High prices for extended period
      price = Math.round(price * profile.spikeFactor)
      volOut = Math.round(volume * (1 - profile.leakPct))
    } else {
      // Normal fluctuation
      price = Math.round(price + (Math.random() - 0.5) * price * 0.02)
      volume = Math.round(volume + (Math.random() - 0.5) * 40)
      volOut = Math.round(volume * (1 - profile.leakPct * 0.05))
    }

    data.push({
      timestamp: ts,
      price,
      volume,
      volume_in: volume,
      volume_out: volOut,
    })
  }
  return data
}

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

    const sampleData = generateSampleData(commodity)

    try {
      const res = await fetch(`${apiUrl}/api/v1/anomaly/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: sampleData,
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
        {(() => {
          const preview = generateSampleData(commodity)
          const profile = COMMODITY_PROFILES[commodity] || COMMODITY_PROFILES.beras_premium
          const patternLabels: Record<string, string> = {
            price_spike: `⚠ Lonjakan harga mendadak (+${Math.round((profile.spikeFactor - 1) * 100)}%) + volume crash`,
            gradual_increase: '⚠ Kenaikan harga bertahap + kebocoran volume di distributor',
            volume_drop: '⚠ Volume distribusi anjlok drastis (-70%) tanpa perubahan harga signifikan',
            sustained_high: `⚠ Harga tinggi berkelanjutan (+${Math.round((profile.spikeFactor - 1) * 100)}%) selama 7 hari`,
            normal: '✅ Pola distribusi normal — tidak ada anomali signifikan',
          }
          return (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📊 Data Transaksi — {commodity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (12 data points)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.6 }}>
                Harga: {preview.map(d => `Rp${d.price.toLocaleString()}`).join(' → ')}
              </div>
              <div style={{ fontSize: '0.72rem', color: profile.spikeType === 'normal' ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: 4 }}>
                {patternLabels[profile.spikeType] || '📊 Data simulasi'}
              </div>
            </div>
          )
        })()}
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
