'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import Link from 'next/link'

interface ClaimForm {
  policyId: string; description: string; incidentDate: string
  claimAmount: number; documents: string
}

function NewClaimInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefillPolicyId = searchParams.get('policyId') ?? ''

  const [policies, setPolicies] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm<ClaimForm>({
    defaultValues: { policyId: prefillPolicyId },
  })

  const selectedPolicyId = watch('policyId')

  useEffect(() => {
    api.get('/policies/my')
      .then(r => setPolicies((r.data as any[]).filter(p => p.status === 'ACTIVE')))
      .catch(() => {})
  }, [])

  const selectedPolicy = policies.find(p => p.id === selectedPolicyId)

  const onSubmit = async (data: ClaimForm) => {
    try {
      setError('')
      const docs = data.documents ? data.documents.split(',').map(d => d.trim()).filter(Boolean) : []
      await api.post('/claims', { ...data, claimAmount: +data.claimAmount, documents: docs })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/claims'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.')
    }
  }

  return (
    <>
      <DashboardHeader title="File a Claim" subtitle="Submit a new insurance claim for review." />
      <main className="p-8 flex-1 max-w-2xl">
        <Card>
          {success ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              <h3 className="font-display text-xl font-bold text-primary mb-2">Claim Submitted!</h3>
              <p className="text-on-surface-variant text-sm">Redirecting to your claims…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Policy selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface">Select Policy</label>
                {policies.length > 0 ? (
                  <div className="space-y-2">
                    {policies.map(p => (
                      <label key={p.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPolicyId === p.id ? 'border-primary bg-primary-container/10' : 'border-border-subtle hover:border-primary/30'
                        }`}>
                        <input type="radio" value={p.id} {...register('policyId', { required: 'Please select a policy' })} className="sr-only" />
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-[18px]">shield</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-primary text-sm">{p.productName ?? 'Policy'}</p>
                          <p className="text-xs text-on-surface-variant font-mono">{p.policyNumber?.slice(0,16)}…</p>
                        </div>
                        <div className="text-right">
                          <Badge label="ACTIVE" variant="success" dot />
                          <p className="text-xs text-on-surface-variant mt-1">Coverage: ETB {(p.coverageAmount ?? 0).toLocaleString()}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    No active policies. <Link href="/marketplace" className="font-semibold underline ml-1">Get covered first →</Link>
                  </div>
                )}
                {!prefillPolicyId && (
                  <Input label="Or enter Policy ID manually" placeholder="paste UUID…" {...register('policyId', { required: 'Policy ID required' })} icon="policy" />
                )}
                {errors.policyId && <p className="text-xs text-error">{errors.policyId.message}</p>}
              </div>

              {selectedPolicy && (
                <div className="p-4 bg-surface-container-low rounded-xl text-sm">
                  <p className="text-xs text-outline mb-1">Max claimable amount</p>
                  <p className="font-bold text-primary text-lg">ETB {selectedPolicy.coverageAmount?.toLocaleString()}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Incident Description</label>
                <textarea rows={4} placeholder="Describe the incident in detail (min 20 characters, max 1000)…"
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                  {...register('description', { required: 'Description required', minLength: { value: 20, message: 'Min 20 characters' } })} />
                {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
              </div>

              <Input label="Incident Date" type="date" icon="calendar_today" error={errors.incidentDate?.message}
                {...register('incidentDate', { required: 'Incident date required' })} />

              <Input label="Claim Amount (ETB)" type="number" placeholder="0.00" icon="payments"
                error={errors.claimAmount?.message}
                {...register('claimAmount', { required: 'Amount required', min: { value: 1, message: 'Must be > 0' } })} />

              <Input label="Supporting Document URLs (comma-separated)" placeholder="https://…, https://…"
                icon="attach_file" {...register('documents')} />

              {error && (
                <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>{error}
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/dashboard/claims" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button type="submit" className="flex-1" loading={isSubmitting}>Submit Claim</Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </>
  )
}

export default function NewClaimPage() {
  return <Suspense><NewClaimInner /></Suspense>
}
