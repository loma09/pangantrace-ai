'use client'

import { useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'

const INDONESIA_TOPO = 'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia.geojson'

// Province anomaly data with real lat/lng
const PROVINCE_DATA: Record<string, { anomalies: number; risk: string; lat: number; lng: number }> = {
  'JAWA TIMUR':       { anomalies: 14, risk: 'critical', lat: -7.5361, lng: 112.2384 },
  'JAWA BARAT':       { anomalies: 11, risk: 'high',     lat: -6.9147, lng: 107.6098 },
  'JAWA TENGAH':      { anomalies: 8,  risk: 'high',     lat: -7.1510, lng: 110.1403 },
  'SUMATERA UTARA':   { anomalies: 6,  risk: 'medium',   lat: 2.1154,  lng: 99.5451 },
  'SULAWESI SELATAN':  { anomalies: 4,  risk: 'medium',   lat: -3.6688, lng: 119.9741 },
  'NUSA TENGGARA TIMUR': { anomalies: 3, risk: 'medium',  lat: -8.6574, lng: 121.0794 },
  'BALI':             { anomalies: 1,  risk: 'low',      lat: -8.4095, lng: 115.1889 },
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'critical': return '#EF4444'
    case 'high':     return '#F97316'
    case 'medium':   return '#F59E0B'
    default:         return '#10B981'
  }
}

function getProvinceRisk(name: string): { anomalies: number; risk: string } | null {
  const upper = name.toUpperCase()
  for (const [key, val] of Object.entries(PROVINCE_DATA)) {
    if (upper.includes(key) || key.includes(upper)) return val
  }
  return null
}

export default function AnomalyMap() {
  const [tooltip, setTooltip] = useState<{ name: string; anomalies: number; risk: string } | null>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: 320, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [118, -2],
          scale: 900,
        }}
        width={800}
        height={400}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={[118, -2]} zoom={1} minZoom={0.8} maxZoom={3}>
          <Geographies geography={INDONESIA_TOPO}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provName = geo.properties.state || geo.properties.name || geo.properties.NAME_1 || ''
                const data = getProvinceRisk(provName)
                const fillColor = data
                  ? `${getRiskColor(data.risk)}30`
                  : 'rgba(255,255,255,0.04)'
                const strokeColor = data
                  ? getRiskColor(data.risk)
                  : 'rgba(255,255,255,0.12)'

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: data ? `${getRiskColor(data.risk)}50` : 'rgba(255,255,255,0.08)',
                        stroke: '#fff',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => {
                      if (data) setTooltip({ name: provName, ...data })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })
            }
          </Geographies>

          {/* Anomaly markers */}
          {Object.entries(PROVINCE_DATA).map(([name, data]) => (
            <Marker key={name} coordinates={[data.lng, data.lat]}>
              <circle
                r={Math.max(3, data.anomalies * 0.7)}
                fill={getRiskColor(data.risk)}
                fillOpacity={0.7}
                stroke={getRiskColor(data.risk)}
                strokeWidth={1}
                strokeOpacity={0.3}
              />
              {data.risk === 'critical' && (
                <circle
                  r={Math.max(3, data.anomalies * 0.7) + 4}
                  fill="none"
                  stroke={getRiskColor(data.risk)}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
                />
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(30, 40, 54, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px',
          fontSize: '0.78rem',
          backdropFilter: 'blur(8px)',
          zIndex: 10,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{tooltip.name}</div>
          <div style={{ color: getRiskColor(tooltip.risk) }}>
            {tooltip.anomalies} anomali — <span style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.68rem' }}>{tooltip.risk}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', gap: 12, fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
        {['critical', 'high', 'medium', 'low'].map((r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: getRiskColor(r) }} />
            {r}
          </div>
        ))}
      </div>
    </div>
  )
}
