'use client'

import { useState } from 'react'
import ChainFlow from '@/components/chain/ChainFlow'
import CommodityFilter from '@/components/chain/CommodityFilter'
import NodeDetail from '@/components/chain/NodeDetail'
import MetricCard from '@/components/dashboard/MetricCard'

export default function SupplyChainPage() {
  const [selectedCommodity, setSelectedCommodity] = useState('beras_premium')

  return (
    <>
      <div className="page-header">
        <h2>Rantai Pasok</h2>
        <p>Tracing distribusi komoditas pangan dari produsen hingga retail — transparansi setiap kilogram</p>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard label="Total Node" value={156} icon="hub" accentColor="#3B82F6" />
        <MetricCard label="Produsen" value={42} icon="agriculture" accentColor="#10B981" />
        <MetricCard label="Distributor" value={67} icon="local_shipping" accentColor="#F59E0B" />
        <MetricCard label="Retailer" value={47} icon="storefront" accentColor="#8B5CF6" />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <CommodityFilter selected={selectedCommodity} onChange={setSelectedCommodity} />
      </div>

      <div className="dashboard-grid">
        {/* Chain Flow */}
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">
              <span className="material-symbols-outlined">account_tree</span>
              Alur Distribusi
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Jawa Timur</span>
          </div>
          <ChainFlow commodity={selectedCommodity} />
        </div>

        {/* Node Detail */}
        <div className="animate-in">
          <NodeDetail />
          <div className="ai-insight-card" style={{ marginTop: 16 }}>
            <div className="ai-insight-header">
              <span className="material-symbols-outlined">auto_awesome</span>
              <h4>AI Analysis</h4>
            </div>
            <div className="ai-insight-body">
              <p>
                Distributor PT Pangan Makmur menunjukkan discrepancy volume 5.6% yang melebihi
                threshold normal (5%). Volume masuk 1,250.5 ton namun hanya 1,180.2 ton yang tercatat keluar.
                Selisih 70.3 ton ini perlu diverifikasi — kemungkinan penyebab: kerusakan stok,
                pencatatan yang tidak akurat, atau potensi pengalihan distribusi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
