import { Sidebar } from '@/components/layout/Sidebar'

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">{children}</div>
    </div>
  )
}
