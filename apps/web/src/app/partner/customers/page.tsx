'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

export default function PartnerCustomersPage() {
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/policies', { params: { limit: 100 } })
      .then(r => setPolicies(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Deduplicate by userId
  const customers = Object.values(
    policies.reduce((acc: Record<string, any>, p) => {
      if (!acc[p.userId]) acc[p.userId] = { userId: p.userId, policies: [], lastActivity: p.createdAt }
      acc[p.userId].policies.push(p)
      if (new Date(p.createdAt) > new Date(acc[p.userId].lastActivity)) acc[p.userId].lastActivity = p.createdAt
      return acc
    }, {})
  ) as any[]

  const filtered = customers.filter(c =>
    c.userId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <DashboardHeader title="Customers" subtitle={`${customers.length} customers acquired through your channel`} />
      <main className="p-8 flex-1 space-y-5">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer ID…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10" />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">group</span>
              <p className="text-on-surface-variant">No customers yet. Sell your first policy above.</p>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle">
                <tr>
                  {['Customer ID', 'Policies', 'Active', 'Total Premium', 'Last Activity'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const active = c.policies.filter((p: any) => p.status === 'ACTIVE').length
                  const totalPremium = c.policies.reduce((s: number, p: any) => s + (p.premium ?? 0), 0)
                  return (
                    <tr key={c.userId} className="border-b border-border-subtle hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-primary">{c.userId.slice(0, 12)}…</td>
                      <td className="px-6 py-4 font-semibold text-on-surface">{c.policies.length}</td>
                      <td className="px-6 py-4"><Badge label={`${active} Active`} variant={active > 0 ? 'success' : 'neutral'} dot /></td>
                      <td className="px-6 py-4 font-bold text-primary">ETB {totalPremium.toLocaleString()}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{new Date(c.lastActivity).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
