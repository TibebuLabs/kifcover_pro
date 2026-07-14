'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'

interface Overview {
  totalUsers: number; totalPolicies: number; activePolicies: number
  totalClaims: number; pendingClaims: number; grossWrittenPremium: number
  avgClaimProcessingHours: number
}

export default function InsurerDashboardPage() {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [productStats, setProductStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/overview').catch(() => null),
      api.get('/insurer/stats').catch(() => null),
    ]).then(([ov, ps]) => {
      setOverview(ov?.data ?? {
        totalPolicies: 4520, activePolicies: 3890, totalClaims: 312,
        pendingClaims: 47, grossWrittenPremium: 4_200_000, avgClaimProcessingHours: 31.4, totalUsers: 1248,
      })
      setProductStats(ps?.data ?? { total: 6, active: 6, byCategory: [] })
    }).finally(() => setLoading(false))
  }, [])

  const claimsRatio = overview
    ? Math.round((overview.totalClaims / Math.max(overview.totalPolicies, 1)) * 100)
    : 0

  const kpis = overview ? [
    { icon: 'inventory_2',       label: 'Active Products',   value: (productStats?.active ?? '—').toString(),               color: 'text-violet-600',  bg: 'bg-violet-50' },
    { icon: 'policy',            label: 'Active Policies',   value: overview.activePolicies.toLocaleString(),               color: 'text-primary',     bg: 'bg-primary-container/10' },
    { icon: 'assignment_turned_in',label:'Pending Claims',   value: overview.pendingClaims.toString(),                      color: 'text-amber-600',   bg: 'bg-amber-50' },
    { icon: 'trending_up',       label: 'GWP (ETB)',         value: `${(overview.grossWrittenPremium / 1_000_000).toFixed(1)}M`, color: 'text-secondary', bg: 'bg-secondary-container/20' },
    { icon: 'speed',             label: 'Avg Claims Process',value: `${overview.avgClaimProcessingHours}h`,                 color: 'text-primary',     bg: 'bg-surface-container-high' },
    { icon: 'receipt_long',      label: 'Claims Ratio',      value: `${claimsRatio}%`,                                      color: 'text-red-600',     bg: 'bg-red-50' },
  ] : []

  return (
    <>
      <DashboardHeader
        title={`Insurer Overview`}
        subtitle={`Welcome, ${user?.firstName}. Monitor your portfolio performance.`}
      />
      <main className="p-8 space-y-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-28 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map(k => (
              <Card key={k.label} className="!p-4">
                <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined text-[20px] ${k.color}`}>{k.icon}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-medium mb-1 leading-tight">{k.label}</p>
                <p className="text-xl font-bold text-primary">{k.value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Claims by status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-primary">Claims by Status</h3>
              <Link href="/insurer/claims" className="text-xs text-primary font-semibold hover:underline">View all →</Link>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Pending Review', pct: 15, color: 'bg-amber-400',  count: overview?.pendingClaims ?? 0 },
                { label: 'Under Review',   pct: 20, color: 'bg-blue-400',   count: Math.round((overview?.totalClaims ?? 0) * 0.2) },
                { label: 'Approved',       pct: 45, color: 'bg-secondary',  count: Math.round((overview?.totalClaims ?? 0) * 0.45) },
                { label: 'Paid',           pct: 15, color: 'bg-primary',    count: Math.round((overview?.totalClaims ?? 0) * 0.15) },
                { label: 'Rejected',       pct: 5,  color: 'bg-error',      count: Math.round((overview?.totalClaims ?? 0) * 0.05) },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-on-surface-variant font-medium">{item.label}</span>
                    <span className="font-bold text-primary">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: 'add_box',            label: 'Create New Product',  href: '/insurer/products',   color: 'bg-violet-50 hover:bg-violet-100' },
                { icon: 'price_change',       label: 'Manage Pricing Rules',href: '/insurer/pricing',    color: 'bg-primary/5 hover:bg-primary/10' },
                { icon: 'assignment_turned_in',label:'Review Claims Queue', href: '/insurer/claims',     color: 'bg-amber-50 hover:bg-amber-100' },
                { icon: 'analytics',          label: 'Portfolio Analytics', href: '/insurer/analytics',  color: 'bg-secondary-container/20 hover:bg-secondary-container/30' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className={`flex items-center gap-3 p-4 ${a.color} rounded-xl transition-colors`}>
                  <span className="material-symbols-outlined text-primary text-[22px]">{a.icon}</span>
                  <span className="text-sm font-semibold text-on-surface">{a.label}</span>
                  <span className="material-symbols-outlined text-outline text-[18px] ml-auto">chevron_right</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
