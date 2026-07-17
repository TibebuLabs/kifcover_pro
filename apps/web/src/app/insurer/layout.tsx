import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/layout/SidebarContext'

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background-main">
        <Sidebar />
        <div className="ml-0 lg:ml-64 flex-1 flex flex-col">{children}</div>
      </div>
    </SidebarProvider>
  )
}
