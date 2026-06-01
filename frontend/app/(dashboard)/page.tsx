@"
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import app from 'next/app'
import page from '../page'

export default function DashboardRootRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/fraud')
  }, [router])

  return null
}
"@ | Set-Content "frontend/app/(dashboard)/page.tsx"