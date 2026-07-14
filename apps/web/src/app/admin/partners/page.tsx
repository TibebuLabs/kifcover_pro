'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface Partner {
  id: string
  name: string
  slug: string
  apiKey: string
  commissionRate: number
  isActive: boolean
  createdAt: string
  _count?: { policies: number }
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/partner')
      .then((res) => setPartners(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="Partner Management" subtitle="Manage all registered API partners." />
        <main className="p-8 space-y-6 flex-1">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 h-24 animate-pulse" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-subtle p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">group</span>
              <p className="text-on-surface-variant font-semibold">No partners registered yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low border-b border-border-subtle">
                  <tr>
                    {['Partner', 'Slug', 'Commission', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{p.slug}</td>
                      <td className="px-6 py-4">{(p.commissionRate * 100).toFixed(0)}%</td>
                      <td className="px-6 py-4">
                        <Badge label={p.isActive ? 'Active' : 'Inactive'} variant={p.isActive ? 'success' : 'neutral'} dot />
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => api.post(`/partner/${p.id}/regen-key`, { env: 'prod' }).then(() => alert('API key regenerated'))}
                          className="text-xs text-primary border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                        >
                          Regen Key
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
