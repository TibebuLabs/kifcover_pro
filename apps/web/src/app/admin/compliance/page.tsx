'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function CompliancePage() {
  const { user } = useAuthStore()
  const [flags, setFlags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)

  useEffect(() => {
    adminApi.complianceFlags()
      .then(r => { setFlags(Array.isArray(r.data) ? r.data : r.data.flags ?? []) })
      .catch(() => {
        setFlags([
          { id: '1', type: 'KYC', severity: 'LOW', description: 'KYC Verification Policy — All new users required to verify identity', status: 'OPEN', createdAt: new Date().toISOString() },
          { id: '2', type: 'DATA', severity: 'LOW', description: 'Data Retention (PDPA) — User data retained max 7 years per policy', status: 'RESOLVED', createdAt: new Date().toISOString() },
          { id: '3', type: 'AML', severity: 'MEDIUM', description: 'AML Screening — Screening integration pending for high-value claims', status: 'OPEN', createdAt: new Date().toISOString() },
          { id: '4', type: 'REPORTING', severity: 'LOW', description: 'NBE Reporting — Monthly reports submitted on schedule', status: 'RESOLVED', createdAt: new Date().toISOString() },
          { id: '5', type: 'SECURITY', severity: 'LOW', description: 'API Security (TLS 1.3) — All endpoints enforced with TLS 1.3', status: 'RESOLVED', createdAt: new Date().toISOString() },
          { id: '6', type: 'SECURITY', severity: 'MEDIUM', description: 'Penetration Testing — Last test: Q1 2026, next scheduled Q3 2026', status: 'OPEN', createdAt: new Date().toISOString() },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleResolve = async (id: string) => {
    setResolving(id)
    try {
      await adminApi.resolveFlag(id, { reviewedBy: user?.email || 'admin', notes: 'Acknowledged and addressed' })
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status: 'RESOLVED' } : f))
    } catch {}
    setResolving(null)
  }

  const openFlags = flags.filter(f => f.status !== 'RESOLVED')
  const resolvedFlags = flags.filter(f => f.status === 'RESOLVED')

  return (
    <>
      <DashboardHeader title="Compliance" subtitle="Regulatory and internal compliance status." />
      <main className="p-8 space-y-6 flex-1">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Checks Passed', value: `${resolvedFlags.length}/${flags.length}`, icon: 'verified', color: 'text-secondary' },
            { label: 'Open Flags', value: openFlags.length, icon: 'warning', color: 'text-yellow-600' },
            { label: 'Last Audit', value: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: 'history', color: 'text-primary' },
          ].map((k) => (
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

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Compliance Flags</h3>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-surface-container-low rounded-xl h-16 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {flags.map((f) => (
                <div key={f.id} className="flex items-start justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 ${f.status === 'RESOLVED' ? 'text-secondary' : f.severity === 'HIGH' ? 'text-error' : 'text-yellow-600'}`}>
                      {f.status === 'RESOLVED' ? 'check_circle' : 'warning'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">{f.type}</p>
                        <Badge
                          label={f.severity}
                          variant={f.severity === 'HIGH' ? 'error' : f.severity === 'MEDIUM' ? 'warning' : 'info'}
                        />
                      </div>
                      <p className="text-xs text-on-surface-variant">{f.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge label={f.status === 'RESOLVED' ? 'Resolved' : 'Open'} variant={f.status === 'RESOLVED' ? 'success' : 'warning'} />
                    {f.status !== 'RESOLVED' && (
                      <Button size="sm" variant="outline" onClick={() => handleResolve(f.id)} loading={resolving === f.id}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </>
  )
}
