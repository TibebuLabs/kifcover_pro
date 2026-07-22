'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface ProfileForm {
  firstName: string
  lastName: string
  phone: string
}

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

function ToggleRow({ icon, label, description, enabled, onChange }: {
  icon: string; label: string; description: string; enabled: boolean; onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-on-surface">{label}</p>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-outline/30'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export default function AccountPage() {
  const { user, setUser } = useAuthStore()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [marketingNotifs, setMarketingNotifs] = useState(false)

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
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
  const roleLabels: Record<string, string> = {
    PLATFORM_ADMIN: 'Platform Administrator',
    INSURANCE_PROVIDER: 'Insurance Provider',
    PARTNER_ADMIN: 'Partner Administrator',
    CUSTOMER: 'Customer',
  }

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your account preferences and profile." />
      <main className="p-4 sm:p-8 flex-1 space-y-6 max-w-3xl">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden shadow-card">
          <div className="h-24 bg-gradient-to-r from-primary/80 via-primary to-secondary/60 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary text-2xl font-bold shadow-lg border-4 border-white">
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
                  <Badge label={roleLabels[user?.role ?? 'CUSTOMER'] ?? user?.role ?? 'Customer'} variant="info" />
                  <Badge
                    label={user?.kycStatus === 'VERIFIED' ? 'KYC Verified' : user?.kycStatus === 'REJECTED' ? 'KYC Rejected' : 'KYC Pending'}
                    variant={user?.kycStatus === 'VERIFIED' ? 'success' : user?.kycStatus === 'REJECTED' ? 'error' : 'warning'}
                    dot
                  />
                </div>
              </div>
              {user?.kycStatus !== 'VERIFIED' && (
                <Button href="/kyc" size="sm">Complete Verification</Button>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <SettingSection icon="person" title="Personal Information" subtitle="Update your name and contact details">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                icon="badge"
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
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-on-surface">{user?.email}</p>
                <p className="text-xs text-on-surface-variant">Email cannot be changed</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Profile updated successfully
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </SettingSection>

        {/* Notification Preferences */}
        <SettingSection icon="notifications" title="Notifications" subtitle="Choose how you want to be notified">
          <div className="divide-y divide-border-subtle">
            <ToggleRow
              icon="email"
              label="Email Notifications"
              description="Receive policy updates and claim status via email"
              enabled={emailNotifs}
              onChange={() => setEmailNotifs(!emailNotifs)}
            />
            <ToggleRow
              icon="sms"
              label="SMS Notifications"
              description="Get text messages for urgent alerts and OTPs"
              enabled={smsNotifs}
              onChange={() => setSmsNotifs(!smsNotifs)}
            />
            <ToggleRow
              icon="campaign"
              label="Marketing Communications"
              description="Receive product updates and promotional offers"
              enabled={marketingNotifs}
              onChange={() => setMarketingNotifs(!marketingNotifs)}
            />
          </div>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection icon="warning" title="Danger Zone" subtitle="Irreversible account actions">
          <div className="flex items-center justify-between p-4 bg-error-container/20 rounded-xl border border-error/10">
            <div>
              <p className="text-sm font-semibold text-on-surface">Delete Account</p>
              <p className="text-xs text-on-surface-variant">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <Button size="sm" variant="outline" className="border-error/30 text-error hover:bg-error-container">
              Delete
            </Button>
          </div>
        </SettingSection>

      </main>
    </>
  )
}
