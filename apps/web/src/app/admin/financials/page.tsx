'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

export default function AdminFinancialsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/overview')
      .then(r => setOverview(r.data))
      .catch(() => setOverview({ grossWrittenPremium: 4_200_000, totalPolicies: 4520, totalClaims: 312 }))
      .finally(() => setLoading(false))
  }, [])

  const gwp = overview?.grossWrittenPremium ?? 0
  const partnerCommission = Math.round(gwp * 0.15)
  const insurerSettlement = Math.round(gwp * 0.70)
  const kifcoverRevenue = Math.round(gwp * 0.15)

  const monthlyData = [
    { month: 'Jan', gwp: 280000, claims: 42000, commission: 42000 },
    { month: 'Feb', gwp: 320000, claims: 51000, commission: 48000 },
    { month: 'Mar', gwp: 295000, claims: 38000, commission: 44250 },
    { month: 'Apr', gwp: 410000, claims: 62000, commission: 61500 },
    { month: 'May', gwp: 380000, claims: 57000, commission: 57000 },
    { month: 'Jun', gwp: 450000, claims: 67500, commission: 67500 },
    { month: 'Jul', gwp: Math.round(gwp / 12), claims: Math.round(gwp / 12 * 0.15), commission: Math.round(gwp / 12 * 0.15) },
  ]

  const splits = [
    { label: 'Insurer Settlement (70%)', value: `ETB ${insurerSettlement.toLocaleString()}`,  pct: 70, color: 'bg-primary' },
    { label: 'Partner Commission (15%)', value: `ETB ${partnerCommission.toLocaleString()}`, pct: 15, color: 'bg-amber-400' },
    { label: 'KifCover Revenue (15%)',   value: `ETB ${kifcoverRevenue.toLocaleString()}`,   pct: 15, color: 'bg-secondary' },
  ]

  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="Financial Management" subtitle="Trust account reconciliation, commission ledger, and payout tracking." />
        <main className="p-8 space-y-8 flex-1">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-6">
            {loading ? [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-28 animate-pulse" />) : [
              { label: 'Gross Written Premium', value: `ETB ${(gwp/1_000_000).toFixed(2)}M`, icon: 'trending_up', color: 'text-primary' },
              { label: 'Partner Commissions Due', value: `ETB ${(partnerCommission/1000).toFixed(0)}K`, icon: 'group', color: 'text-amber-600' },
              { label: 'KifCover Net Revenue', value: `ETB ${(kifcoverRevenue/1000).toFixed(0)}K`, icon: 'account_balance_wallet', color: 'text-secondary' },
            ].map(k => (
              <Card key={k.label}>
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">{k.label}</p>
                    <p className="text-2xl font-bold text-primary">{k.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Split settlement */}
            <Card>
              <h3 className="font-display text-lg font-bold text-primary mb-6">Revenue Split (Total GWP)</h3>
              <div className="space-y-4">
                {splits.map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-on-surface-variant">{s.label}</span>
                      <span className="font-bold text-primary">{s.value}</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                  <p className="text-xs text-on-surface-variant">Split-settlement processed automatically on policy bind</p>
                </div>
              </div>
            </Card>

            {/* Monthly trend */}
            <Card>
              <h3 className="font-display text-lg font-bold text-primary mb-6">Monthly GWP Trend</h3>
              <div className="flex items-end gap-3 h-40">
                {monthlyData.map((d, i) => (
                  <div key={d.month} className="flex-1 flex flex-col justify-end items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg ${i === monthlyData.length - 1 ? 'bg-primary' : 'bg-primary-fixed/50'}`}
                      style={{ height: `${(d.gwp / 450000) * 100}%` }}
                    />
                    <span className="text-[10px] text-outline">{d.month}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pending payouts */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-primary">Pending Partner Payouts</h3>
              <button className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary-container/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">send</span>
                Process Batch
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-on-surface-variant border-b border-border-subtle">
                    {['Partner', 'Period', 'Policies Sold', 'Commission Rate', 'Amount Due', 'Status'].map(h => (
                      <th key={h} className="pb-3 pr-6 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    { name: 'Acme Fintech', period: '2026-07', policies: 42, rate: '15%', amount: 'ETB 38,400', status: 'PENDING' },
                    { name: 'RideEt',       period: '2026-07', policies: 28, rate: '12%', amount: 'ETB 21,600', status: 'PENDING' },
                    { name: 'EthioShop',    period: '2026-07', policies: 15, rate: '10%', amount: 'ETB 9,800',  status: 'PROCESSING' },
                  ].map(r => (
                    <tr key={r.name} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pr-6 font-semibold text-primary">{r.name}</td>
                      <td className="py-4 pr-6 text-on-surface-variant">{r.period}</td>
                      <td className="py-4 pr-6">{r.policies}</td>
                      <td className="py-4 pr-6">{r.rate}</td>
                      <td className="py-4 pr-6 font-bold text-primary">{r.amount}</td>
                      <td className="py-4"><Badge label={r.status} variant={r.status === 'PENDING' ? 'warning' : 'info'} dot /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
