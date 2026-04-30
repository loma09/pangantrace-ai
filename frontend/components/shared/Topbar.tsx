'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Topbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('pangantrace_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('pangantrace_user')
    router.push('/login')
  }

  return (
    <header className="topbar" id="main-topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Cari komoditas, provinsi, alert..." id="search-input" />
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className="live-badge">● Live</span>
        
        {/* User Info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px', background: 'var(--bg-elevated)', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--accent-primary)' }}>{user.icon || 'person'}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.role}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{user.email}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="topbar-btn" id="btn-notifications" title="Notifications">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              notifications
            </span>
          </button>
          <button className="topbar-btn" id="btn-settings" title="Settings">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              settings
            </span>
          </button>
          <button className="topbar-btn" id="btn-logout" onClick={handleLogout} title="Logout" style={{ color: 'var(--risk-critical)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              logout
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
