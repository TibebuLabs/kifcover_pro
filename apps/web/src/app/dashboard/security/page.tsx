'use client'
import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'

export default function SecurityPage() {
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm()

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <DashboardHeader title="Security" subtitle="Manage your password and account security settings." />
      <main className="p-8 space-y-6 flex-1 max-w-2xl">
        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-6">Change Password</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Current Password" type="password" icon="lock"
              {...register('current', { required: true })} />
            <Input label="New Password" type="password" icon="lock"
              {...register('newPass', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })}
              error={errors.newPass?.message as string} />
            <Input label="Confirm New Password" type="password" icon="lock"
              {...register('confirm', { required: true })} />
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Password updated successfully
              </div>
            )}
            <Button type="submit" loading={isSubmitting}>Update Password</Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Two-Factor Authentication</h3>
          <p className="text-sm text-on-surface-variant mb-4">Add an extra layer of security to your account.</p>
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">smartphone</span>
              <div>
                <p className="text-sm font-semibold">Authenticator App</p>
                <p className="text-xs text-on-surface-variant">Not configured</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Enable</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-bold text-primary mb-4">Active Sessions</h3>
          <div className="space-y-3">
            {[{ device: 'Chrome on Windows', location: 'Addis Ababa, ET', current: true },
              { device: 'Safari on iPhone', location: 'Addis Ababa, ET', current: false }]
              .map((s) => (
                <div key={s.device} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline">devices</span>
                    <div>
                      <p className="text-sm font-semibold">{s.device}</p>
                      <p className="text-xs text-on-surface-variant">{s.location}</p>
                    </div>
                  </div>
                  {s.current
                    ? <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-medium">Current</span>
                    : <button className="text-xs text-error hover:underline">Revoke</button>}
                </div>
              ))}
          </div>
        </Card>
      </main>
    </>
  )
}
