'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

const MOCK_ACCOUNTS: Record<string, { token: string; user: any }> = {
  'admin@kifcover.et:admin123': {
    token: 'mock-jwt-admin',
    user: { id: 'mock-admin', email: 'admin@kifcover.et', firstName: 'Admin', lastName: 'KifCover', role: 'PLATFORM_ADMIN', kycStatus: 'VERIFIED', isActive: true },
  },
  'demo@kifcover.et:demo123': {
    token: 'mock-jwt-demo',
    user: { id: 'mock-demo', email: 'demo@kifcover.et', firstName: 'Abebe', lastName: 'Kebede', role: 'CUSTOMER', kycStatus: 'PENDING', isActive: true },
  },
  'partner@kifcover.et:partner123': {
    token: 'mock-jwt-partner',
    user: { id: 'mock-partner', email: 'partner@kifcover.et', firstName: 'Acme', lastName: 'Fintech', role: 'PARTNER_ADMIN', kycStatus: 'VERIFIED', isActive: true },
  },
  'insurer@kifcover.et:insurer123': {
    token: 'mock-jwt-insurer',
    user: { id: 'mock-insurer', email: 'insurer@kifcover.et', firstName: 'EIC', lastName: 'Insurance', role: 'INSURANCE_PROVIDER', kycStatus: 'VERIFIED', isActive: true },
  },
}

function roleRedirect(role: string, fallback: string | null): string {
  if (fallback) return fallback
  switch (role) {
    case 'PLATFORM_ADMIN':     return '/admin/analytics'
    case 'INSURANCE_PROVIDER': return '/insurer/dashboard'
    case 'PARTNER_ADMIN':      return '/partner/dashboard'
    default:                   return '/dashboard'
  }
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')

    const mock = MOCK_ACCOUNTS[`${data.email}:${data.password}`]
    if (mock) {
      setToken(mock.token)
      setUser(mock.user)
      router.push(roleRedirect(mock.user.role, searchParams.get('redirect')))
      return
    }

    try {
      const res = await authApi.login(data)
      const { accessToken, user } = res.data
      setToken(accessToken)
      setUser(user)
      router.push(roleRedirect(user.role, searchParams.get('redirect')))
    } catch (err: any) {
      const msg = err.response?.data?.message
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Branding Panel ──────────────────────────────────────────── */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-80" />
          <div
            className="w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-100"
            style={{
              backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDEl-VjiFOYgeVRp572KyO1dnR3AjI0qKCJuYCbSz1nU_ys8vUY1QInXmEDZ5fAGqGoXrLHmM3-GRzr9XSK-sfzOIOMNVQn56VPoPEhhIwQMKKdv4l-7UmOJ7e85_-ydW_31qI7fosDLz1CE73RRF8jdwiHldEU2mc_0ODpaprCxspWgtONMABXYnS7S-b15rjd_zkajdjPrkA1tCtXbj5j3_59_ujFZDtDuojQOOY-NuNFxBV2dKDTtDEWB7i-1SNz1BKW9_jvrQo)',
              transform: 'scale(1.05)',
            }}
          />
        </div>

        <div className="relative z-10 p-8 lg:p-12 max-w-lg text-white">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-3xl font-extrabold tracking-tight">KifCover</span>
          </Link>

          <h2 className="font-display text-[48px] leading-[60px] tracking-tight font-bold mb-6">
            Securing the future of Ethiopian Insurance
          </h2>
          <p className="text-primary-fixed/80 text-lg leading-relaxed">
            Enterprise-grade insurance infrastructure for high-growth tech platforms. Stability, agility, and trust at scale.
          </p>

          <div className="mt-12 flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="bg-secondary p-2 rounded-lg">
                <span className="material-symbols-outlined text-white">verified_user</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Licensed InsurTech</p>
                <p className="text-sm text-white/70">Fully regulated infrastructure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary-fixed animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
      </section>

      {/* ── Right Login Form ─────────────────────────────────────────────── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md space-y-10">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="font-display text-xl font-bold text-primary">KifCover</span>
          </Link>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-primary">Welcome back</h2>
            <p className="text-on-surface-variant text-base">Access your insurance dashboard and policy controls.</p>
          </div>

          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">info</span> Demo credentials
            </p>
            <p><span className="font-semibold">Admin:</span> admin@kifcover.et / admin123</p>
            <p><span className="font-semibold">Customer:</span> demo@kifcover.et / demo123</p>
            <p><span className="font-semibold">Partner:</span> partner@kifcover.et / partner123</p>
            <p><span className="font-semibold">Insurer:</span> insurer@kifcover.et / insurer123</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-background-alt border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
                <Link href="#" className="text-xs font-semibold text-primary-container hover:text-primary transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-background-alt border border-border-subtle rounded-xl text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white text-sm font-semibold py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border-subtle" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-outline font-medium tracking-wider">or secure access</span>
              </div>
            </div>

            {/* Biometrics placeholder */}
            <button
              type="button"
              className="w-full bg-white border border-border-subtle text-on-surface text-sm font-semibold py-4 rounded-xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-primary">fingerprint</span>
              Login with Biometrics
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            Don&apos;t have an enterprise account?{' '}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">Create account</Link>
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs opacity-50">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Cookie Settings</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
