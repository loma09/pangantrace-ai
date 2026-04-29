'use client'

interface RiskScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

function getLevel(score: number) {
  if (score >= 80) return 'critical'
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
}

export default function RiskScoreBadge({ score, size = 'md' }: RiskScoreBadgeProps) {
  const level = getLevel(score)
  const color = COLORS[level]
  const dims = size === 'lg' ? 140 : size === 'md' ? 100 : 64
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4
  const radius = (dims - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="fraud-score-ring" style={{ width: dims, height: dims }}>
      <svg viewBox={`0 0 ${dims} ${dims}`}>
        <circle
          className="ring-bg"
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring-value"
          cx={dims / 2}
          cy={dims / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="fraud-score-label">
        <span className="fraud-score-number" style={{ color, fontSize: size === 'lg' ? '2rem' : size === 'md' ? '1.4rem' : '1rem' }}>
          {score}
        </span>
        <span className="fraud-score-text">{level}</span>
      </div>
    </div>
  )
}
