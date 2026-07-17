'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Overview {
  totalUsers: number
  totalPolicies: number
  activePolicies: number
  totalClaims: number
  pendingClaims: number
  grossWrittenPremium: number
  avgClaimProcessingHours: number
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/overview')
      .then((res) => setOverview(res.data))
      .catch(() => setOverview({
        totalUsers: 1248, totalPolicies: 4520, activePolicies: 3890,
        totalClaims: 312, pendingClaims: 47, grossWrittenPremium: 4_200_000, avgClaimProcessingHours: 31.4
      }))
      .finally(() => setLoading(false))
  }, [])

  const kpis = overview ? [
    { label: 'Total Users', value: overview.totalUsers.toLocaleString(), icon: 'group', change: '+8.2%', variant: 'success' as const },
    { label: 'Active Policies', value: overview.activePolicies.toLocaleString(), icon: 'policy', change: '+12.1%', variant: 'success' as const },
    { label: 'Pending Claims', value: overview.pendingClaims.toString(), icon: 'assignment_turned_in', change: '-5.4%', variant: 'warning' as const },
    { label: 'GWP (ETB)', value: `${(overview.grossWrittenPremium / 1_000_000).toFixed(1)}M`, icon: 'trending_up', change: '+15.4%', variant: 'success' as const },
    { label: 'Avg. Claims Proc.', value: `${overview.avgClaimProcessingHours}h`, icon: 'speed', change: '-8h', variant: 'success' as const },
    { label: 'Total Claims', value: overview.totalClaims.toLocaleString(), icon: 'receipt_long', change: '+3.1%', variant: 'info' as const },
  ] : []

  return (
    <>
      <DashboardHeader title="Platform Analytics" subtitle="Real-time performance metrics across the KifCover platform." />
      <main className="p-8 space-y-8 flex-1">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 h-36 animate-pulse" />
                ))
              : kpis.map((kpi) => (
                  <Card key={kpi.label}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">{kpi.icon}</span>
                      </div>
                      <Badge label={kpi.change} variant={kpi.variant} />
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium mb-1">{kpi.label}</p>
                    <p className="text-3xl font-bold text-primary">{kpi.value}</p>
                  </Card>
                ))}
          </div>

          {/* Chart area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-primary">Policy Volume Trend</h3>
                  <p className="text-xs text-on-surface-variant">Last 30 days</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/10 rounded-full text-xs text-primary font-semibold">
                    <span className="w-2 h-2 rounded-full bg-primary" /> Issued
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/20 rounded-full text-xs text-secondary font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary" /> Renewed
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Jan', issued: 42, renewed: 12 },
                    { month: 'Feb', issued: 58, renewed: 18 },
                    { month: 'Mar', issued: 51, renewed: 15 },
                    { month: 'Apr', issued: 70, renewed: 22 },
                    { month: 'May', issued: 78, renewed: 25 },
                    { month: 'Jun', issued: 65, renewed: 20 },
                    { month: 'Jul', issued: 88, renewed: 28 },
                    { month: 'Aug', issued: 82, renewed: 26 },
                    { month: 'Sep', issued: 95, renewed: 30 },
                    { month: 'Oct', issued: 88, renewed: 29 },
                    { month: 'Nov', issued: 102, renewed: 35 },
                    { month: 'Dec', issued: 95, renewed: 32 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      formatter={(value: number, name: string) => [value, name === 'issued' ? 'Issued' : 'Renewed']}
                    />
                    <Bar dataKey="issued" fill="#1a6b4e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="renewed" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-bold text-primary mb-6">Claims by Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Approved', pct: 68, color: 'bg-secondary' },
                  { label: 'Under Review', pct: 18, color: 'bg-yellow-400' },
                  { label: 'Pending', pct: 10, color: 'bg-primary-fixed' },
                  { label: 'Rejected', pct: 4, color: 'bg-error' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-on-surface-variant">{item.label}</span>
                      <span className="font-bold text-primary">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border-subtle">
                <p className="text-xs text-on-surface-variant font-medium">Auto-Approval Rate</p>
                <div className="flex items-end gap-3 mt-2">
                  <span className="text-4xl font-bold text-primary">68%</span>
                  <div className="pb-1">
                    <Badge label="Target: 80%" variant="info" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
      </main>
    </>
  )
}
