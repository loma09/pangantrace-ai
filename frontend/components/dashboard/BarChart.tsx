'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const PROVINCE_DATA = [
  { name: 'Jawa Timur', anomalies: 14, color: '#EF4444' },
  { name: 'Jawa Barat', anomalies: 11, color: '#F97316' },
  { name: 'Jawa Tengah', anomalies: 8, color: '#F59E0B' },
  { name: 'Sumut', anomalies: 6, color: '#3B82F6' },
  { name: 'Sulsel', anomalies: 4, color: '#3B82F6' },
  { name: 'NTT', anomalies: 3, color: '#3B82F6' },
  { name: 'Bali', anomalies: 1, color: '#10B981' },
]

export default function ProvinceBarChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={PROVINCE_DATA}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: '#1E2836',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#F1F5F9',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="anomalies" radius={[0, 4, 4, 0]} barSize={18}>
            {PROVINCE_DATA.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
