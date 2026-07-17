'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalPolicies: number
  activePolicies: number
  totalRevenue: number
  monthlyRevenue: number
  commissionEarned: number
  recentPolicies: any[]
}

export default function PartnerDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Partners can see their own stats via /partners/:id/stats
    // partnerId stored in user.partnerId or derived from token
    const loadStats = async () => {
      try {
        // Try to find this partner's profile first
        const profileRes = await api.get('/users/me')
        const partnerId = (profileRes.data as any)?.partnerId
        if (partnerId) {
          const res = await api.get(`/partner/${partnerId}/stats`)
          setStats(res.data)
        }
      } catch {
        // fallback mock
        setStats({
          totalPolicies: 142, activePolicies: 118, totalRevenue: 284600,
          monthlyRevenue: 42300, commissionEarned: 42690, recentPolicies: [],
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const kpis = stats ? [
    { icon: 'policy',    label: 'Total Policies',   value: stats.totalPolicies.toLocaleString(),                  color: 'text-primary',   bg: 'bg-primary-container/10' },
    { icon: 'verified',  label: 'Active Policies',  value: stats.activePolicies.toLocaleString(),                 color: 'text-secondary', bg: 'bg-secondary-container/20' },
    { icon: 'payments',  label: 'Total Revenue',    value: `ETB ${stats.totalRevenue.toLocaleString()}`,          color: 'text-primary',   bg: 'bg-surface-container-high' },
    { icon: 'savings',   label: 'Commission Earned',value: `ETB ${stats.commissionEarned.toLocaleString()}`,      color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : []

  return (
    <>
      <DashboardHeader
        title={`Partner Dashboard`}
        subtitle={`Welcome back, ${user?.firstName}. Here's your distribution performance.`}
      />
      <main className="p-8 space-y-8 flex-1">
        {/* KPI cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((k) => (
              <Card key={k.label}>
                <div className={`w-12 h-12 ${k.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium mb-1">{k.label}</p>
                <p className="text-2xl font-bold text-primary">{k.value}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly revenue bar */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-2">Monthly Revenue</h3>
            <p className="text-xs text-on-surface-variant mb-6">Policy premiums distributed this month</p>
            {stats && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Jan', revenue: 38000 }, { month: 'Feb', revenue: 45000 },
                    { month: 'Mar', revenue: 42000 }, { month: 'Apr', revenue: 55000 },
                    { month: 'May', revenue: 60000 }, { month: 'Jun', revenue: 58000 },
                    { month: 'Jul', revenue: stats.monthlyRevenue },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      formatter={(value: number) => [`ETB ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: 'policy',       label: 'View All Policies',    href: '/partner/policies',    color: 'bg-primary/5 hover:bg-primary/10' },
                { icon: 'payments',     label: 'View Payouts',         href: '/partner/payouts',     color: 'bg-amber-50 hover:bg-amber-100' },
                { icon: 'api',          label: 'API Credentials',      href: '/partner/api-access',  color: 'bg-violet-50 hover:bg-violet-100' },
                { icon: 'settings',     label: 'Partner Settings',     href: '/partner/settings',    color: 'bg-surface-container hover:bg-surface-container-high' },
              ].map((a) => (
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
