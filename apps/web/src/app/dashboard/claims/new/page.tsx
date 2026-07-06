'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import Link from 'next/link'

interface ClaimForm {
  policyId: string
  description: string
  incidentDate: string
  claimAmount: number
}

export default function NewClaimPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ClaimForm>()

  const onSubmit = async (data: ClaimForm) => {
    try {
      setError('')
      await api.post('/claims', data)
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
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">check_circle</span>
              <h3 className="font-display text-xl font-bold text-primary mb-2">Claim Submitted!</h3>
              <p className="text-on-surface-variant text-sm">Redirecting to your claims...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Policy ID"
                placeholder="Enter your policy UUID"
                icon="policy"
                error={errors.policyId?.message}
                {...register('policyId', { required: 'Policy ID is required' })}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the incident in detail (min 20 characters)..."
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                  {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                />
                {errors.description && <p className="text-xs text-error">{errors.description.message}</p>}
              </div>

              <Input
                label="Incident Date"
                type="date"
                icon="calendar_today"
                error={errors.incidentDate?.message}
                {...register('incidentDate', { required: 'Incident date is required' })}
              />

              <Input
                label="Claim Amount (ETB)"
                type="number"
                placeholder="0.00"
                icon="payments"
                error={errors.claimAmount?.message}
                {...register('claimAmount', { required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } })}
              />

              {error && (
                <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
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
