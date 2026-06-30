'use client'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 bg-surface-glass backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex items-center justify-between px-8 h-16">
        <div>
          <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <div className="flex items-center gap-3 bg-surface-container-low border border-border-subtle px-3 py-2 rounded-xl">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-on-surface">{user?.firstName} {user?.lastName}</p>
              <Badge
                label={user?.kycStatus === 'VERIFIED' ? 'Verified' : 'Unverified'}
                variant={user?.kycStatus === 'VERIFIED' ? 'success' : 'warning'}
                dot
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
