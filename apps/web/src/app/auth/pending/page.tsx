'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function PendingApprovalPage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main px-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20">
            <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              hourglass_top
            </span>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-primary mb-3">Account Pending Approval</h1>
        <p className="text-on-surface-variant text-base leading-relaxed mb-2">
          Thank you for registering, <span className="font-semibold text-on-surface">{user?.firstName}</span>!
        </p>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          Your account is under review. You will get access once an admin approves your profile.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">admin_panel_settings</span>
            <span className="font-bold text-amber-800">Awaiting Admin Approval</span>
          </div>
          <div className="space-y-2 text-sm text-amber-700">
            <div className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Role: {user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border-subtle p-6 mb-8 text-left">
          <h3 className="text-sm font-bold text-on-surface mb-4">What happens next?</h3>
          <div className="space-y-4">
            {[
              { icon: 'check_circle', label: 'Account created', sub: 'Your profile is registered', done: true },
              { icon: 'pending',      label: 'Admin review',    sub: 'Waiting for approval',     done: false },
              { icon: 'lock_open',    label: 'Full access',     sub: 'Login to your dashboard',  done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  step.done ? 'bg-emerald-100' : i === 1 ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  <span className={`material-symbols-outlined text-[18px] ${
                    step.done ? 'text-emerald-600' : i === 1 ? 'text-amber-600' : 'text-gray-400'
                  }`}>{step.icon}</span>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step.done ? 'text-emerald-700' : i === 1 ? 'text-amber-700' : 'text-on-surface-variant'}`}>{step.label}</p>
                  <p className="text-xs text-on-surface-variant">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login"
            className="w-full bg-primary text-white text-sm font-semibold py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-container transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">login</span>
            Back to Login
          </Link>
          <button onClick={() => logout()}
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  )
}
