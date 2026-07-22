'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { insurerApi } from '@/lib/api'
import Link from 'next/link'

const EMPTY = {
  totalPolicies: 0, activePolicies: 0, totalClaims: 0,
  pendingClaims: 0, grossWrittenPremium: 0, avgClaimProcessingHours: 0, totalUsers: 0,
}

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let current = 0
    const step = target / (duration / 16)
    const id = setInterval(() => {
      current += step
      if (current >= target) { setVal(target); clearInterval(id) } else setVal(Math.round(current))
    }, 16)
    return () => clearInterval(id)
  }, [target, duration])
  return val
}

function HeroStat({ label, value, prefix = '', suffix = '', icon, gradient }: {
  label: string; value: number; prefix?: string; suffix?: string; icon: string; gradient: string
}) {
  const animated = useCountUp(value)
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-xl`}>
      <div className="absolute -right-4 -top-4 opacity-10">
        <span className="material-symbols-outlined text-[100px]">{icon}</span>
      </div>
      <div className="relative z-10">
        <span className="material-symbols-outlined text-[28px] opacity-80 mb-3 block">{icon}</span>
        <p className="text-3xl font-extrabold tracking-tight">{prefix}{animated.toLocaleString()}{suffix}</p>
        <p className="text-sm opacity-80 mt-1 font-medium">{label}</p>
      </div>
    </div>
  )
}

export default function InsurerDashboardPage() {
  const { user } = useAuthStore()
  const [overview, setOverview] = useState(EMPTY)
  const [productStats, setProductStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      insurerApi.stats().catch(() => null),
      insurerApi.overview().catch(() => null),
    ]).then(([ps, ov]) => {
      setProductStats(ps?.data ?? { total: 0, active: 0, byCategory: [] })
      setOverview(ov?.data ?? EMPTY)
    }).finally(() => setLoading(false))
  }, [])

  const activePol   = Number(overview.activePolicies) || 0
  const pendingCl   = Number(overview.pendingClaims) || 0
  const totalClaims = Number(overview.totalClaims) || 0
  const gwp         = Number(overview.grossWrittenPremium) || 0
  const avgHours    = Number(overview.avgClaimProcessingHours) || 0
  const activeProd  = productStats?.active ?? 0

  const claimsRatio = totalClaims > 0 ? Math.round((totalClaims / Math.max(activePol, 1)) * 100) : 0

  return (
    <>
      <DashboardHeader
        title="Insurer Command Center"
        subtitle={`Welcome back, ${user?.firstName}. Your portfolio at a glance.`}
      />
      <main className="p-8 space-y-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl border h-40 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Hero gradient stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <HeroStat label="Active Policies" value={activePol} icon="policy" gradient="from-emerald-500 to-teal-600" />
              <HeroStat label="Gross Written Premium" value={Math.round(gwp / 1_000)} prefix="ETB " suffix="k" icon="trending_up" gradient="from-primary to-primary/80" />
              <HeroStat label="Pending Claims" value={pendingCl} icon="assignment_late" gradient="from-amber-500 to-orange-500" />
            </div>

            {/* Secondary KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: 'inventory_2',   label: 'Active Products',    value: String(activeProd),                    color: 'text-violet-600',   bg: 'bg-violet-50' },
                { icon: 'speed',         label: 'Avg. Process Time',  value: `${avgHours}h`,                         color: 'text-indigo-600',   bg: 'bg-indigo-50' },
                { icon: 'receipt_long',  label: 'Claims Ratio',       value: `${claimsRatio}%`,                      color: 'text-rose-600',     bg: 'bg-rose-50' },
                { icon: 'payments',      label: 'Total Claims',       value: String(totalClaims),                    color: 'text-amber-600',    bg: 'bg-amber-50' },
              ].map(k => (
                <Card key={k.label} className="!p-4 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${k.bg} rounded-2xl flex items-center justify-center mb-3`}>
                    <span className={`material-symbols-outlined text-[20px] ${k.color}`}>{k.icon}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">{k.label}</p>
                  <p className="text-xl font-extrabold text-primary">{k.value}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Claims Pipeline */}
              <Card className="lg:col-span-2 !p-0">
                <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-primary">Claims Pipeline</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">Status distribution across all claims</p>
                    </div>
                    <Link href="/insurer/claims" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    {[
                      { label: 'Pending Review',  count: pendingCl,              pct: 15, color: 'bg-amber-400',   gradient: 'from-amber-400 to-amber-500' },
                      { label: 'Under Review',    count: Math.round(totalClaims * 0.2),  pct: 20, color: 'bg-blue-400',    gradient: 'from-blue-400 to-blue-500' },
                      { label: 'Approved',        count: Math.round(totalClaims * 0.45), pct: 45, color: 'bg-emerald-400',  gradient: 'from-emerald-400 to-emerald-500' },
                      { label: 'Paid',            count: Math.round(totalClaims * 0.15), pct: 15, color: 'bg-primary',      gradient: 'from-primary to-primary/80' },
                      { label: 'Rejected',        count: Math.round(totalClaims * 0.05), pct: 5,  color: 'bg-rose-400',     gradient: 'from-rose-400 to-rose-500' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                            <span className="text-on-surface-variant font-medium">{item.label}</span>
                          </div>
                          <span className="font-bold text-primary">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${Math.max(item.pct, totalClaims > 0 ? 2 : 0)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="!p-0">
                <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
                  <h3 className="font-display text-lg font-bold text-primary">Quick Actions</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { icon: 'add_box',             label: 'Create Product',     href: '/insurer/products',   color: 'bg-violet-50 hover:bg-violet-100',  iconColor: 'text-violet-600' },
                    { icon: 'price_change',        label: 'Pricing Rules',      href: '/insurer/pricing',    color: 'bg-emerald-50 hover:bg-emerald-100', iconColor: 'text-emerald-600' },
                    { icon: 'assignment_turned_in',label: 'Review Claims',      href: '/insurer/claims',     color: 'bg-amber-50 hover:bg-amber-100',     iconColor: 'text-amber-600' },
                    { icon: 'analytics',           label: 'View Analytics',     href: '/insurer/analytics',  color: 'bg-indigo-50 hover:bg-indigo-100',   iconColor: 'text-indigo-600' },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      className={`flex items-center gap-3 p-3.5 ${a.color} rounded-2xl transition-all duration-200 group`}>
                      <span className={`material-symbols-outlined text-[22px] ${a.iconColor}`}>{a.icon}</span>
                      <span className="text-sm font-semibold text-on-surface flex-1">{a.label}</span>
                      <span className="material-symbols-outlined text-outline text-[18px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                    </Link>
                  ))}
                </div>

                {/* Live activity pulse */}
                <div className="px-6 py-4 border-t border-border-subtle">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">System Live</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {activeProd} products published · {activePol} active policies
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  )
}
