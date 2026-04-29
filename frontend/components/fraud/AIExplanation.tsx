'use client'

interface AIExplanationProps {
  insight: string
  generatedBy: string
  severity: number
}

export default function AIExplanation({ insight, generatedBy, severity }: AIExplanationProps) {
  return (
    <div className="ai-insight-card">
      <div className="ai-insight-header">
        <span className="material-symbols-outlined">auto_awesome</span>
        <h4>AI Insight</h4>
        <span className="azure-badge" style={{ marginLeft: 'auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>cloud</span>
          {generatedBy}
        </span>
      </div>
      <div className="ai-insight-body">
        <p>{insight}</p>
      </div>
      <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
        Severity Score: <strong style={{ color: severity > 70 ? 'var(--risk-high)' : 'var(--risk-medium)' }}>{severity}/100</strong>
      </div>
    </div>
  )
}
