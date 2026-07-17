'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'

interface Policy {
  id: string; policyNumber: string; userId: string
  productName: string; status: string
  premium: number; coverageAmount: number
  startDate: string; endDate: string; createdAt: string
}

const statusVariant: Record<string, 'success'|'warning'|'error'|'neutral'> = {
  ACTIVE: 'success', PENDING: 'warning', EXPIRED: 'neutral', CANCELLED: 'error',
}

export default function PartnerPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const limit = 20

  const load = () => {
    setLoading(true)
    api.get('/policies', { params: { page, limit, ...(status ? { status } : {}) } })
      .then(r => { setPolicies(r.data.data ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, status])

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <DashboardHeader title="Partner Policies" subtitle={`${total} policies distributed via your channel`} />
      <main className="p-8 flex-1 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          {['', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                status === s ? 'bg-primary text-on-primary border-primary' : 'bg-white border-border-subtle text-on-surface-variant hover:bg-surface-container-low'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-surface-container rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-border-subtle">
                <tr>
                  {['Policy #', 'Product', 'Customer', 'Premium', 'Status', 'Start', 'End'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policies.map(p => (
                  <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{p.policyNumber.slice(0,8)}…</td>
                    <td className="px-5 py-3 font-semibold text-on-surface">{p.productName}</td>
                    <td className="px-5 py-3 text-on-surface-variant text-xs font-mono">{p.userId.slice(0,8)}…</td>
                    <td className="px-5 py-3 font-semibold text-primary">ETB {p.premium.toLocaleString()}</td>
                    <td className="px-5 py-3"><Badge label={p.status} variant={statusVariant[p.status] ?? 'neutral'} dot /></td>
                    <td className="px-5 py-3 text-on-surface-variant text-xs">{new Date(p.startDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-on-surface-variant text-xs">{new Date(p.endDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {policies.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-16 text-on-surface-variant">No policies found.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
              <p className="text-xs text-on-surface-variant">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
