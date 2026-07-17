'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface SettingsForm { name: string; webhookUrl: string; logoUrl: string }

export default function PartnerSettingsPage() {
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

  return (
    <>
      <DashboardHeader title="Partner Settings" subtitle="Update your partnership profile and integration config." />
      <main className="p-8 flex-1 max-w-2xl space-y-6">
        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">Profile</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Company Name" icon="business" error={errors.name?.message}
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
              <div className="flex items-center gap-2 bg-secondary-container/30 text-secondary px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>Settings saved.
              </div>
            )}
            <Button type="submit" loading={isSubmitting}>Save Changes</Button>
          </form>
        </Card>
      </main>
    </>
  )
}
