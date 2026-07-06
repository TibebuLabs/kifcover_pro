'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface LoginForm {
  email: string
  password: string
}

function LoginForm() {
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')

      // ── Mock login (no backend needed) ───────────────────────────────────
      const mocks: Record<string, any> = {
        'admin@kifcover.et:admin123': {
          token: 'mock-jwt-admin',
          user: { id: 'mock-admin', email: 'admin@kifcover.et', firstName: 'Admin', lastName: 'KifCover', role: 'PLATFORM_ADMIN', kycStatus: 'VERIFIED', isActive: true },
        },
        'demo@kifcover.et:demo123': {
          token: 'mock-jwt-demo',
          user: { id: 'mock-demo', email: 'demo@kifcover.et', firstName: 'Abebe', lastName: 'Kebede', role: 'CUSTOMER', kycStatus: 'PENDING', isActive: true },
        },
      }
      const mockKey = `${data.email}:${data.password}`
      if (mocks[mockKey]) {
        setToken(mocks[mockKey].token)
        setUser(mocks[mockKey].user)
        const redirect = searchParams.get('redirect') || '/dashboard'
        // Full reload ensures cookie is present when proxy evaluates
        window.location.href = redirect
        return
      }
      // ── Real backend login ────────────────────────────────────────────────
      const res = await api.post('/auth/login', data)
      const { accessToken, user } = res.data
      setToken(accessToken)
      setUser(user)
      const redirect = searchParams.get('redirect') || '/dashboard'
      window.location.href = redirect
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center">
        <div className="relative z-10 p-12 max-w-lg text-white">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-3xl font-bold">KifCover</span>
          </Link>
          <h2 className="font-display text-4xl font-bold leading-tight mb-6">
            Securing the future of insurance in Ethiopia.
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Enterprise-grade embedded insurance infrastructure for high-growth digital platforms.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="font-display text-xl font-bold text-primary">KifCover</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-primary mb-2">Welcome back</h2>
            <p className="text-on-surface-variant text-sm">Sign in to access your insurance dashboard.</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 space-y-1">
            <p className="font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">info</span> Demo login</p>
            <p><span className="font-semibold">Admin:</span> admin@kifcover.et / admin123</p>
            <p><span className="font-semibold">Customer:</span> demo@kifcover.et / demo123</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-background-alt border border-border-subtle rounded-xl text-sm placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              {!isSubmitting && <>Sign In <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
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
