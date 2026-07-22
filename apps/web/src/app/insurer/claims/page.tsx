'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { insurerApi } from '@/lib/api'

interface Claim {
  id: string; claimNumber: string; userId: string; policyId: string
  policyNumber: string; status: string; description: string
  incidentDate: string; claimAmount: number; approvedAmount?: number
  adminNotes?: string; createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; icon: string }> = {
  SUBMITTED:    { label: 'Submitted',    color: 'bg-blue-50 text-blue-700 border-blue-200',    dotColor: 'bg-blue-500',   icon: 'inbox' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500',  icon: 'search' },
  APPROVED:     { label: 'Approved',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500', icon: 'check_circle' },
  REJECTED:     { label: 'Rejected',     color: 'bg-rose-50 text-rose-700 border-rose-200',     dotColor: 'bg-rose-500',   icon: 'cancel' },
  PAID:         { label: 'Paid',         color: 'bg-violet-50 text-violet-700 border-violet-200', dotColor: 'bg-violet-500', icon: 'paid' },
}

const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PAID'],
}

const PIPELINE_STEPS = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID']

function ClaimTimeline({ status }: { status: string }) {
  const currentIdx = PIPELINE_STEPS.indexOf(status)
  const isRejected = status === 'REJECTED'
  return (
    <div className="flex items-center gap-1 mt-2">
      {PIPELINE_STEPS.map((step, i) => {
        const reached = isRejected ? step === 'SUBMITTED' : i <= currentIdx
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-all ${reached ? 'bg-primary scale-110' : 'bg-gray-200'}`} />
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < currentIdx || (isRejected && i === 0) ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
      {isRejected && (
        <span className="ml-1 text-[10px] text-rose-500 font-bold">REJECTED</span>
      )}
    </div>
  )
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
    insurerApi.all ? insurerApi.all({ page, limit, ...(status ? { status } : {}) }) :
    import('@/lib/api').then(m => m.api.get('/claims', { params: { page, limit, ...(status ? { status } : {}) } }))
      .then(r => { setClaims(r.data.data ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page, status])

  const transition = async (id: string, newStatus: string) => {
    try {
      await import('@/lib/api').then(m => m.api.patch(`/claims/${id}/review`, {
        status: newStatus,
        ...(approvedAmt ? { approvedAmount: +approvedAmt } : {}),
        ...(notes ? { adminNotes: notes } : {}),
      }))
      setReviewing(null); setNotes(''); setApprovedAmt('')
      load()
    } catch {}
  }

  const totalPages = Math.ceil(total / limit)
  const statusCounts = PIPELINE_STEPS.reduce((acc, s) => {
    acc[s] = claims.filter(c => c.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <DashboardHeader title="Claims Intelligence" subtitle={`${total} total claims across all policies`} />
      <main className="p-8 flex-1 space-y-6">
        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setStatus(''); setPage(1) }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
              !status ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-border-subtle text-on-surface-variant hover:border-primary/30'
            }`}>
            All Claims ({total})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => { setStatus(status === key ? '' : key); setPage(1) }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                status === key ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-border-subtle text-on-surface-variant hover:border-primary/30'
              }`}>
              <span className={`w-2 h-2 rounded-full ${status === key ? 'bg-white' : cfg.dotColor}`} />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Claims list */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl border h-32 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {claims.map(c => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.SUBMITTED
              return (
                <div key={c.id} className="bg-white rounded-3xl border border-border-subtle shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Status strip */}
                    <div className={`w-1.5 ${cfg.dotColor}`} />

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                              #{c.claimNumber.slice(0, 8)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                              {cfg.label}
                            </span>
                            <span className="text-xs text-on-surface-variant">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>

                          <p className="text-sm text-on-surface mb-3 line-clamp-2">{c.description}</p>

                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider block mb-0.5">Claimed</span>
                              <span className="font-extrabold text-primary">ETB {c.claimAmount.toLocaleString()}</span>
                            </div>
                            {c.approvedAmount != null && (
                              <div>
                                <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider block mb-0.5">Approved</span>
                                <span className="font-extrabold text-emerald-600">ETB {c.approvedAmount.toLocaleString()}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider block mb-0.5">Incident</span>
                              <span className="font-semibold">{new Date(c.incidentDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <ClaimTimeline status={c.status} />

                          {c.adminNotes && (
                            <p className="text-xs text-on-surface-variant mt-3 italic bg-surface-container-low px-3 py-2 rounded-xl">
                              Note: {c.adminNotes}
                            </p>
                          )}
                        </div>

                        {/* Review panel */}
                        <div className="shrink-0">
                          {reviewing === c.id ? (
                            <div className="w-72 space-y-3 p-5 bg-surface-container-low rounded-3xl border border-border-subtle">
                              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add review notes…"
                                rows={2} className="w-full text-xs px-3 py-2.5 bg-white border border-border-subtle rounded-2xl resize-none focus:outline-none focus:border-primary transition-colors" />
                              {['APPROVED', 'PAID'].some(s => TRANSITIONS[c.status]?.includes(s)) && (
                                <input type="number" value={approvedAmt} onChange={e => setApprovedAmt(e.target.value)}
                                  placeholder="Approved amount (ETB)"
                                  className="w-full text-xs px-3 py-2.5 bg-white border border-border-subtle rounded-2xl focus:outline-none focus:border-primary transition-colors" />
                              )}
                              <div className="flex gap-2 flex-wrap">
                                {(TRANSITIONS[c.status] ?? []).map(ns => (
                                  <button key={ns} onClick={() => transition(c.id, ns)}
                                    className={`text-xs font-bold px-4 py-2 rounded-2xl transition-colors ${
                                      ns === 'REJECTED'
                                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    }`}>{ns}</button>
                                ))}
                                <button onClick={() => setReviewing(null)} className="text-xs text-on-surface-variant hover:text-on-surface px-2">Cancel</button>
                              </div>
                            </div>
                          ) : TRANSITIONS[c.status]?.length ? (
                            <button onClick={() => setReviewing(c.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-primary border-2 border-primary/20 px-5 py-2.5 rounded-2xl hover:bg-primary-container/10 transition-all whitespace-nowrap">
                              <span className="material-symbols-outlined text-[16px]">rate_review</span>
                              Review
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {claims.length === 0 && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">assignment_turned_in</span>
                <p className="text-on-surface-variant font-medium">No claims found</p>
                <p className="text-xs text-on-surface-variant mt-1">No claims match the selected filter</p>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-on-surface-variant">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold border-2 border-border-subtle rounded-2xl disabled:opacity-40 hover:border-primary/30 transition-colors">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold border-2 border-border-subtle rounded-2xl disabled:opacity-40 hover:border-primary/30 transition-colors">
                Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
