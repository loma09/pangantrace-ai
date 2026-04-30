'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_USERS = [
  { email: 'admin@pangantrace.id', password: 'Demo@2026', role: 'Admin / Kementan', icon: 'admin_panel_settings' },
  { email: 'dinas@pangantrace.id', password: 'Demo@2026', role: 'Petugas Dinas', icon: 'badge' },
  { email: 'bulog@pangantrace.id', password: 'Demo@2026', role: 'Operator Bulog', icon: 'warehouse' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 800))

    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem('pangantrace_user', JSON.stringify({
        email: user.email,
        role: user.role,
        icon: user.icon,
        loginAt: new Date().toISOString(),
      }))
      router.push('/')
    } else {
      setError('Email atau password salah')
    }
    setIsLoading(false)
  }

  const quickLogin = (user: typeof DEMO_USERS[0]) => {
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 40%, #0c1929 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: 20,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1" rel="stylesheet" />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #10B981, #3B82F6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#fff' }}>security</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F1F5F9', marginBottom: 6, letterSpacing: '-0.02em' }}>
            PanganTrace AI
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Food Supply Chain Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 32,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>
            Masuk ke Dashboard
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 24 }}>
            Masukkan kredensial untuk mengakses sistem monitoring
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 18, color: '#64748B',
                }}>mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@pangantrace.id"
                  required
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#F1F5F9',
                    fontSize: '0.88rem', fontFamily: 'inherit',
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 18, color: '#64748B',
                }}>lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#F1F5F9',
                    fontSize: '0.88rem', fontFamily: 'inherit',
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', marginBottom: 16,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8, fontSize: '0.82rem', color: '#EF4444',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '12px 20px',
                background: isLoading ? '#1E3A5F' : 'linear-gradient(135deg, #10B981, #3B82F6)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: '0.92rem', fontWeight: 700,
                fontFamily: 'inherit', cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: isLoading ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isLoading ? 'hourglass_top' : 'login'}
              </span>
              {isLoading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Quick Login Cards */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: '0.72rem', color: '#475569', textAlign: 'center', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Kredensial Demo
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_USERS.map(user => (
              <button
                key={user.email}
                onClick={() => quickLogin(user)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                  color: '#94A3B8', fontSize: '0.8rem',
                  textAlign: 'left', width: '100%',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#3B82F6' }}>{user.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#CBD5E1' }}>{user.role}</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>{user.email}</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#475569' }}>arrow_forward</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.68rem', color: '#334155' }}>
          Powered by Microsoft Azure AI Services
        </div>
      </div>
    </div>
  )
}
