'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import AlertList from '@/components/dashboard/AlertList'
import ProvinceBarChart from '@/components/dashboard/BarChart'
import AnomalyMap from '@/components/dashboard/AnomalyMap'

const PRICE_TABLE = [
  { commodity: 'Beras Premium', price: 'Rp 16.200', unit: '/kg', change: '+1.2%', trend: 'up' },
  { commodity: 'Beras Medium',  price: 'Rp 13.100', unit: '/kg', change: '+0.8%', trend: 'up' },
  { commodity: 'Jagung',        price: 'Rp 5.200',  unit: '/kg', change: '-0.5%', trend: 'down' },
  { commodity: 'Kedelai',       price: 'Rp 9.800',  unit: '/kg', change: '+2.1%', trend: 'up' },
  { commodity: 'Gula Pasir',    price: 'Rp 17.500', unit: '/kg', change: '-0.1%', trend: 'stable' },
  { commodity: 'Minyak Goreng', price: 'Rp 15.000', unit: '/L',  change: '+0.3%', trend: 'up' },
]

export default function DashboardPage() {
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
          value={47}
          change="+12 vs minggu lalu"
          changeType="up"
          icon="warning"
          accentColor="#EF4444"
        />
        <MetricCard
          label="Fraud Score Tertinggi"
          value="91.4"
          change="Gula pasir — NTT"
          icon="shield"
          accentColor="#F97316"
        />
        <MetricCard
          label="Transaksi Hari Ini"
          value="12,847"
          change="+8.3% vs kemarin"
          changeType="up"
          icon="receipt_long"
          accentColor="#3B82F6"
        />
        <MetricCard
          label="Potensi Kerugian"
          value="Rp 2.4M"
          change="Estimasi subsidi bocor"
          icon="money_off"
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
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
              Azure Anomaly Detector
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

        {/* Price Table */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">attach_money</span>
              Harga Komoditas Hari Ini
            </span>
            <span className="azure-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
              Azure ML
            </span>
          </div>
          <table className="data-table" id="price-table">
            <thead>
              <tr>
                <th>Komoditas</th>
                <th>Harga</th>
                <th>Perubahan</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_TABLE.map((row) => (
                <tr key={row.commodity}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.commodity}</td>
                  <td>
                    {row.price}
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{row.unit}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        color:
                          row.trend === 'up'
                            ? 'var(--accent-emerald)'
                            : row.trend === 'down'
                              ? 'var(--accent-rose)'
                              : 'var(--text-tertiary)',
                        fontWeight: 600,
                      }}
                    >
                      {row.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            Sistem PanganTrace AI mendeteksi <strong>47 anomali</strong> dalam 14 hari terakhir, dengan peningkatan
            signifikan 34% dibanding periode sebelumnya. Jawa Timur menjadi provinsi dengan risiko tertinggi, terutama
            pada komoditas beras premium yang mengalami lonjakan harga tidak wajar hingga 18.5% — jauh melebihi
            fluktuasi musiman normal.
          </p>
          <p>
            Potensi kebocoran subsidi diestimasi mencapai <strong>Rp 2.4 miliar</strong>, sebagian besar berasal dari
            discrepancy volume distribusi di layer distributor. Rekomendasi: prioritaskan audit fisik pada 3 distributor
            di Jawa Timur dan NTT yang menunjukkan selisih volume di atas 10%.
          </p>
        </div>
      </div>
    </>
  )
}
