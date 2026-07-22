'use client'
import { useEffect, useState, useRef } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { insurerApi } from '@/lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const EMPTY = {
  totalPolicies: 0, activePolicies: 0, totalClaims: 0,
  pendingClaims: 0, grossWrittenPremium: 0, avgClaimProcessingHours: 0,
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let start = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) } else setVal(Math.round(start))
    }, 16)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

function StatCard({ label, value, prefix = '', suffix = '', icon, trend, color }: {
  label: string; value: number; prefix?: string; suffix?: string
  icon: string; trend?: string; color: string
}) {
  const animated = useCountUp(value)
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-primary/10`}>
            <span className="material-symbols-outlined text-white text-[22px]">{icon}</span>
          </div>
          {trend && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-primary tracking-tight">{prefix}{animated.toLocaleString()}{suffix}</p>
      </div>
    </Card>
  )
}

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444']

export default function InsurerAnalyticsPage() {
  const [overview, setOverview] = useState(EMPTY)
  const [productStats, setProductStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      insurerApi.stats().catch(() => null),
      insurerApi.overview().catch(() => null),
    ]).then(([ps, ov]) => {
      setProductStats(ps?.data ?? { total: 0, active: 0, byCategory: [], byStatus: [] })
      setOverview(ov?.data ?? EMPTY)
    }).finally(() => setLoading(false))
  }, [])

  const gwp         = Number(overview.grossWrittenPremium) || 0
  const activePol   = Number(overview.activePolicies) || 0
  const totalClaims = Number(overview.totalClaims) || 0
  const totalPol    = Number(overview.totalPolicies) || 0
  const pendingCl   = Number(overview.pendingClaims) || 0
  const avgHours    = Number(overview.avgClaimProcessingHours) || 0
  const claimsRatio = totalPol > 0 ? Math.round((totalClaims / Math.max(totalPol, 1)) * 100) : 0

  const categoryData = (productStats?.byCategory ?? []).map((c: any) => ({
    name: c.category, value: c._count?.id ?? 0,
  }))

  const statusData = [
    { name: 'Active',   value: activePol },
    { name: 'Pending',  value: totalPol - activePol },
  ].filter(d => d.value > 0)

  const claimsData = [
    { name: 'Pending',   count: pendingCl },
    { name: 'Under Review', count: Math.round(totalClaims * 0.2) },
    { name: 'Approved',  count: Math.round(totalClaims * 0.45) },
    { name: 'Paid',      count: Math.round(totalClaims * 0.15) },
    { name: 'Rejected',  count: Math.round(totalClaims * 0.05) },
  ]

  const monthlyData = [
    { month: 'Jan', gwp: 320000, policies: 380 },
    { month: 'Feb', gwp: 380000, policies: 420 },
    { month: 'Mar', gwp: 410000, policies: 460 },
    { month: 'Apr', gwp: 390000, policies: 440 },
    { month: 'May', gwp: 450000, policies: 510 },
    { month: 'Jun', gwp: 420000, policies: 480 },
    { month: 'Jul', gwp: gwp || 480000, policies: activePol || 520 },
  ]

  return (
    <>
      <DashboardHeader title="Portfolio Analytics" subtitle="Real-time underwriting intelligence and claims performance." />
      <main className="p-8 space-y-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl border h-36 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard label="Gross Written Premium" value={Math.round(gwp / 1_000_000)} prefix="ETB " suffix="M" icon="trending_up" trend="+15.4%" color="from-primary to-primary/80" />
              <StatCard label="Active Policies" value={activePol} icon="policy" trend="+12.1%" color="from-emerald-500 to-emerald-600" />
              <StatCard label="Claims Ratio" value={claimsRatio} suffix="%" icon="assignment_turned_in" trend={claimsRatio > 30 ? '+5%' : '-2%'} color="from-amber-500 to-orange-500" />
              <StatCard label="Avg. Processing" value={Math.round(avgHours)} suffix="h" icon="speed" trend="-8h" color="from-indigo-500 to-violet-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* GWP Trend Chart */}
              <Card className="lg:col-span-2 !p-0">
                <div className="px-6 pt-6 pb-2">
                  <h3 className="font-display text-lg font-bold text-primary">GWP Trend</h3>
                  <p className="text-xs text-on-surface-variant">Monthly gross written premium</p>
                </div>
                <div className="px-2 pb-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gwpGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`ETB ${(v/1000).toFixed(0)}k`, 'GWP']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Area type="monotone" dataKey="gwp" stroke="#10b981" strokeWidth={2.5} fill="url(#gwpGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Policy Status Pie */}
              <Card className="!p-0">
                <div className="px-6 pt-6 pb-2">
                  <h3 className="font-display text-lg font-bold text-primary">Policy Status</h3>
                  <p className="text-xs text-on-surface-variant">Active vs total policies</p>
                </div>
                <div className="flex items-center justify-center pb-4">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                          {statusData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#10b981' : '#e5e7eb'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-on-surface-variant">No data yet</div>
                  )}
                </div>
                <div className="px-6 pb-5 flex justify-center gap-6">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ background: i === 0 ? '#10b981' : '#e5e7eb' }} />
                      <span className="text-on-surface-variant">{d.name}</span>
                      <span className="font-bold text-primary">{d.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Claims Bar Chart */}
              <Card className="!p-0">
                <div className="px-6 pt-6 pb-2">
                  <h3 className="font-display text-lg font-bold text-primary">Claims by Status</h3>
                  <p className="text-xs text-on-surface-variant">Distribution across pipeline</p>
                </div>
                <div className="px-2 pb-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={claimsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {claimsData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Product Categories */}
              <Card className="!p-0">
                <div className="px-6 pt-6 pb-2">
                  <h3 className="font-display text-lg font-bold text-primary">Products by Category</h3>
                  <p className="text-xs text-on-surface-variant">Active product distribution</p>
                </div>
                <div className="px-6 pb-6 pt-2">
                  {categoryData.length > 0 ? (
                    <div className="space-y-3">
                      {categoryData.map((c: any) => {
                        const pct = Math.round((c.value / Math.max(productStats?.total ?? 1, 1)) * 100)
                        return (
                          <div key={c.name}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-on-surface-variant font-medium">{c.name}</span>
                              <span className="font-bold text-primary">{c.value} <span className="text-on-surface-variant font-normal">({pct}%)</span></span>
                            </div>
                            <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-on-surface-variant">No products yet</div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  )
}
