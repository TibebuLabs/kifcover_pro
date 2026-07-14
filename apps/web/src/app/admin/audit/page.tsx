'use client'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface AuditLog {
  id: string; userId?: string; userEmail?: string; userRole?: string
  service: string; action: string; resource: string; resourceId?: string
  ipAddress?: string; metadata?: any; createdAt: string
}

const actionColor = (action: string): any => {
  if (action.includes('CREATE') || action.includes('ISSUE') || action.includes('SUBMIT')) return 'info'
  if (action.includes('VERIFY') || action.includes('CONFIRM') || action.includes('APPROVE')) return 'success'
  if (action.includes('DELETE') || action.includes('REJECT') || action.includes('CANCEL')) return 'error'
  if (action.includes('UPDATE') || action.includes('CHANGE')) return 'warning'
  return 'neutral'
}

const SERVICES = ['', 'gateway', 'svc-auth', 'svc-customer', 'svc-insurer', 'svc-partner', 'svc-admin']

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [service, setService] = useState('')
  const limit = 50

  const load = () => {
    setLoading(true)
    api.get('/admin/audit-logs', { params: { page, limit, ...(service ? { service } : {}), ...(search ? { action: search } : {}) } })
      .then(r => { setLogs(r.data.data ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => {
        // Fallback mock data for dev
        setLogs([
          { id: '1', userEmail: 'admin@kifcover.et', service: 'gateway',       action: 'USER_ROLE_CHANGED',   resource: 'User',    createdAt: new Date().toISOString() },
          { id: '2', userEmail: 'demo@kifcover.et',  service: 'svc-customer',  action: 'POLICY_ISSUED',       resource: 'Policy',  resourceId: 'pol-001', ipAddress: '10.0.0.45', createdAt: new Date(Date.now()-60000).toISOString() },
          { id: '3', userEmail: 'admin@kifcover.et', service: 'svc-customer',  action: 'KYC_VERIFIED',        resource: 'User',    createdAt: new Date(Date.now()-120000).toISOString() },
          { id: '4', userEmail: 'system',            service: 'svc-customer',  action: 'PAYMENT_CONFIRMED',   resource: 'Payment', createdAt: new Date(Date.now()-180000).toISOString() },
          { id: '5', userEmail: 'demo@kifcover.et',  service: 'svc-customer',  action: 'CLAIM_SUBMITTED',     resource: 'Claim',   createdAt: new Date(Date.now()-240000).toISOString() },
        ])
        setTotal(5)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, service, search])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="Audit Logs" subtitle={`${total.toLocaleString()} immutable platform events recorded`} />
        <main className="p-8 space-y-6 flex-1">
          <Card>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex-1 min-w-48 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by action…"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none" />
              </div>
              <select value={service} onChange={e => { setService(e.target.value); setPage(1) }}
                className="px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none">
                {SERVICES.map(s => <option key={s} value={s}>{s || 'All Services'}</option>)}
              </select>
              <span className="text-xs text-on-surface-variant">{total.toLocaleString()} events</span>
            </div>

            {loading ? (
              <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-surface-container rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-on-surface-variant border-b border-border-subtle">
                      {['Timestamp', 'Action', 'Service', 'User', 'Resource', 'IP'].map(h => (
                        <th key={h} className="pb-3 pr-4 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 pr-4 text-outline whitespace-nowrap text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 pr-4"><Badge label={log.action} variant={actionColor(log.action)} /></td>
                        <td className="py-3 pr-4"><span className="text-xs bg-surface-container px-2 py-1 rounded font-mono">{log.service}</span></td>
                        <td className="py-3 pr-4 text-on-surface font-medium text-xs">{log.userEmail ?? log.userId?.slice(0,8) ?? 'system'}</td>
                        <td className="py-3 pr-4 text-on-surface-variant text-xs">{log.resource}{log.resourceId ? ` #${log.resourceId.slice(0,8)}` : ''}</td>
                        <td className="py-3 text-outline font-mono text-xs">{log.ipAddress ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <p className="text-center py-12 text-on-surface-variant">No logs found.</p>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-subtle">
                <p className="text-xs text-on-surface-variant">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="px-4 py-2 text-xs border border-border-subtle rounded-xl disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
