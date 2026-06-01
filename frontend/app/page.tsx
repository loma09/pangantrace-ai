'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import './landing.css'

const FEATURES = [
  { icon: 'security', color: 'blue', title: 'Deteksi Fraud AI', desc: 'Identifikasi anomali dan potensi kecurangan dalam rantai pasok pangan secara real-time menggunakan Azure AI.' },
  { icon: 'trending_up', color: 'emerald', title: 'Prediksi Harga', desc: 'Forecast harga komoditas pangan dengan model time-series ML untuk pengambilan keputusan strategis.' },
  { icon: 'hub', color: 'violet', title: 'Supply Chain Tracking', desc: 'Pantau alur distribusi pangan dari sumber hingga konsumen dengan visualisasi interaktif.' },
  { icon: 'shield', color: 'cyan', title: 'Pencegahan Kebocoran Subsidi', desc: 'Deteksi penyimpangan distribusi subsidi pangan dengan analisis pattern recognition.' },
  { icon: 'analytics', color: 'amber', title: 'Dashboard Analitik', desc: 'Visualisasi data komprehensif dengan metrik real-time untuk monitoring rantai pasok.' },
  { icon: 'description', color: 'rose', title: 'Laporan Otomatis', desc: 'Generate laporan executive summary secara otomatis dengan insight berbasis AI.' },
]

const STEPS = [
  { num: '01', title: 'Pengumpulan Data', desc: 'Data transaksi dan distribusi dikumpulkan dari seluruh node rantai pasok.' },
  { num: '02', title: 'Analisis AI', desc: 'Azure AI memproses data untuk mendeteksi anomali, prediksi harga, dan risk scoring.' },
  { num: '03', title: 'Insight & Aksi', desc: 'Dashboard menampilkan insight actionable untuk pengambilan keputusan cepat.' },
]

const TECHS = [
  { icon: 'cloud', label: 'Azure AI' },
  { icon: 'psychology', label: 'Machine Learning' },
  { icon: 'api', label: 'FastAPI' },
  { icon: 'code', label: 'Next.js' },
  { icon: 'storage', label: 'PostgreSQL' },
  { icon: 'auto_graph', label: 'Real-time Analytics' },
]

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null)

  // Scroll-based navbar effect
  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])



  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav ref={navRef} className="landing-nav">
        <Link href="/" className="nav-brand">
          <div className="nav-logo">
            <span className="material-symbols-outlined" style={{ color: '#fff' }}>security</span>
          </div>
          <span className="nav-brand-text">PanganTrace AI</span>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Fitur</a>
          <a href="#how-it-works" className="nav-link">Cara Kerja</a>
          <a href="#tech" className="nav-link">Teknologi</a>
          <Link href="/login" className="nav-cta">Masuk Dashboard</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="hero-grid-pattern" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="material-symbols-outlined">auto_awesome</span>
            Powered by Microsoft Azure AI
          </div>
          <h1 className="hero-title">
            Pantau Rantai Pasok Pangan dengan{' '}
            <span className="gradient-text">Kecerdasan Buatan</span>
          </h1>
          <p className="hero-subtitle">
            Platform AI untuk deteksi fraud, prediksi harga, dan monitoring rantai pasok
            pangan Indonesia secara real-time.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
              Mulai Sekarang
            </Link>
            <a href="#features" className="btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_circle</span>
              Pelajari Lebih Lanjut
            </a>
          </div>
          <div className="hero-stats glass">
            <div>
              <div className="hero-stat-value">34</div>
              <div className="hero-stat-label">Provinsi Terpantau</div>
            </div>
            <div>
              <div className="hero-stat-value">12K+</div>
              <div className="hero-stat-label">Transaksi/Hari</div>
            </div>
            <div>
              <div className="hero-stat-value">99.2%</div>
              <div className="hero-stat-label">Akurasi Deteksi</div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>expand_more</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="section-header-center reveal">
          <div className="section-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
            FITUR UTAMA
          </div>
          <h2 className="section-title">Solusi Lengkap untuk Keamanan Pangan</h2>
          <p className="section-desc">
            Teknologi AI mutakhir untuk melindungi rantai pasok pangan nasional dari fraud dan inefisiensi.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card glass reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className={`feature-icon ${f.color}`}>
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-section">
        <div className="section-header-center reveal">
          <div className="section-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>route</span>
            CARA KERJA
          </div>
          <h2 className="section-title">Tiga Langkah Sederhana</h2>
          <p className="section-desc">
            Dari data mentah hingga insight actionable dalam hitungan detik.
          </p>
        </div>
        <div className="steps-container">
          {STEPS.map((s, i) => (
            <div key={i} className="step-card glass reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="landing-section">
        <div className="section-header-center reveal">
          <div className="section-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>memory</span>
            TEKNOLOGI
          </div>
          <h2 className="section-title">Dibangun dengan Teknologi Terbaik</h2>
          <p className="section-desc">
            Stack modern untuk performa dan keandalan tingkat enterprise.
          </p>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...TECHS, ...TECHS].map((t, i) => (
              <div key={i} className="tech-pill">
                <span className="material-symbols-outlined tech-pill-icon">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card reveal">
          <h2>Siap Mengamankan Rantai Pasok Pangan?</h2>
          <p>Akses dashboard monitoring dan mulai deteksi fraud dengan AI sekarang.</p>
          <Link href="/login" className="btn-primary" style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>
            Akses Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 16 }}>security</span>
          </div>
          <span>PanganTrace AI</span>
        </div>
        <div className="footer-links">
          <a href="#features">Fitur</a>
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#tech">Teknologi</a>
          <Link href="/login">Login</Link>
        </div>
        <div className="footer-copy">
          © 2026 PanganTrace AI — Powered by Microsoft Azure AI Services
        </div>
      </footer>
    </div>
  )
}
