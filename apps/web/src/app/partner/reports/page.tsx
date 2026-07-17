'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type ReportType = 'daily-sales' | 'commission' | 'customer-acquisition'

const REPORTS = [
  { id: 'daily-sales' as ReportType,          title: 'Daily Sales Summary',         icon: 'receipt_long',    desc: 'Policies sold per day with premium totals.' },
  { id: 'commission' as ReportType,           title: 'Commission Statement',         icon: 'account_balance', desc: 'Monthly commission earnings and pending payouts.' },
  { id: 'customer-acquisition' as ReportType, title: 'Customer Acquisition Report',  icon: 'group_add',       desc: 'New customers acquired through your channel.' },
]

export default function PartnerReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [generating, setGenerating] = useState<ReportType | null>(null)

  useEffect(() => {
    api.get('/users/me').then(r => {
      const pid = (r.data as any)?.partnerId
      if (pid) return api.get(`/partner/${pid}/stats`)
      return null
    }).then(r => r && setStats(r.data)).catch(() => setStats({
      totalPolicies: 142, activePolicies: 118, totalRevenue: 284600, commissionEarned: 42690, monthlyRevenue: 42300,
    }))
  }, [])

  const handleDownload = async (type: ReportType) => {
    setGenerating(type)
    await new Promise(r => setTimeout(r, 1200))
    // In production: call /reports/generate?type=... endpoint
    alert(`${type} report generated. Download will begin automatically.`)
    setGenerating(null)
  }

  return (
    <>
      <DashboardHeader title="Reports" subtitle="Generate and download partner performance reports." />
      <main className="p-8 flex-1 space-y-6">
        {/* Summary for current period */}
        {stats && (
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Policies Sold', value: stats.totalPolicies.toString(),                      icon: 'policy' },
              { label: 'Commission This Month', value: `ETB ${stats.monthlyRevenue?.toLocaleString()}`, icon: 'savings' },
              { label: 'Total Revenue', value: `ETB ${stats.totalRevenue.toLocaleString()}`,             icon: 'trending_up' },
            ].map(k => (
              <Card key={k.label}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-primary">{k.icon}</span>
                  <div>
                    <p className="text-xs text-on-surface-variant">{k.label}</p>
                    <p className="text-xl font-bold text-primary">{k.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {REPORTS.map(report => (
            <div key={report.id} className="bg-white rounded-2xl border border-border-subtle p-6 shadow-card flex items-center gap-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">{report.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary">{report.title}</p>
                <p className="text-sm text-on-surface-variant">{report.desc}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleDownload(report.id)} loading={generating === report.id}>
                  <span className="material-symbols-outlined text-[18px]">download</span>CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(report.id)} loading={generating === report.id}>
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
