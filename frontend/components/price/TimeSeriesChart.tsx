'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

const DEMO_DATA = [
  { date: '22 Apr', actual: 16000, predicted: null, lower: null, upper: null },
  { date: '23 Apr', actual: 16050, predicted: null, lower: null, upper: null },
  { date: '24 Apr', actual: 15900, predicted: null, lower: null, upper: null },
  { date: '25 Apr', actual: 16100, predicted: null, lower: null, upper: null },
  { date: '26 Apr', actual: 16150, predicted: null, lower: null, upper: null },
  { date: '27 Apr', actual: 16080, predicted: null, lower: null, upper: null },
  { date: '28 Apr', actual: 16200, predicted: null, lower: null, upper: null },
  { date: '29 Apr', actual: 16200, predicted: 16200, lower: 15700, upper: 16700 },
  { date: '30 Apr', actual: null, predicted: 16350, lower: 15800, upper: 16900 },
  { date: '1 Mei',  actual: null, predicted: 16280, lower: 15700, upper: 16860 },
  { date: '2 Mei',  actual: null, predicted: 16420, lower: 15800, upper: 17040 },
  { date: '3 Mei',  actual: null, predicted: 16380, lower: 15750, upper: 17010 },
  { date: '4 Mei',  actual: null, predicted: 16500, lower: 15900, upper: 17100 },
  { date: '5 Mei',  actual: null, predicted: 16450, lower: 15850, upper: 17050 },
]

export default function TimeSeriesChart() {
  return (
    <div className="chart-container" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DEMO_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 500', 'dataMax + 500']} />
          <Tooltip
            contentStyle={{
              background: '#1E2836',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#F1F5F9',
            }}
          />
          <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceGrad)" />
          <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-primary)" />
          <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} connectNulls={false} />
          <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: '#3B82F6' }} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
