'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'

const claimStatusVariant: Record<string, any> = {
  SUBMITTED: 'info', UNDER_REVIEW: 'warning', APPROVED: 'success', REJECTED: 'error', PAID: 'success',
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ activePolicies: 0, openClaims: 0, totalPremiums: 0, coverageValue: 0 })
  const [policies, setPolicies] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/policies/my').catch(() => ({ data: [] })),
      api.get('/claims/my').catch(() => ({ data: [] })),
    ]).then(([pRes, cRes]) => {
      const p = pRes.data as any[]
      const c = cRes.data as any[]
      setPolicies(p)
      setClaims(c)
      setStats({
        activePolicies: p.filter(x => x.status === 'ACTIVE').length,
        openClaims: c.filter(x => ['SUBMITTED', 'UNDER_REVIEW'].includes(x.status)).length,
        totalPremiums: p.reduce((s: number, x: any) => s + (x.premium ?? 0), 0),
        coverageValue: p.filter(x => x.status === 'ACTIVE').reduce((s: number, x: any) => s + (x.coverageAmount ?? 0), 0),
      })
    }).finally(() => setLoading(false))
  }, [])

  const kpis = [
    { icon: 'policy',  label: 'Active Policies', value: stats.activePolicies.toString(),                                                    color: 'text-primary',   bg: 'bg-primary-container/10' },
    { icon: 'assignment_turned_in', label: 'Open Claims', value: stats.openClaims.toString(),                                               color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: 'payment', label: 'Total Premiums', value: stats.totalPremiums > 0 ? `ETB ${stats.totalPremiums.toLocaleString()}` : '—',       color: 'text-primary',   bg: 'bg-surface-container-high' },
    { icon: 'shield',  label: 'Coverage Value', value: stats.coverageValue > 0 ? `ETB ${(stats.coverageValue/1000).toFixed(0)}K` : '—',    color: 'text-secondary', bg: 'bg-secondary-container/20' },
  ]

  // Build activity feed from policies + claims
  const activity = [
    ...policies.slice(0, 3).map(p => ({
      icon: 'policy', color: 'bg-primary/10 text-primary',
      title: `Policy issued — ${p.productName ?? 'Insurance Policy'}`,
      meta: `ETB ${(p.premium ?? 0).toLocaleString()} · ${new Date(p.createdAt).toLocaleDateString()}`,
      id: p.id,
    })),
    ...claims.slice(0, 3).map(c => ({
      icon: 'assignment_turned_in', color: 'bg-amber-50 text-amber-600',
      title: `Claim ${c.status.toLowerCase().replace('_', ' ')} — ${c.claimNumber?.slice(0, 8)}…`,
      meta: `ETB ${(c.claimAmount ?? 0).toLocaleString()} · ${new Date(c.createdAt).toLocaleDateString()}`,
      id: c.id,
    })),
  ].sort((a, b) => 0).slice(0, 5)

  return (
    <>
      <DashboardHeader
        title={`Good morning, ${user?.firstName || 'there'} 👋`}
        subtitle="Here's your insurance summary for today."
      />
      <main className="p-8 space-y-8 flex-1">
        {/* KYC banner */}
        {user?.kycStatus !== 'VERIFIED' && (
          <div className="flex items-center justify-between bg-primary-fixed/20 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">person_check</span>
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">Complete your identity verification</p>
                <p className="text-xs text-on-surface-variant">KYC is required to purchase policies and file claims.</p>
              </div>
            </div>
            <Link href="/kyc" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors whitespace-nowrap ml-4">
              Verify Now →
            </Link>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-28 animate-pulse" />)
            : kpis.map(k => (
              <Card key={k.label}>
                <div className={`w-11 h-11 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium mb-0.5">{k.label}</p>
                <p className="text-2xl font-bold text-primary">{k.value}</p>
              </Card>
            ))
          }
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: 'storefront',          label: 'Buy Insurance',   href: '/marketplace',           color: 'bg-primary text-on-primary' },
              { icon: 'assignment_turned_in',label: 'File a Claim',    href: '/dashboard/claims/new',  color: 'bg-secondary text-on-secondary' },
              { icon: 'policy',              label: 'My Policies',     href: '/dashboard/policies',    color: 'bg-surface-container-high text-primary' },
              { icon: 'payments',            label: 'Payments',        href: '/dashboard/payments',    color: 'bg-primary-fixed/30 text-primary' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className={`${a.color} flex flex-col items-center justify-center gap-3 p-6 rounded-2xl font-semibold text-sm hover:opacity-90 hover:-translate-y-1 transition-all border border-border-subtle`}>
                <span className="material-symbols-outlined text-3xl">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active policies */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-primary">Active Policies</h3>
              <Link href="/dashboard/policies" className="text-xs text-primary font-semibold hover:underline">View all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-20 animate-pulse" />)}</div>
            ) : policies.filter(p => p.status === 'ACTIVE').length === 0 ? (
              <Card>
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">policy</span>
                  <p className="text-sm text-on-surface-variant mb-4">No active policies yet.</p>
                  <Link href="/marketplace" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold">Get Covered →</Link>
                </div>
              </Card>
            ) : (
              policies.filter(p => p.status === 'ACTIVE').slice(0, 3).map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-border-subtle p-5 shadow-card flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary text-sm truncate">{p.productName ?? 'Policy'}</p>
                    <p className="text-xs text-on-surface-variant">Expires {new Date(p.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">ETB {(p.premium ?? 0).toLocaleString()}</p>
                    <Badge label="ACTIVE" variant="success" dot />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Activity feed */}
          <div>
            <h3 className="font-display text-lg font-bold text-primary mb-4">Recent Activity</h3>
            <Card>
              {activity.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">history</span>
                  <p className="text-sm text-on-surface-variant">No activity yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${a.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-on-surface leading-snug">{a.title}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{a.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Open claims */}
        {claims.filter(c => ['SUBMITTED','UNDER_REVIEW'].includes(c.status)).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-primary">Open Claims</h3>
              <Link href="/dashboard/claims" className="text-xs text-primary font-semibold hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {claims.filter(c => ['SUBMITTED','UNDER_REVIEW'].includes(c.status)).slice(0, 2).map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-border-subtle p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">assignment_turned_in</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{c.claimNumber?.slice(0,8)}…</p>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{c.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge label={c.status} variant={claimStatusVariant[c.status]} dot />
                    <p className="text-xs text-on-surface-variant mt-1">ETB {(c.claimAmount ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
