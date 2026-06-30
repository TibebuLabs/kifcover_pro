'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import Link from 'next/link'

interface Claim {
  id: string
  claimNumber: string
  status: string
  claimAmount: number
  approvedAmount?: number
  description: string
  incidentDate: string
  createdAt: string
  policy: { policyNumber: string; product: { name: string } }
}

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  PAID: 'success',
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/claims/my')
      .then((res) => setClaims(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <DashboardHeader title="My Claims" subtitle="Track the status of all your insurance claims." />
      <main className="p-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-on-surface-variant">{claims.length} claim{claims.length !== 1 ? 's' : ''} found</p>
          <Link
            href="/dashboard/claims/new"
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Claim
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">assignment_turned_in</span>
              <p className="font-semibold text-on-surface-variant mb-1">No claims yet</p>
              <p className="text-sm text-outline mb-6">If you need to make a claim, click the button below.</p>
              <Link href="/dashboard/claims/new" className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">
                File a Claim →
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-2xl border border-border-subtle p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-primary">{claim.policy.product.name}</h3>
                      <Badge label={claim.status} variant={statusVariant[claim.status] ?? 'neutral'} dot />
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono mb-3">{claim.claimNumber}</p>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{claim.description}</p>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-xs text-outline mb-0.5">Claimed</p>
                        <p className="font-semibold text-primary">ETB {claim.claimAmount.toLocaleString()}</p>
                      </div>
                      {claim.approvedAmount != null && (
                        <div>
                          <p className="text-xs text-outline mb-0.5">Approved</p>
                          <p className="font-semibold text-secondary">ETB {claim.approvedAmount.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-outline mb-0.5">Incident Date</p>
                        <p className="font-semibold text-primary">{new Date(claim.incidentDate).toLocaleDateString('en-ET')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(claim.createdAt).toLocaleDateString('en-ET')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
