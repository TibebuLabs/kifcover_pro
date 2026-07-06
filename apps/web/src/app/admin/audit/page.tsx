'use client'
import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const logs = [
  { id: 1, user: 'admin@kifcover.et', action: 'USER_UPDATED', resource: 'User', resourceId: 'usr_001', ip: '192.168.1.1', time: '2026-07-06 09:12' },
  { id: 2, user: 'admin@kifcover.et', action: 'PARTNER_CREATED', resource: 'Partner', resourceId: 'prt_002', ip: '192.168.1.1', time: '2026-07-06 09:08' },
  { id: 3, user: 'demo@kifcover.et', action: 'POLICY_ISSUED', resource: 'Policy', resourceId: 'pol_003', ip: '10.0.0.45', time: '2026-07-06 08:55' },
  { id: 4, user: 'demo@kifcover.et', action: 'CLAIM_SUBMITTED', resource: 'Claim', resourceId: 'clm_004', ip: '10.0.0.45', time: '2026-07-06 08:40' },
  { id: 5, user: 'admin@kifcover.et', action: 'KYC_VERIFIED', resource: 'User', resourceId: 'usr_005', ip: '192.168.1.1', time: '2026-07-06 08:22' },
  { id: 6, user: 'system', action: 'PAYMENT_CONFIRMED', resource: 'Payment', resourceId: 'pay_006', ip: 'internal', time: '2026-07-06 08:10' },
]

const actionColor = (action: string) => {
  if (action.includes('CREATED') || action.includes('ISSUED') || action.includes('SUBMITTED')) return 'info'
  if (action.includes('VERIFIED') || action.includes('CONFIRMED')) return 'success'
  if (action.includes('DELETED') || action.includes('REJECTED')) return 'error'
  return 'neutral'
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <DashboardHeader title="Audit Logs" subtitle="Full audit trail of all platform actions." />
      <main className="p-8 space-y-6 flex-1">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by action or user..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-on-surface-variant border-b border-border-subtle">
                  <th className="pb-3 pr-4 font-semibold">Action</th>
                  <th className="pb-3 pr-4 font-semibold">User</th>
                  <th className="pb-3 pr-4 font-semibold">Resource</th>
                  <th className="pb-3 pr-4 font-semibold">IP</th>
                  <th className="pb-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 pr-4">
                      <Badge label={log.action} variant={actionColor(log.action) as any} />
                    </td>
                    <td className="py-3 pr-4 text-on-surface font-medium">{log.user}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{log.resource} <span className="text-xs text-outline">#{log.resourceId}</span></td>
                    <td className="py-3 pr-4 text-outline font-mono text-xs">{log.ip}</td>
                    <td className="py-3 text-on-surface-variant">{log.time}</td>
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
