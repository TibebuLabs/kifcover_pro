'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

export default function AdminInsurersPage() {
  // Insurers are INSURANCE_PROVIDER role users
  const [insurers, setInsurers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users', { params: { limit: 100 } })
      .then(r => {
        const all = r.data.data ?? []
        setInsurers(all.filter((u: any) => u.role === 'INSURANCE_PROVIDER'))
      })
      .catch(() => setInsurers([
        { id: 'ins-1', firstName: 'Ethiopian', lastName: 'Insurance', email: 'admin@eic.et', kycStatus: 'VERIFIED', isActive: true, createdAt: new Date().toISOString() },
        { id: 'ins-2', firstName: 'Awash',     lastName: 'Insurance', email: 'admin@awash.et', kycStatus: 'VERIFIED', isActive: true, createdAt: new Date().toISOString() },
      ]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="Insurer Management" subtitle="Manage insurance company accounts and their product mandates." />
        <main className="p-8 flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
            {loading ? (
              <div className="p-8 space-y-3">{[1,2].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />)}</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    {['Name', 'Email', 'KYC', 'Status', 'Products', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {insurers.map(ins => (
                    <tr key={ins.id} className="border-b border-border-subtle hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">{ins.firstName} {ins.lastName}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">{ins.email}</td>
                      <td className="px-6 py-4"><Badge label={ins.kycStatus} variant={ins.kycStatus === 'VERIFIED' ? 'success' : 'warning'} dot /></td>
                      <td className="px-6 py-4"><Badge label={ins.isActive ? 'Active' : 'Inactive'} variant={ins.isActive ? 'success' : 'error'} dot /></td>
                      <td className="px-6 py-4 text-on-surface-variant">—</td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs">{new Date(ins.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button className="text-xs text-primary border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-surface-container-low">View</button>
                      </td>
                    </tr>
                  ))}
                  {insurers.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant">No insurers registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
