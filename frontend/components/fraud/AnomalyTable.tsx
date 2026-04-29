'use client'

const ANOMALY_DATA = [
  { id: 'A-001', commodity: 'Beras Premium', province: 'Jawa Timur',  fraudScore: 78.5, severity: 'high',     date: '2026-04-29', status: 'open' },
  { id: 'A-002', commodity: 'Jagung',        province: 'Jawa Barat',  fraudScore: 89.2, severity: 'critical', date: '2026-04-29', status: 'investigating' },
  { id: 'A-003', commodity: 'Minyak Goreng', province: 'Sumut',       fraudScore: 55.0, severity: 'medium',   date: '2026-04-28', status: 'open' },
  { id: 'A-004', commodity: 'Kedelai',       province: 'Jawa Tengah', fraudScore: 72.1, severity: 'high',     date: '2026-04-28', status: 'open' },
  { id: 'A-005', commodity: 'Gula Pasir',    province: 'NTT',         fraudScore: 91.4, severity: 'critical', date: '2026-04-27', status: 'investigating' },
]

export default function AnomalyTable() {
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
        {ANOMALY_DATA.map((row) => (
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
