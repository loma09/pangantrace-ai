import Sidebar from '@/components/shared/Sidebar'
import Topbar from '@/components/shared/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
