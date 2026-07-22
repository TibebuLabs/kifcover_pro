'use client'
import { useState } from 'react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

function SecuritySection({ icon, title, subtitle, children }: {
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

function StrengthBar({ label, color, width }: { label: string; color: string; width: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width }} />
      </div>
      <span className="text-[10px] font-semibold text-on-surface-variant w-12 text-right">{label}</span>
    </div>
  )
}

export default function SecurityPage() {
  const { user } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { isSubmitting, errors } } = useForm()
  const newPass = watch('newPass', '')

  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' }
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-amber-500' }
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' }
    return { score: 5, label: 'Excellent', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(newPass)

  const onSubmit = async (data: any) => {
    setError('')
    if (data.newPass !== data.confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await authApi.changePassword({ currentPassword: data.current, newPassword: data.newPass })
      setSaved(true)
      reset()
      setTimeout(() => setSaved(false), 4000)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(typeof msg === 'string' ? msg : 'Failed to change password. Please check your current password.')
    }
  }

  return (
    <>
      <DashboardHeader title="Security" subtitle="Protect your account with strong authentication." />
      <main className="p-4 sm:p-8 flex-1 space-y-6 max-w-3xl">

        {/* Password Change */}
        <SecuritySection icon="lock" title="Change Password" subtitle="Use a strong, unique password you haven't used elsewhere">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                icon="key"
                {...register('current', { required: 'Current password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{showCurrent ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNew ? 'text' : 'password'}
                icon="lock"
                error={errors.newPass?.message as string}
                {...register('newPass', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{showNew ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPass && (
              <div className="space-y-2 animate-in">
                <StrengthBar label="Length" color={newPass.length >= 8 ? 'bg-green-500' : 'bg-outline/30'} width={newPass.length >= 8 ? '100%' : `${Math.min(newPass.length / 8 * 100, 100)}%`} />
                <StrengthBar label="Uppercase" color={/[A-Z]/.test(newPass) ? 'bg-green-500' : 'bg-outline/30'} width={/[A-Z]/.test(newPass) ? '100%' : '30%'} />
                <StrengthBar label="Numbers" color={/[0-9]/.test(newPass) ? 'bg-green-500' : 'bg-outline/30'} width={/[0-9]/.test(newPass) ? '100%' : '30%'} />
                <StrengthBar label="Symbols" color={/[^A-Za-z0-9]/.test(newPass) ? 'bg-green-500' : 'bg-outline/30'} width={/[^A-Za-z0-9]/.test(newPass) ? '100%' : '30%'} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-on-surface-variant">Overall Strength</span>
                  <span className={`text-xs font-bold ${strength.score >= 4 ? 'text-green-600' : strength.score >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              </div>
            )}

            <Input
              label="Confirm New Password"
              type="password"
              icon="lock"
              {...register('confirm', { required: 'Please confirm your password' })}
            />

            {error && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Password updated successfully
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>Update Password</Button>
            </div>
          </form>
        </SecuritySection>

        {/* Two-Factor Authentication */}
        <SecuritySection icon="verified_user" title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
          <div className="space-y-4">
            {/* TOTP */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border-subtle">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-600 text-[22px]">smartphone</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Authenticator App</p>
                  <p className="text-xs text-on-surface-variant">Use Google Authenticator or Authy for one-time codes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Not Setup</span>
                <Button size="sm" variant="outline">Enable</Button>
              </div>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border-subtle">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">sms</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">SMS Verification</p>
                  <p className="text-xs text-on-surface-variant">Receive one-time codes via text message</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          </div>
        </SecuritySection>

        {/* Active Sessions */}
        <SecuritySection icon="devices" title="Active Sessions" subtitle="Manage devices currently signed in to your account">
          <div className="space-y-3">
            {[
              { device: 'Chrome on Windows', location: 'Addis Ababa, ET', time: 'Current session', icon: 'computer', current: true },
              { device: 'Safari on iPhone', location: 'Addis Ababa, ET', time: '2 hours ago', icon: 'smartphone', current: false },
            ].map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${s.current ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-low border-border-subtle'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.current ? 'bg-primary/10' : 'bg-outline/10'}`}>
                    <span className={`material-symbols-outlined text-[22px] ${s.current ? 'text-primary' : 'text-on-surface-variant'}`}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-on-surface">{s.device}</p>
                      {s.current && (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">{s.location} · {s.time}</p>
                  </div>
                </div>
                {!s.current && (
                  <button className="text-xs font-semibold text-error hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </SecuritySection>

        {/* Login History */}
        <SecuritySection icon="history" title="Recent Login Activity" subtitle="Monitor access to your account">
          <div className="space-y-0">
            {[
              { date: 'Today, 9:45 AM', ip: '196.189.x.x', location: 'Addis Ababa', status: 'success' },
              { date: 'Yesterday, 3:12 PM', ip: '196.189.x.x', location: 'Addis Ababa', status: 'success' },
              { date: 'Jul 14, 11:30 AM', ip: '41.215.x.x', location: 'Bahir Dar', status: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm text-on-surface">{log.date}</p>
                    <p className="text-xs text-on-surface-variant">{log.ip} · {log.location}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
              </div>
            ))}
          </div>
        </SecuritySection>

        {/* Account Status */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-[22px]">shield</span>
            <h3 className="text-sm font-bold text-on-surface">Security Score</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">65%</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-3">Enable two-factor authentication to improve your security score to 85%.</p>
        </div>

      </main>
    </>
  )
}
