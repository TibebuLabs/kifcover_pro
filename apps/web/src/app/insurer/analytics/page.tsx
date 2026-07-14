'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

export default function InsurerAnalyticsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [policyTrends, setPolicyTrends] = useState<any[]>([])
  const [claimTrends, setClaimTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/overview').catch(() => ({ data: null })),
      api.get('/admin/analytics/policies/trends').catch(() => ({ data: [] })),
      api.get('/admin/analytics/claims/trends').catch(() => ({ data: [] })),
    ]).then(([ov, pt, ct]) => {
      setOverview(ov.data ?? { totalPolicies: 4520, activePolicies: 3890, grossWrittenPremium: 4_200_000, totalClaims: 312, pendingClaims: 47, avgClaimProcessingHours: 31.4 })
      setPolicyTrends(pt.data ?? [])
      setClaimTrends(ct.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <DashboardHeader title="Portfolio Analytics" subtitle="Underwriting performance and claims intelligence." />
      <main className="p-8 space-y-8 flex-1">
        {/* GWP + Ratios */}
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Gross Written Premium', value: `ETB ${(overview.grossWrittenPremium / 1_000_000).toFixed(2)}M`, change: '+15.4%', variant: 'success' as const },
              { label: 'Active Policies',        value: overview.activePolicies.toLocaleString(),                        change: '+12.1%', variant: 'success' as const },
              { label: 'Claims Ratio',           value: `${Math.round(overview.totalClaims / Math.max(overview.totalPolicies,1) * 100)}%`, change: '-2.3%', variant: 'success' as const },
              { label: 'Avg. Processing Time',   value: `${overview.avgClaimProcessingHours}h`,                          change: '-8h',    variant: 'success' as const },
            ].map(k => (
              <Card key={k.label}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-on-surface-variant font-medium">{k.label}</p>
                  <Badge label={k.change} variant={k.variant} />
                </div>
                <p className="text-2xl font-bold text-primary">{k.value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Policy trends */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-2">Policy Volume (30 days)</h3>
            <p className="text-xs text-on-surface-variant mb-6">Policies by status in the last 30 days</p>
            {policyTrends.length > 0 ? (
              <div className="space-y-3">
                {policyTrends.map((t: any) => (
                  <div key={t.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-on-surface-variant">{t.status}</span>
                      <span className="font-bold text-primary">{t._count?.id ?? t.count ?? 0}</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-2 h-36">
                {[62, 78, 71, 85, 92, 88, 105, 98, 112, 108, 124, 118].map((v, i) => (
                  <div key={i} className="flex-1">
                    <div className={`rounded-t-sm ${i === 11 ? 'bg-primary' : 'bg-primary-fixed/50'}`}
                      style={{ height: `${(v / 124) * 100}%` }} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Claims by status */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Claims Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Approved / Paid', pct: 60, color: 'bg-secondary',   value: Math.round((overview?.totalClaims ?? 312) * 0.6) },
                { label: 'Under Review',    pct: 20, color: 'bg-blue-400',    value: Math.round((overview?.totalClaims ?? 312) * 0.2) },
                { label: 'Submitted',       pct: 12, color: 'bg-amber-400',   value: Math.round((overview?.totalClaims ?? 312) * 0.12) },
                { label: 'Rejected',        pct: 8,  color: 'bg-error',       value: Math.round((overview?.totalClaims ?? 312) * 0.08) },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-on-surface-variant font-medium">{item.label}</span>
                    <span className="font-bold text-primary">{item.value}</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
