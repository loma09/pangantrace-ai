const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, error.detail ?? 'Request failed')
  }
  return res.json()
}

// ── Anomaly ──────────────────────────────────────────────────────────
export const anomalyApi = {
  getSummary: (params?: {
    province?: string
    commodity?: string
    days?: number
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    return apiFetch<import('@/types/anomaly').AnomalySummary>(
      `/api/v1/anomaly/summary${qs ? `?${qs}` : ''}`,
    )
  },
  detect: (body: {
    transactions: object[]
    commodity: string
    province: string
  }) =>
    apiFetch<import('@/types/anomaly').AnomalyResult>(
      '/api/v1/anomaly/detect',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),
}

// ── Prices ───────────────────────────────────────────────────────────
export const priceApi = {
  getCurrent: (commodities?: string[]) => {
    const qs = commodities ? `?commodities=${commodities.join(',')}` : ''
    return apiFetch<import('@/types/price').CurrentPrices>(
      `/api/v1/prices/current${qs}`,
    )
  },
  predict: (body: {
    commodity: string
    historical_prices: number[]
    historical_dates: string[]
    forecast_days?: number
  }) =>
    apiFetch<import('@/types/price').PricePrediction>(
      '/api/v1/prices/predict',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ),
}

// ── Insights ─────────────────────────────────────────────────────────
export const insightApi = {
  getAnomalyInsight: (body: {
    commodity: string
    province: string
    anomaly_data: object
    chain_data?: object
  }) =>
    apiFetch<{ insight: string; severity: number; generated_by: string }>(
      '/api/v1/insights/anomaly',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  getDailySummary: (stats: object) =>
    apiFetch<{ summary: string }>('/api/v1/insights/daily-summary', {
      method: 'POST',
      body: JSON.stringify(stats),
    }),
}
