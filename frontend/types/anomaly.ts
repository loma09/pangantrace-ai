export interface AnomalyResult {
  commodity: string
  province: string
  fraud_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  price_anomalies: {
    count: number
    indices: number[]
    severity_scores: number[]
  }
  volume_anomalies: {
    count: number
    indices: number[]
  }
  chain_discrepancy: {
    volume_in: number
    volume_out: number
    discrepancy: number
    discrepancy_pct: number
    is_suspicious: boolean
  }
  ai_insight?: {
    insight: string
    severity: number
    generated_by: string
  }
  analyzed_at: string
  transaction_count: number
}

export interface AnomalySummary {
  total_anomalies: number
  high_severity: number
  medium_severity: number
  low_severity: number
  most_affected_province: string
  most_affected_commodity: string
  trend: 'increasing' | 'decreasing' | 'stable'
  period_days: number
}

export interface Alert {
  id: string
  title: string
  province: string
  commodity: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  fraud_score: number
  detected_at: string
  azure_service: string
  status: 'open' | 'investigating' | 'resolved'
}
