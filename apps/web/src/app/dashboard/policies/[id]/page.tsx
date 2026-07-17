'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import Link from 'next/link'

const statusVariant: Record<string, any> = {
  ACTIVE: 'success', PENDING: 'warning', EXPIRED: 'neutral', CANCELLED: 'error',
}
const claimVariant: Record<string, any> = {
  SUBMITTED: 'info', UNDER_REVIEW: 'warning', APPROVED: 'success', REJECTED: 'error', PAID: 'success',
}

const CLAIM_TIMELINE = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID']

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [policy, setPolicy] = useState<any>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/policies/${id}`),
      api.get('/claims/my'),
      api.get(`/payments/policy/${id}`).catch(() => ({ data: [] })),
    ]).then(([pRes, cRes, pmRes]) => {
      setPolicy(pRes.data)
      setClaims((cRes.data as any[]).filter(c => c.policyId === id))
      setPayments(pmRes.data ?? [])
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!policy) return (
    <div className="text-center py-20 text-on-surface-variant">
      Policy not found. <Link href="/dashboard/policies" className="text-primary font-semibold">← Back</Link>
    </div>
  )

  const isActive = policy.status === 'ACTIVE'
  const daysLeft = Math.max(0, Math.round((new Date(policy.endDate).getTime() - Date.now()) / 86400000))

  return (
    <>
      <DashboardHeader
        title={policy.productName ?? 'Policy Details'}
        subtitle={`Policy Number: ${policy.policyNumber}`}
      />
      <main className="p-8 space-y-6 flex-1 max-w-4xl">
        {/* Status banner */}
        <div className={`rounded-2xl p-5 flex items-center justify-between ${
          isActive ? 'bg-secondary/10 border border-secondary/20' : 'bg-surface-container border border-border-subtle'
        }`}>
          <div className="flex items-center gap-4">
            <span className={`material-symbols-outlined text-3xl ${isActive ? 'text-secondary' : 'text-outline'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {isActive ? 'verified_user' : 'shield'}
            </span>
            <div>
              <div className="flex items-center gap-2"><Badge label={policy.status} variant={statusVariant[policy.status]} dot /></div>
              {isActive && <p className="text-xs text-on-surface-variant mt-1">{daysLeft} days remaining</p>}
            </div>
          </div>
          {isActive && (
            <Link href="/dashboard/claims/new"
              className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">
              File a Claim
            </Link>
          )}
        </div>

        {/* Coverage details */}
        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">Coverage Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Premium',      value: `ETB ${policy.premium?.toLocaleString()}` },
              { label: 'Coverage',     value: `ETB ${policy.coverageAmount?.toLocaleString()}` },
              { label: 'Start Date',   value: new Date(policy.startDate).toLocaleDateString() },
              { label: 'End Date',     value: new Date(policy.endDate).toLocaleDateString() },
            ].map(d => (
              <div key={d.label}>
                <p className="text-xs text-outline mb-1">{d.label}</p>
                <p className="font-semibold text-primary">{d.value}</p>
              </div>
            ))}
          </div>
          {policy.qrCode && (
            <div className="mt-6 pt-6 border-t border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs text-outline mb-1">QR Code / Policy Ref</p>
                <p className="font-mono text-sm text-primary">{policy.qrCode}</p>
              </div>
              <button className="flex items-center gap-2 text-xs text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary-container/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>Certificate
              </button>
            </div>
          )}
        </Card>

        {/* Claims history */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-primary">Claims History</h3>
            {isActive && (
              <Link href="/dashboard/claims/new" className="text-xs text-primary font-semibold hover:underline">+ New Claim</Link>
            )}
          </div>
          {claims.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">No claims submitted for this policy.</p>
          ) : (
            <div className="space-y-4">
              {claims.map(c => (
                <div key={c.id} className="border border-border-subtle rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-xs text-on-surface-variant">{c.claimNumber}</p>
                      <p className="font-semibold text-primary mt-1">ETB {c.claimAmount?.toLocaleString()}</p>
                    </div>
                    <Badge label={c.status} variant={claimVariant[c.status]} dot />
                  </div>
                  {/* Claim timeline */}
                  <div className="flex items-center gap-0">
                    {CLAIM_TIMELINE.map((s, i) => {
                      const reached = CLAIM_TIMELINE.indexOf(c.status) >= i || c.status === 'REJECTED'
                      const current = c.status === s
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              reached ? 'bg-secondary border-secondary' : 'bg-white border-outline-variant'
                            }`}>
                              {reached && <span className="material-symbols-outlined text-on-secondary text-[10px]">check</span>}
                            </div>
                            <span className="text-[9px] text-on-surface-variant mt-1 text-center hidden sm:block">{s.replace('_',' ')}</span>
                          </div>
                          {i < CLAIM_TIMELINE.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                              CLAIM_TIMELINE.indexOf(c.status) > i ? 'bg-secondary' : 'bg-outline-variant/30'
                            }`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {c.adminNotes && <p className="text-xs text-on-surface-variant mt-3 italic">Admin: {c.adminNotes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment history */}
        {payments.length > 0 && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-4">Payment History</h3>
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">receipt_long</span>
                    <div>
                      <p className="text-sm font-semibold">{p.provider}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">ETB {p.amount?.toLocaleString()}</p>
                    <Badge label={p.status} variant={p.status === 'COMPLETED' ? 'success' : 'neutral'} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Link href="/dashboard/policies" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Policies
        </Link>
      </main>
    </>
  )
}
