'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface Payment {
  id: string; policyId?: string; amount: number; currency: string
  status: string; provider: string; providerRef?: string; createdAt: string
}

const statusVariant: Record<string, any> = {
  COMPLETED: 'success', PENDING: 'warning', FAILED: 'error', REFUNDED: 'neutral',
}
const providerIcon: Record<string, string> = {
  TELEBIRR: 'phone_android', BANK: 'account_balance', CARD: 'credit_card',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/my')
      .then((res) => setPayments(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <DashboardHeader title="Payments" subtitle="Your premium payment history and upcoming payments." />
      <main className="p-8 flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total Paid',       value: `ETB ${total.toLocaleString()}`,           icon: 'payments',       color: 'text-secondary' },
            { label: 'Transactions',     value: payments.filter(p => p.status === 'COMPLETED').length.toString(), icon: 'receipt_long',   color: 'text-primary' },
            { label: 'Pending',          value: payments.filter(p => p.status === 'PENDING').length.toString(),   icon: 'pending',        color: 'text-amber-600' },
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

        <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="font-display font-bold text-primary">Transaction History</h3>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl animate-pulse" />)}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">receipt_long</span>
              <p className="text-on-surface-variant">No payments yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {['Date', 'Method', 'Policy', 'Amount', 'Status', 'Ref'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{providerIcon[p.provider] ?? 'payments'}</span>
                        <span className="text-on-surface">{p.provider}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{p.policyId?.slice(0,8) ?? '—'}…</td>
                    <td className="px-6 py-4 font-bold text-primary">ETB {p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4"><Badge label={p.status} variant={statusVariant[p.status] ?? 'neutral'} dot /></td>
                    <td className="px-6 py-4 font-mono text-xs text-outline">{p.providerRef ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}
