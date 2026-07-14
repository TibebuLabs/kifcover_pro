'use client'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const SERVICES = [
  { name: 'svc-auth',     port: 3001, status: 'healthy', latency: '12ms', uptime: '99.98%' },
  { name: 'svc-customer', port: 3002, status: 'healthy', latency: '18ms', uptime: '99.97%' },
  { name: 'svc-insurer',  port: 3003, status: 'healthy', latency: '15ms', uptime: '99.97%' },
  { name: 'svc-partner',  port: 3004, status: 'healthy', latency: '11ms', uptime: '99.98%' },
  { name: 'svc-admin',    port: 3005, status: 'healthy', latency: '45ms', uptime: '99.90%' },
]

const TOP_ENDPOINTS = [
  { method: 'POST', path: '/api/v1/auth/login',      calls: 12480, p95: '89ms',  errors: 0 },
  { method: 'GET',  path: '/api/v1/products',        calls: 9820,  p95: '62ms',  errors: 0 },
  { method: 'POST', path: '/api/v1/quotes/generate', calls: 4210,  p95: '145ms', errors: 2 },
  { method: 'POST', path: '/api/v1/policies/issue',  calls: 2890,  p95: '312ms', errors: 5 },
  { method: 'POST', path: '/api/v1/claims',          calls: 1240,  p95: '201ms', errors: 1 },
  { method: 'GET',  path: '/api/v1/policies/my',     calls: 8920,  p95: '78ms',  errors: 0 },
]

const methodColor: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700', POST: 'bg-green-100 text-green-700',
  PATCH: 'bg-yellow-100 text-yellow-700', DELETE: 'bg-red-100 text-red-700',
}

export default function ApiMonitorPage() {
  return (
    <div className="flex min-h-screen bg-background-main">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <DashboardHeader title="API Monitor" subtitle="Real-time microservice health, latency, and API usage metrics." />
        <main className="p-8 space-y-8 flex-1">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-5">
            {[
              { label: 'Services Online', value: `${SERVICES.filter(s => s.status === 'healthy').length}/${SERVICES.length}`, icon: 'monitor_heart', color: 'text-secondary' },
              { label: 'Avg Latency',     value: '24ms',   icon: 'speed',         color: 'text-primary' },
              { label: 'API Calls Today', value: '48.2K',  icon: 'http',          color: 'text-primary' },
              { label: 'Error Rate',      value: '0.018%', icon: 'error_outline', color: 'text-amber-600' },
            ].map(k => (
              <Card key={k.label}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">{k.label}</p>
                    <p className="text-2xl font-bold text-primary">{k.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Service health grid */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Microservice Health</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {SERVICES.map(s => (
                <div key={s.name} className="p-4 bg-surface-container-low rounded-2xl border border-border-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-xs font-bold text-on-surface">{s.name}</span>
                  </div>
                  <p className="text-xs text-outline mb-1">Port :{s.port}</p>
                  <p className="text-xs text-on-surface-variant">Latency: <span className="font-semibold text-primary">{s.latency}</span></p>
                  <p className="text-xs text-on-surface-variant">Uptime: <span className="font-semibold text-secondary">{s.uptime}</span></p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top endpoints */}
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Top API Endpoints (Today)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-on-surface-variant border-b border-border-subtle">
                    {['Method', 'Endpoint', 'Calls', 'P95 Latency', 'Errors'].map(h => (
                      <th key={h} className="pb-3 pr-6 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {TOP_ENDPOINTS.map(e => (
                    <tr key={e.path} className="hover:bg-surface-container-low/50">
                      <td className="py-3 pr-6">
                        <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${methodColor[e.method]}`}>{e.method}</span>
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-primary">{e.path}</td>
                      <td className="py-3 pr-6 font-semibold">{e.calls.toLocaleString()}</td>
                      <td className="py-3 pr-6">
                        <span className={`font-mono text-xs ${parseInt(e.p95) > 200 ? 'text-amber-600' : 'text-secondary'}`}>{e.p95}</span>
                      </td>
                      <td className="py-3">
                        {e.errors > 0
                          ? <Badge label={`${e.errors} errors`} variant="error" dot />
                          : <Badge label="0 errors" variant="success" dot />
                        }
                      </td>
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
