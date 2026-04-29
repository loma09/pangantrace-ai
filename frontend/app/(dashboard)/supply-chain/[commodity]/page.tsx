'use client'

import { useParams } from 'next/navigation'
import ChainFlow from '@/components/chain/ChainFlow'
import MetricCard from '@/components/dashboard/MetricCard'

export default function CommodityChainPage() {
  const { commodity } = useParams<{ commodity: string }>()
  const label = commodity?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? ''

  return (
    <>
      <div className="page-header">
        <h2>Rantai Pasok — {label}</h2>
        <p>Detail alur distribusi komoditas {label} di seluruh Indonesia</p>
      </div>

      <div className="metrics-grid">
        <MetricCard label="Total Produsen" value={12} icon="agriculture" accentColor="#10B981" />
        <MetricCard label="Total Distributor" value={24} icon="local_shipping" accentColor="#3B82F6" />
        <MetricCard label="Total Retailer" value={18} icon="storefront" accentColor="#8B5CF6" />
        <MetricCard label="Discrepancy Rata-rata" value="3.2%" icon="warning" accentColor="#F59E0B" />
      </div>

      <div className="card animate-in">
        <div className="card-header">
          <span className="card-title">
            <span className="material-symbols-outlined">account_tree</span>
            Alur Distribusi — {label}
          </span>
        </div>
        <ChainFlow commodity={commodity} />
      </div>
    </>
  )
}
