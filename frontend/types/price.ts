export interface PriceForecastPoint {
  date: string
  predicted_price: number
  lower_bound: number
  upper_bound: number
  confidence: number
}

export interface PricePrediction {
  commodity: string
  forecast: PriceForecastPoint[]
  trend:
    | 'increasing'
    | 'decreasing'
    | 'stable'
    | 'slight_increase'
    | 'slight_decrease'
  trend_pct: number
  model_version: string
}

export interface CurrentPrice {
  price: number
  unit: string
  change_pct: number
  trend: 'up' | 'down' | 'stable'
}

export type CurrentPrices = Record<string, CurrentPrice>

export const COMMODITY_LABELS: Record<string, string> = {
  beras_premium: 'Beras Premium',
  beras_medium: 'Beras Medium',
  jagung: 'Jagung',
  kedelai: 'Kedelai',
  gula_pasir: 'Gula Pasir',
  minyak_goreng: 'Minyak Goreng',
}
