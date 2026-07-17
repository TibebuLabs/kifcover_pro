'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api, partnerApi } from '@/lib/api'

const statusVariant: Record<string, 'success'|'warning'|'neutral'|'error'> = {
  COMPLETED: 'success', PENDING: 'warning', PROCESSING: 'info' as any, FAILED: 'error',
}

export default function PartnerPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/users/me').then(r => {
      const pid = (r.data as any)?.partnerId
      if (!pid) { setLoading(false); return }
      setPartnerId(pid)
      return partnerApi.payouts(pid)
    }).then(r => {
      if (r?.data) setPayouts(Array.isArray(r.data) ? r.data : r.data.payouts ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalEarned = payouts.filter((p: any) => p.status === 'COMPLETED').reduce((s: number, p: any) => s + (p.amount ?? 0), 0)
  const pending = payouts.filter((p: any) => p.status === 'PENDING').reduce((s: number, p: any) => s + (p.amount ?? 0), 0)

  return (
    <>
      <DashboardHeader title="Payouts" subtitle="Your commission earnings and payout history." />
      <main className="p-8 space-y-6 flex-1">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Total Earned',   value: `ETB ${totalEarned.toLocaleString()}`, icon: 'account_balance_wallet', color: 'text-secondary' },
            { label: 'Pending Payout', value: `ETB ${pending.toLocaleString()}`,     icon: 'pending',               color: 'text-amber-600' },
            { label: 'Commission Rate',value: '15%',                                  icon: 'percent',               color: 'text-primary' },
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

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">Payout History</h3>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-surface-container-low rounded-xl h-16 animate-pulse" />)}</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">account_balance_wallet</span>
              <p className="text-on-surface-variant text-sm">No payouts yet. Commissions will appear here once policies are sold.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-on-surface-variant border-b border-border-subtle">
                    {['Period', 'Amount', 'Currency', 'Status', 'Paid At'].map(h => (
                      <th key={h} className="pb-3 pr-6 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 pr-6 font-semibold text-primary">{p.period ?? new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</td>
                      <td className="py-4 pr-6 font-bold text-on-surface">ETB {(p.amount ?? 0).toLocaleString()}</td>
                      <td className="py-4 pr-6 text-on-surface-variant">{p.currency ?? 'ETB'}</td>
                      <td className="py-4 pr-6"><Badge label={p.status} variant={statusVariant[p.status] ?? 'neutral'} dot /></td>
                      <td className="py-4 text-on-surface-variant">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  )
}
