'use client'

export default function ConfidenceInterval() {
  const forecasts = [
    { date: '30 Apr', price: 16350, lower: 15800, upper: 16900, conf: 87.2 },
    { date: '1 Mei',  price: 16280, lower: 15700, upper: 16860, conf: 85.5 },
    { date: '2 Mei',  price: 16420, lower: 15800, upper: 17040, conf: 83.8 },
    { date: '3 Mei',  price: 16380, lower: 15750, upper: 17010, conf: 82.1 },
    { date: '4 Mei',  price: 16500, lower: 15900, upper: 17100, conf: 80.4 },
    { date: '5 Mei',  price: 16450, lower: 15850, upper: 17050, conf: 78.7 },
    { date: '6 Mei',  price: 16520, lower: 15800, upper: 17240, conf: 76.3 },
  ]

  return (
    <table className="data-table" id="confidence-table">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Prediksi (Rp)</th>
          <th>Batas Bawah</th>
          <th>Batas Atas</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        {forecasts.map((f) => (
          <tr key={f.date}>
            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.date}</td>
            <td>Rp {f.price.toLocaleString('id-ID')}</td>
            <td style={{ color: 'var(--accent-emerald)' }}>Rp {f.lower.toLocaleString('id-ID')}</td>
            <td style={{ color: 'var(--accent-rose)' }}>Rp {f.upper.toLocaleString('id-ID')}</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--border-subtle)', borderRadius: 2, maxWidth: 60 }}>
                  <div style={{ width: `${f.conf}%`, height: '100%', background: f.conf > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)', borderRadius: 2 }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{f.conf}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
