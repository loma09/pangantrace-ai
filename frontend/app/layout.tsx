import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PanganTrace AI — Food Supply Chain Intelligence',
  description:
    'AI-powered food supply chain monitoring, fraud detection, and subsidy leakage prevention for Indonesia. Powered by Azure AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
