'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token || !user) {
      router.replace('/auth/login')
    } else if (user.isActive === false) {
      router.replace('/auth/pending')
    }
  }, [token, user, router])

  if (!token || !user || user.isActive === false) return null
  return <DashboardShell>{children}</DashboardShell>
}
