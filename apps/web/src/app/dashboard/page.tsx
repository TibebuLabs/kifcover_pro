'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'

const quickActions = [
  { icon: 'search', label: 'Get a Quote', href: '/marketplace', color: 'bg-primary', text: 'text-on-primary' },
  { icon: 'assignment_turned_in', label: 'File a Claim', href: '/dashboard/claims/new', color: 'bg-secondary', text: 'text-on-secondary' },
  { icon: 'policy', label: 'My Policies', href: '/dashboard/policies', color: 'bg-surface-container-high', text: 'text-primary' },
  { icon: 'person', label: 'Complete KYC', href: '/kyc', color: 'bg-primary-fixed/30', text: 'text-primary' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ activePolicies: 0, openClaims: 0, totalPremiums: 0, coverageValue: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [policiesRes, claimsRes] = await Promise.all([
          api.get('/policies/my'),
          api.get('/claims/my'),
        ])
        const policies = policiesRes.data as any[]
        const claims = claimsRes.data as any[]
        setStats({
          activePolicies: policies.filter((p) => p.status === 'ACTIVE').length,
          openClaims: claims.filter((c) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status)).length,
          totalPremiums: policies.reduce((sum: number, p: any) => sum + p.premium, 0),
          coverageValue: policies.filter((p) => p.status === 'ACTIVE').reduce((sum: number, p: any) => sum + p.coverageAmount, 0),
        })
      } catch {
        // keep defaults
      }
    }
    loadStats()
  }, [])

  const kpis = [
    { icon: 'policy', label: 'Active Policies', value: stats.activePolicies.toString(), color: 'text-primary', bg: 'bg-primary-container/10' },
    { icon: 'assignment_turned_in', label: 'Open Claims', value: stats.openClaims.toString(), color: 'text-secondary', bg: 'bg-secondary-container/20' },
    { icon: 'payment', label: 'Total Premiums', value: stats.totalPremiums > 0 ? `ETB ${stats.totalPremiums.toLocaleString()}` : '—', color: 'text-primary', bg: 'bg-surface-container-high' },
    { icon: 'shield', label: 'Coverage Value', value: stats.coverageValue > 0 ? `ETB ${(stats.coverageValue / 1000).toFixed(0)}K` : '—', color: 'text-primary', bg: 'bg-tertiary-container/10' },
  ]

  return (
    <>
      <DashboardHeader
        title={`Good morning, ${user?.firstName || 'there'} 👋`}
        subtitle="Here's what's happening with your insurance today."
      />
      <main className="p-8 space-y-8 flex-1">
        {/* KYC Banner */}
        {user?.kycStatus !== 'VERIFIED' && (
          <div className="flex items-center justify-between bg-primary-fixed/20 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[20px]">person_check</span>
              </div>
              <div>
                <p className="font-semibold text-primary text-sm">Complete your identity verification</p>
                <p className="text-xs text-on-surface-variant">KYC verification is required to purchase policies and file claims.</p>
              </div>
            </div>
            <Link href="/kyc" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors whitespace-nowrap">
              Verify Now →
            </Link>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-primary">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} ${action.text} flex flex-col items-center justify-center gap-3 p-6 rounded-2xl font-semibold text-sm hover:opacity-90 hover:-translate-y-1 transition-all border border-border-subtle`}
              >
                <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Recent Activity</h3>
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">history</span>
              <p className="font-semibold text-on-surface-variant">No recent activity</p>
              <p className="text-sm text-outline mt-1">Your policies, claims, and payments will appear here.</p>
              <Link href="/marketplace" className="mt-6 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">
                Browse Insurance Products →
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
