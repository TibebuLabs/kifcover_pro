'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface Claim {
  id: string; claimNumber: string; userId: string; policyId: string
  policyNumber: string; status: string; description: string
  incidentDate: string; claimAmount: number; approvedAmount?: number
  adminNotes?: string; createdAt: string
}

const statusVariant: Record<string, 'info'|'warning'|'success'|'error'|'neutral'> = {
  SUBMITTED: 'info', UNDER_REVIEW: 'warning', APPROVED: 'success', REJECTED: 'error', PAID: 'success',
}
const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PAID'],
}

export default function InsurerClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [approvedAmt, setApprovedAmt] = useState('')
  const limit = 20

  const load = () => {
    setLoading(true)
    api.get('/claims', { params: { page, limit, ...(status ? { status } : {}) } })
      .then(r => { setClaims(r.data.data ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page, status])

  const transition = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/claims/${id}/review`, {
        status: newStatus,
        ...(approvedAmt ? { approvedAmount: +approvedAmt } : {}),
        ...(notes ? { adminNotes: notes } : {}),
      })
      setReviewing(null); setNotes(''); setApprovedAmt('')
      load()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <DashboardHeader title="Claims Queue" subtitle={`${total} total claims across all policies`} />
      <main className="p-8 flex-1 space-y-4">
        <div className="flex items-center gap-3">
          {['', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                status === s ? 'bg-primary text-on-primary border-primary' : 'bg-white border-border-subtle text-on-surface-variant hover:bg-surface-container-low'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-24 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {claims.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-border-subtle shadow-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-on-surface-variant">{c.claimNumber.slice(0,8)}…</span>
                      <Badge label={c.status} variant={statusVariant[c.status] ?? 'neutral'} dot />
                      <span className="text-xs text-outline">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-on-surface mb-3 line-clamp-2">{c.description}</p>
                    <div className="flex gap-6 text-sm">
                      <div><span className="text-xs text-outline">Claimed: </span><span className="font-bold text-primary">ETB {c.claimAmount.toLocaleString()}</span></div>
                      {c.approvedAmount != null && <div><span className="text-xs text-outline">Approved: </span><span className="font-bold text-secondary">ETB {c.approvedAmount.toLocaleString()}</span></div>}
                      <div><span className="text-xs text-outline">Incident: </span><span className="font-medium">{new Date(c.incidentDate).toLocaleDateString()}</span></div>
                    </div>
                    {c.adminNotes && <p className="text-xs text-on-surface-variant mt-2 italic">Note: {c.adminNotes}</p>}
                  </div>

                  {/* Review panel */}
                  <div className="shrink-0">
                    {reviewing === c.id ? (
                      <div className="w-72 space-y-3 p-4 bg-surface-container-low rounded-2xl border border-border-subtle">
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Admin notes…"
                          rows={2} className="w-full text-xs px-3 py-2 bg-white border border-border-subtle rounded-xl resize-none focus:outline-none" />
                        {['APPROVED', 'PAID'].some(s => TRANSITIONS[c.status]?.includes(s)) && (
                          <input type="number" value={approvedAmt} onChange={e => setApprovedAmt(e.target.value)}
                            placeholder="Approved amount (ETB)"
                            className="w-full text-xs px-3 py-2 bg-white border border-border-subtle rounded-xl focus:outline-none" />
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {(TRANSITIONS[c.status] ?? []).map(ns => (
                            <button key={ns} onClick={() => transition(c.id, ns)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                ns === 'REJECTED' ? 'bg-error text-white' : 'bg-primary text-on-primary'
                              }`}>{ns}</button>
                          ))}
                          <button onClick={() => setReviewing(null)} className="text-xs text-on-surface-variant hover:text-on-surface px-2">Cancel</button>
                        </div>
                      </div>
                    ) : TRANSITIONS[c.status]?.length ? (
                      <button onClick={() => setReviewing(c.id)}
                        className="text-xs font-semibold text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary-container/10 transition-colors whitespace-nowrap">
                        Review →
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {claims.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">No claims found for the selected filter.</div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-on-surface-variant">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
