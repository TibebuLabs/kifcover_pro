'use client'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function PartnerApiAccessPage() {
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [regenLoading, setRegenLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get('/users/me')
      .then(r => {
        const partnerId = (r.data as any)?.partnerId
        if (partnerId) return api.get(`/partner/${partnerId}`)
        return null
      })
      .then(r => r && setPartner(r.data))
      .catch(() => setPartner({ id: 'mock', name: 'Acme Fintech', apiKey: 'kif_demo_key_abcdef123456', webhookUrl: 'https://acme.example.com/webhook' }))
      .finally(() => setLoading(false))
  }, [])

  const regenKey = async () => {
    if (!partner?.id) return
    setRegenLoading(true)
    try {
      const r = await api.post(`/partner/${partner.id}/regen-key`, { env: 'prod' })
      setPartner((prev: any) => ({ ...prev, apiKey: r.data.apiKey }))
      setRevealed(true)
    } catch {}
    setRegenLoading(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(partner?.apiKey ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <DashboardHeader title="API Access" subtitle="Manage your API key and integration settings." />
      <main className="p-8 space-y-6 flex-1 max-w-2xl">
        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">API Credentials</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant mb-2">API Key</p>
              <div className="flex items-center gap-2 bg-surface-container-low rounded-xl border border-border-subtle px-4 py-3">
                <code className="flex-1 text-sm font-mono text-on-surface">
                  {revealed ? (partner?.apiKey ?? '—') : '•'.repeat(32)}
                </code>
                <button onClick={() => setRevealed(v => !v)} className="text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{revealed ? 'visibility_off' : 'visibility'}</span>
                </button>
                <button onClick={copy} className="text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              Keep your API key secret. Regenerating invalidates the existing key immediately.
            </div>

            <Button onClick={regenKey} loading={regenLoading} variant="outline" size="sm">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Regenerate API Key
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">API Base URL</h3>
          <div className="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-sm">
            <p className="text-gray-400 mb-2"># Base URL</p>
            <p>https://api.kifcover.et/v1</p>
            <br />
            <p className="text-gray-400 mb-2"># Authenticate with your key</p>
            <p>Authorization: Bearer {'<YOUR_API_KEY>'}</p>
            <br />
            <p className="text-gray-400 mb-2"># Generate a quote</p>
            <p>POST /quotes/generate</p>
          </div>
          <div className="mt-4">
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Full API Reference (Swagger)
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Webhook</h3>
          <p className="text-sm text-on-surface-variant mb-4">KifCover will POST policy and payment events to this URL.</p>
          <div className="bg-surface-container-low rounded-xl border border-border-subtle px-4 py-3">
            <code className="text-sm font-mono text-on-surface">{partner?.webhookUrl ?? 'Not configured'}</code>
          </div>
          <p className="text-xs text-outline mt-3">To update, contact your account manager or use the Settings page.</p>
        </Card>
      </main>
    </>
  )
}
