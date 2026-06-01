'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Monitoring',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
      { label: 'Fraud Detection', href: '/fraud', icon: 'shield', badge: '3' },
      { label: 'Supply Chain', href: '/supply-chain', icon: 'hub' },
    ],
  },
  {
    title: 'Analitik',
    items: [
      { label: 'Prediksi Harga', href: '/price-prediction', icon: 'trending_up' },
      { label: 'Laporan', href: '/reports', icon: 'summarize' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>
            verified
          </span>
        </div>
        <div>
          <h1>PanganTrace AI</h1>
          <small>Supply Chain Intelligence</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-label">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                id={`nav-${item.href.replace('/', '') || 'dashboard'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-status">
          <span className="status-dot" />
          Azure AI Services Connected
        </div>
      </div>
    </aside>
  )
}
