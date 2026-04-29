'use client'

import TimeSeriesChart from '@/components/price/TimeSeriesChart'
import PredictionCard from '@/components/price/PredictionCard'
import ConfidenceInterval from '@/components/price/ConfidenceInterval'

export default function PricePredictionPage() {
  return (
    <>
      <div className="page-header">
        <h2>Prediksi Harga</h2>
        <p>Forecasting harga komoditas 7 hari ke depan menggunakan Azure Machine Learning</p>
      </div>

      {/* Prediction Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <PredictionCard commodity="Beras Premium" currentPrice={16200} predictedPrice={16450} trend="up" trendPct={1.5} confidence={87.2} />
        <PredictionCard commodity="Beras Medium" currentPrice={13100} predictedPrice={13250} trend="up" trendPct={1.1} confidence={85.8} />
        <PredictionCard commodity="Jagung" currentPrice={5200} predictedPrice={5150} trend="down" trendPct={-0.9} confidence={82.4} />
        <PredictionCard commodity="Kedelai" currentPrice={9800} predictedPrice={10050} trend="up" trendPct={2.6} confidence={79.3} />
        <PredictionCard commodity="Gula Pasir" currentPrice={17500} predictedPrice={17420} trend="down" trendPct={-0.5} confidence={84.1} />
        <PredictionCard commodity="Minyak Goreng" currentPrice={15000} predictedPrice={15080} trend="up" trendPct={0.5} confidence={86.7} />
      </div>

      {/* Time Series */}
      <div className="card animate-in" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">show_chart</span>
            Beras Premium — Aktual vs Prediksi
          </span>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 2.5, background: '#10B981', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-tertiary)' }}>Aktual</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 16, height: 2.5, background: '#3B82F6', borderRadius: 2, display: 'inline-block', borderTop: '2px dashed #3B82F6' }} />
              <span style={{ color: 'var(--text-tertiary)' }}>Prediksi</span>
            </span>
          </div>
        </div>
        <TimeSeriesChart />
      </div>

      {/* Confidence Table */}
      <div className="card animate-in">
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">query_stats</span>
            Detail Prediksi 7 Hari — Beras Premium
          </span>
          <span className="azure-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
            Azure ML (Prophet + LSTM)
          </span>
        </div>
        <ConfidenceInterval />
      </div>
    </>
  )
}
