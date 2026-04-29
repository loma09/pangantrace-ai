'use client'

import { useState } from 'react'
import PredictionCard from '@/components/price/PredictionCard'
import TimeSeriesChart from '@/components/price/TimeSeriesChart'

const COMMODITIES = [
  { id: 'beras_premium', label: 'Beras Premium', price: 16200 },
  { id: 'beras_medium', label: 'Beras Medium', price: 13100 },
  { id: 'jagung', label: 'Jagung', price: 5200 },
  { id: 'kedelai', label: 'Kedelai', price: 9800 },
  { id: 'gula_pasir', label: 'Gula Pasir', price: 17500 },
  { id: 'minyak_goreng', label: 'Minyak Goreng', price: 15000 },
]

function generateHistorical(basePrice: number): { prices: number[], dates: string[] } {
  const prices: number[] = []
  const dates: string[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
    const noise = (Math.random() - 0.5) * basePrice * 0.04
    const trend = (30 - i) * basePrice * 0.0005
    prices.push(Math.round(basePrice + noise + trend))
  }
  return { prices, dates }
}

export default function PricePredictionPage() {
  const [selected, setSelected] = useState(COMMODITIES[0])
  const [forecastDays, setForecastDays] = useState(7)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handlePredict = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const { prices, dates } = generateHistorical(selected.price)

    try {
      const res = await fetch(`${apiUrl}/api/v1/prices/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: selected.id,
          historical_prices: prices,
          historical_dates: dates,
          forecast_days: forecastDays,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setResult({ ...data, historicalPrices: prices, historicalDates: dates })
    } catch (e: any) {
      setError(e.message || 'Failed to connect to API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>📈 Prediksi Harga</h2>
        <p>Forecasting harga komoditas menggunakan model Machine Learning</p>
      </div>

      {/* Commodity Selector */}
      <div className="card animate-in" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">category</span>
            Pilih Komoditas
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          {COMMODITIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                padding: '14px 16px',
                background: selected.id === c.id
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15))'
                  : 'var(--bg-elevated)',
                border: `1px solid ${selected.id === c.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                color: selected.id === c.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Rp {c.price.toLocaleString()}/kg
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 500 }}>
              Horizon Prediksi
            </label>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              style={{
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
              <option value={3}>3 Hari</option>
              <option value={7}>7 Hari</option>
              <option value={14}>14 Hari</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={isLoading}
            style={{
              padding: '10px 28px',
              background: isLoading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #10B981, #06B6D4)',
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
              boxShadow: isLoading ? 'none' : '0 0 20px rgba(16, 185, 129, 0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {isLoading ? 'hourglass_top' : 'trending_up'}
            </span>
            {isLoading ? 'Memprediksi...' : 'Prediksi Harga'}
          </button>
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
          {/* Forecast Summary */}
          <div className="card animate-in" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">
                <span className="material-symbols-outlined">query_stats</span>
                Hasil Prediksi — {selected.label}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="live-badge">LIVE</span>
                <span className="azure-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>model_training</span>
                  ML Model v{result.model_version || '1'}
                </span>
              </div>
            </div>

            {/* Trend Summary */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 20, padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Trend</div>
                <div style={{
                  fontSize: '1rem', fontWeight: 700,
                  color: result.trend_pct > 0 ? 'var(--accent-rose)' : result.trend_pct < 0 ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                }}>
                  {result.trend_pct > 0 ? '📈' : result.trend_pct < 0 ? '📉' : '➡️'} {result.trend?.replace(/_/g, ' ')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Perubahan</div>
                <div style={{
                  fontSize: '1rem', fontWeight: 700,
                  color: result.trend_pct > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                }}>
                  {result.trend_pct > 0 ? '+' : ''}{result.trend_pct}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Forecast Days</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{forecastDays} hari</div>
              </div>
            </div>

            {/* Forecast Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Prediksi Harga</th>
                  <th>Batas Bawah</th>
                  <th>Batas Atas</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {result.forecast?.map((f: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {new Date(f.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      Rp {Number(f.predicted_price).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)' }}>
                      Rp {Number(f.lower_bound).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--accent-rose)' }}>
                      Rp {Number(f.upper_bound).toLocaleString()}
                    </td>
                    <td>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: f.confidence >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: f.confidence >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      }}>
                        {f.confidence}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Static Overview Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {COMMODITIES.map(c => (
          <PredictionCard
            key={c.id}
            commodity={c.label}
            currentPrice={c.price}
            predictedPrice={Math.round(c.price * (1 + (Math.random() * 0.03 - 0.01)))}
            trend={Math.random() > 0.4 ? 'up' : 'down'}
            trendPct={Number((Math.random() * 3 - 0.5).toFixed(1))}
            confidence={Number((78 + Math.random() * 12).toFixed(1))}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="card animate-in">
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">show_chart</span>
            {selected.label} — Trend Harga 30 Hari
          </span>
        </div>
        <TimeSeriesChart />
      </div>
    </>
  )
}
