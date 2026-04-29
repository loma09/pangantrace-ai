interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: string
  accentColor: string
}

export default function MetricCard({
  label,
  value,
  change,
  changeType,
  icon,
  accentColor,
}: MetricCardProps) {
  return (
    <div
      className="metric-card animate-in"
      style={{ '--metric-accent': accentColor } as React.CSSProperties}
    >
      <div className="metric-card-header">
        <span className="metric-card-label">{label}</span>
        <div
          className="metric-card-icon"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="metric-card-value" style={{ color: accentColor }}>
        {value}
      </div>
      {change && (
        <span className={`metric-card-change ${changeType ?? ''}`}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''}
          {change}
        </span>
      )}
    </div>
  )
}
