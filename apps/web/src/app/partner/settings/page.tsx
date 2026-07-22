'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface SettingsForm { name: string; webhookUrl: string; logoUrl: string }

function SettingSection({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle bg-surface-container-low">
        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          <p className="text-xs text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function PartnerSettingsPage() {
  const { user } = useAuthStore()
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<SettingsForm>()

  useEffect(() => {
    api.get('/users/me').then(r => {
      const pid = (r.data as any)?.partnerId
      if (!pid) return
      setPartnerId(pid)
      return api.get(`/partner/${pid}`)
    })
      .then(r => r && reset({ name: r.data.name, webhookUrl: r.data.webhookUrl ?? '', logoUrl: r.data.logoUrl ?? '' }))
      .catch(() => reset({ name: 'Acme Fintech', webhookUrl: 'https://acme.example.com/webhook', logoUrl: '' }))
  }, [])

  const onSubmit = async (data: SettingsForm) => {
    setErr(''); setSaved(false)
    try {
      if (partnerId) await api.patch(`/partner/${partnerId}`, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Failed to save')
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your partner profile and integration settings." />
      <main className="p-4 sm:p-8 flex-1 space-y-6 max-w-3xl">

        {/* Partner Header Card */}
        <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
          <div className="h-24 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 text-2xl font-bold shadow-lg border-4 border-white">
                {initials}
              </div>
            </div>
          </div>
          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-on-surface">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Partner Administrator</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Active Partner</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <SettingSection icon="business" title="Company Profile" subtitle="Update your partner company information">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Company Name" icon="apartment" error={errors.name?.message}
              {...register('name', { required: 'Required' })} />
            <Input label="Webhook URL" icon="webhook" placeholder="https://yoursite.com/webhook"
              {...register('webhookUrl')} />
            <Input label="Logo URL" icon="image" placeholder="https://cdn.example.com/logo.png"
              {...register('logoUrl')} />

            {err && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>{err}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>Settings saved successfully
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </SettingSection>

        {/* API Keys */}
        <SettingSection icon="key" title="API Keys" subtitle="Manage your API credentials for production and sandbox">
          <div className="space-y-4">
            <div className="p-4 bg-surface-container-low rounded-xl border border-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                  <p className="text-sm font-semibold text-on-surface">Production Key</p>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border-subtle">
                <code className="flex-1 text-xs font-mono text-on-surface-variant truncate">kfc_prod_a1b2c3d4e5f6g7h8i9j0...</code>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low rounded-xl border border-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">science</span>
                  <p className="text-sm font-semibold text-on-surface">Sandbox Key</p>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Testing</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border-subtle">
                <code className="flex-1 text-xs font-mono text-on-surface-variant truncate">kfc_sbox_z9y8x7w6v5u4t3s2r1q0...</code>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Account Actions */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">info</span>
            <h3 className="text-sm font-bold text-on-surface">Need help?</h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">Contact the platform administrator at <span className="font-semibold">support@kifcover.et</span> for API key rotation, webhook configuration, or partnership inquiries.</p>
        </div>

      </main>
    </>
  )
}
