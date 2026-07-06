'use client'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const checks = [
  { label: 'KYC Verification Policy', status: 'pass', detail: 'All new users required to verify identity' },
  { label: 'Data Retention (PDPA)', status: 'pass', detail: 'User data retained max 7 years per policy' },
  { label: 'AML Screening', status: 'warn', detail: 'Screening integration pending for high-value claims' },
  { label: 'NBE Reporting', status: 'pass', detail: 'Monthly reports submitted on schedule' },
  { label: 'API Security (TLS 1.3)', status: 'pass', detail: 'All endpoints enforced with TLS 1.3' },
  { label: 'Penetration Testing', status: 'warn', detail: 'Last test: Q1 2026 — next scheduled Q3 2026' },
]

export default function CompliancePage() {
  const passed = checks.filter((c) => c.status === 'pass').length
  return (
    <>
      <DashboardHeader title="Compliance" subtitle="Regulatory and internal compliance status." />
      <main className="p-8 space-y-6 flex-1">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Checks Passed', value: `${passed}/${checks.length}`, icon: 'verified', color: 'text-secondary' },
            { label: 'Warnings', value: checks.filter((c) => c.status === 'warn').length, icon: 'warning', color: 'text-yellow-600' },
            { label: 'Last Audit', value: 'Jun 2026', icon: 'history', color: 'text-primary' },
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
          <h3 className="font-display text-lg font-bold text-primary mb-4">Compliance Checklist</h3>
          <div className="space-y-3">
            {checks.map((c) => (
              <div key={c.label} className="flex items-start justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined mt-0.5 ${c.status === 'pass' ? 'text-secondary' : 'text-yellow-600'}`}>
                    {c.status === 'pass' ? 'check_circle' : 'warning'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-xs text-on-surface-variant">{c.detail}</p>
                  </div>
                </div>
                <Badge label={c.status === 'pass' ? 'Pass' : 'Warning'} variant={c.status === 'pass' ? 'success' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>
      </main>
    </>
  )
}
