'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import Topbar from '@/components/shared/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isChecking, setIsChecking] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('pangantrace_user')
    if (!stored) {
      router.replace('/login')
    } else {
      setUser(JSON.parse(stored))
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>hourglass_top</span>
          <div style={{ marginTop: 12, fontSize: '0.84rem' }}>Memuat dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <Topbar />
      <main className="main-content">
        <div className="page-container">{children}</div>
      </main>
    </div>
  )
}
