'use client'
import { SidebarProvider } from '@/components/layout/SidebarContext'
import { Sidebar } from '@/components/layout/Sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background-main">
        <Sidebar />
        <div className="lg:ml-64 min-h-screen flex flex-col">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
