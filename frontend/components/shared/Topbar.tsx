'use client'

export default function Topbar() {
  return (
    <header className="topbar" id="main-topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Cari komoditas, provinsi, alert..." id="search-input" />
        </div>
      </div>

      <div className="topbar-right">
        <span className="live-badge">● Live</span>
        <button className="topbar-btn" id="btn-notifications">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            notifications
          </span>
        </button>
        <button className="topbar-btn" id="btn-settings">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            settings
          </span>
        </button>
      </div>
    </header>
  )
}
