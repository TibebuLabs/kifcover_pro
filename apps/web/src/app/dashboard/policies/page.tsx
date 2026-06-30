'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import Link from 'next/link'

interface Policy {
  id: string
  policyNumber: string
  status: string
  premium: number
  coverageAmount: number
  startDate: string
  endDate: string
  product: { name: string; category: string }
}

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  EXPIRED: 'neutral',
  CANCELLED: 'error',
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/policies/my')
      .then((res) => setPolicies(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <DashboardHeader title="My Policies" subtitle="All your active and past insurance policies." />
      <main className="p-8 flex-1">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 h-28 animate-pulse" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">policy</span>
              <p className="font-semibold text-on-surface-variant mb-1">No policies yet</p>
              <p className="text-sm text-outline mb-6">Browse our marketplace and get covered in minutes.</p>
              <Link href="/marketplace" className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">
                Browse Products →
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="bg-white rounded-2xl border border-border-subtle p-6 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-primary">{policy.product.name}</h3>
                      <Badge label={policy.status} variant={statusVariant[policy.status] ?? 'neutral'} dot />
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono mb-4">{policy.policyNumber}</p>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-xs text-outline mb-0.5">Premium</p>
                        <p className="font-semibold text-primary">ETB {policy.premium.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-outline mb-0.5">Coverage</p>
                        <p className="font-semibold text-primary">ETB {policy.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-outline mb-0.5">Expires</p>
                        <p className="font-semibold text-primary">{new Date(policy.endDate).toLocaleDateString('en-ET')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/dashboard/policies/${policy.id}`}
                      className="text-xs font-semibold text-primary border border-border-subtle px-4 py-2 rounded-xl hover:bg-surface-container-low transition-colors whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    {policy.status === 'ACTIVE' && (
                      <Link
                        href="/dashboard/claims/new"
                        className="text-xs font-semibold text-secondary border border-secondary/20 bg-secondary-container/10 px-4 py-2 rounded-xl hover:bg-secondary-container/20 transition-colors whitespace-nowrap text-center"
                      >
                        File Claim
                      </Link>
                    )}
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
