'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface Policy {
  id: string
  policyNumber: string
  product: { name: string }
}

interface ClaimForm {
  policyId: string
  description: string
  incidentDate: string
  claimAmount: number
}

export default function NewClaimPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ClaimForm>()

  useEffect(() => {
    api.get('/policies/my').then((res) => {
      setPolicies(res.data.filter((p: any) => p.status === 'ACTIVE'))
    }).catch(() => {})
  }, [])

  const onSubmit = async (data: ClaimForm) => {
    setError('')
    try {
      await api.post('/claims', {
        policyId: data.policyId,
        description: data.description,
        incidentDate: new Date(data.incidentDate).toISOString(),
        claimAmount: Number(data.claimAmount),
      })
      router.push('/dashboard/claims')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.')
    }
  }

  return (
    <>
      <DashboardHeader title="File a Claim" subtitle="Submit a new insurance claim for review." />
      <main className="p-8 flex-1">
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-border-subtle p-8 shadow-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Policy selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface">Select Policy *</label>
                <select
                  {...register('policyId', { required: 'Please select a policy' })}
                  className="w-full px-4 py-3.5 bg-background-alt border border-border-subtle rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                >
                  <option value="">— Choose an active policy —</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product.name} · {p.policyNumber}
                    </option>
                  ))}
                </select>
                {errors.policyId && <p className="text-xs text-error">{errors.policyId.message}</p>}
              </div>

              <Input
                label="Incident Date *"
                type="date"
                icon="calendar_today"
                error={errors.incidentDate?.message}
                {...register('incidentDate', { required: 'Incident date is required' })}
              />

              <Input
                label="Claim Amount (ETB) *"
                type="number"
                placeholder="e.g. 15000"
                icon="payments"
                error={errors.claimAmount?.message}
                {...register('claimAmount', {
                  required: 'Claim amount is required',
                  min: { value: 1, message: 'Must be greater than 0' },
                })}
              />

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface">Description *</label>
                <textarea
                  rows={5}
                  placeholder="Describe the incident in detail (minimum 20 characters)..."
                  className="w-full px-4 py-3.5 bg-background-alt border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Please provide at least 20 characters' },
                  })}
                />
                {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" href="/dashboard/claims">
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Submit Claim
                  {!isSubmitting && <span className="material-symbols-outlined text-[20px]">send</span>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
