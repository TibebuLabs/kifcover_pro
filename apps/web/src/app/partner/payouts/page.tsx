'use client'
import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// Static until payout API endpoint is added; structure mirrors Payout model
const mockPayouts = [
  { id: '1', period: '2026-06', amount: 38400, currency: 'ETB', status: 'COMPLETED', paidAt: '2026-07-01' },
  { id: '2', period: '2026-05', amount: 41200, currency: 'ETB', status: 'COMPLETED', paidAt: '2026-06-02' },
  { id: '3', period: '2026-04', amount: 35800, currency: 'ETB', status: 'COMPLETED', paidAt: '2026-05-01' },
  { id: '4', period: '2026-07', amount: 42300, currency: 'ETB', status: 'PENDING',   paidAt: null },
]

const statusVariant: Record<string, 'success'|'warning'|'neutral'|'error'> = {
  COMPLETED: 'success', PENDING: 'warning', PROCESSING: 'info' as any, FAILED: 'error',
}

export default function PartnerPayoutsPage() {
  const totalEarned = mockPayouts.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)
  const pending     = mockPayouts.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0)

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
                {mockPayouts.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 pr-6 font-semibold text-primary">{p.period}</td>
                    <td className="py-4 pr-6 font-bold text-on-surface">ETB {p.amount.toLocaleString()}</td>
                    <td className="py-4 pr-6 text-on-surface-variant">{p.currency}</td>
                    <td className="py-4 pr-6"><Badge label={p.status} variant={statusVariant[p.status]} dot /></td>
                    <td className="py-4 text-on-surface-variant">{p.paidAt ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  )
}
