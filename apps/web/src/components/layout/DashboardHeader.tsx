'use client'
import { useSidebar } from '@/components/layout/SidebarContext'
import { UserMenu } from '@/components/layout/UserMenu'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { toggle } = useSidebar()

  return (
    <header className="sticky top-0 z-30 bg-surface-glass backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 h-16">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={toggle}
            className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-xl font-bold text-primary truncate">{title}</h1>
            {subtitle && <p className="text-xs text-on-surface-variant truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all relative hidden sm:flex" aria-label="Notifications">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
