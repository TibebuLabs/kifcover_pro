'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface ProfileForm {
  firstName: string
  lastName: string
  phone: string
}

export default function AccountPage() {
  const { user, setUser } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: (user as any)?.phone ?? '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setError('')
    setSuccess(false)
    try {
      const res = await api.patch('/users/me', data)
      setUser({ ...user!, ...res.data })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  return (
    <>
      <DashboardHeader title="My Account" subtitle="Manage your profile and account settings." />
      <main className="p-8 flex-1 space-y-6 max-w-2xl">
        {/* Profile card */}
        <Card>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-on-primary text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-primary">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-on-surface-variant">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  label={user?.kycStatus === 'VERIFIED' ? 'KYC Verified' : 'KYC Pending'}
                  variant={user?.kycStatus === 'VERIFIED' ? 'success' : 'warning'}
                  dot
                />
                <Badge label={user?.role ?? 'CUSTOMER'} variant="info" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                icon="person"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'Required' })}
              />
              <Input
                label="Last Name"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Required' })}
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              icon="phone"
              placeholder="+251 91 123 4567"
              {...register('phone')}
            />

            {error && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-secondary-container/30 text-secondary px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Profile updated successfully.
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </Card>

        {/* KYC status */}
        {user?.kycStatus !== 'VERIFIED' && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary mb-1">Complete Identity Verification</h3>
                <p className="text-sm text-on-surface-variant">KYC is required to purchase policies and file claims.</p>
              </div>
              <Button href="/kyc" size="sm">
                Verify Now →
              </Button>
            </div>
          </Card>
        )}
      </main>
    </>
  )
}
