'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { claimApi, policyApi } from '@/lib/api'

const statusVariant: Record<string, any> = {
  SUBMITTED: 'info', UNDER_REVIEW: 'warning', APPROVED: 'success', REJECTED: 'error', PAID: 'success',
}

const statusSteps = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID']

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [claim, setClaim] = useState<any>(null)
  const [policy, setPolicy] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    claimApi.get(id)
      .then(async (res) => {
        setClaim(res.data)
        if (res.data?.policyId) {
          try { const p = await policyApi.get(res.data.policyId); setPolicy(p.data) } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <DashboardHeader title="Claim Details" />
        <main className="p-8 flex-1">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-28" />)}
          </div>
        </main>
      </>
    )
  }

  if (!claim) {
    return (
      <>
        <DashboardHeader title="Claim Details" />
        <main className="p-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">assignment_turned_in</span>
            <p className="text-on-surface-variant mb-4">Claim not found.</p>
            <Link href="/dashboard/claims" className="text-primary text-sm font-semibold hover:underline">← Back to Claims</Link>
          </div>
        </main>
      </>
    )
  }

  const currentStep = statusSteps.indexOf(claim.status)

  return (
    <>
      <DashboardHeader title={`Claim ${claim.claimNumber?.slice(0, 8)}…`} subtitle={`Filed ${new Date(claim.createdAt).toLocaleDateString()}`} />
      <main className="p-8 space-y-6 flex-1 max-w-4xl">
        {/* Back */}
        <Link href="/dashboard/claims" className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Claims
        </Link>

        {/* Status banner */}
        <div className={`flex items-center justify-between p-5 rounded-2xl border ${
          claim.status === 'APPROVED' || claim.status === 'PAID' ? 'bg-secondary-container/20 border-secondary/30' :
          claim.status === 'REJECTED' ? 'bg-error-container/20 border-error/30' :
          'bg-primary-fixed/20 border-primary/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              claim.status === 'APPROVED' || claim.status === 'PAID' ? 'bg-secondary text-on-secondary' :
              claim.status === 'REJECTED' ? 'bg-error text-on-error' :
              'bg-primary text-on-primary'
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {claim.status === 'APPROVED' || claim.status === 'PAID' ? 'check_circle' :
                 claim.status === 'REJECTED' ? 'cancel' : 'pending'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{claim.status.replace('_', ' ')}</p>
              <p className="text-xs text-on-surface-variant">
                {claim.status === 'PAID' && claim.resolvedAt
                  ? `Paid on ${new Date(claim.resolvedAt).toLocaleDateString()}`
                  : claim.status === 'APPROVED' && claim.approvedAmount
                    ? `Approved for ETB ${claim.approvedAmount.toLocaleString()}`
                    : claim.status === 'REJECTED'
                      ? 'This claim was not approved'
                      : 'Your claim is being reviewed'}
              </p>
            </div>
          </div>
          {claim.claimAmount && (
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Claim Amount</p>
              <p className="text-xl font-bold text-primary">ETB {claim.claimAmount.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Status timeline */}
        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">Status Timeline</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-container-high z-0" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all"
              style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }} />

            {statusSteps.map((step, i) => {
              const reached = i <= currentStep
              const isCurrent = i === currentStep
              return (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    reached
                      ? 'bg-primary border-primary text-on-primary'
                      : 'bg-surface-container-lowest border-border-subtle text-on-surface-variant'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {reached ? 'check' : step === 'PAID' ? 'payments' : 'hourglass_empty'}
                    </span>
                  </div>
                  <p className={`text-[10px] font-semibold mt-2 ${reached ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {step.replace('_', ' ')}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-4">Claim Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Claim Number', value: claim.claimNumber },
                { label: 'Policy Number', value: claim.policyNumber },
                { label: 'Incident Date', value: new Date(claim.incidentDate).toLocaleDateString() },
                { label: 'Filed On', value: new Date(claim.createdAt).toLocaleDateString() },
                { label: 'Claim Amount', value: `ETB ${claim.claimAmount?.toLocaleString()}` },
                ...(claim.approvedAmount ? [{ label: 'Approved Amount', value: `ETB ${claim.approvedAmount.toLocaleString()}` }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{item.label}</span>
                  <span className="font-semibold text-on-surface">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-4">Description</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{claim.description}</p>

            {claim.adminNotes && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs font-semibold text-on-surface-variant mb-2">Admin Notes</p>
                <p className="text-sm text-on-surface bg-surface-container-low rounded-xl p-3">{claim.adminNotes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Documents */}
        {claim.documents && (Array.isArray(claim.documents) ? claim.documents.length > 0 : false) && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-4">Supporting Documents</h3>
            <div className="space-y-2">
              {(claim.documents as string[]).map((doc: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="text-sm text-on-surface flex-1 truncate">{doc}</span>
                  <span className="text-xs text-on-surface-variant">Document {i + 1}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Related policy */}
        {policy && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-primary mb-1">Related Policy</h3>
                <p className="text-sm text-on-surface-variant">{policy.productName} · {policy.policyNumber}</p>
              </div>
              <Link href={`/dashboard/policies/${policy.id}`}
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                View Policy
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </>
  )
}
