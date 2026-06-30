'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const res = await api.post('/auth/login', data)
      setToken(res.data.accessToken)
      setUser(res.data.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90" />
        <div className="relative z-10 p-12 max-w-lg text-white">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-3xl font-bold">KifCover</span>
          </Link>
          <h2 className="font-display text-5xl font-bold leading-tight mb-6">
            Securing the future of insurance in Ethiopia.
          </h2>
          <p className="text-on-primary/70 text-lg leading-relaxed mb-12">
            Enterprise-grade embedded insurance infrastructure for high-growth digital platforms.
          </p>
          <div className="space-y-4">
            {[
              { icon: 'verified_user', title: 'Licensed InsurTech', desc: 'Fully regulated infrastructure' },
              { icon: 'speed', title: 'Instant Issuance', desc: 'Policies issued in seconds' },
              { icon: 'support_agent', title: '24/7 Support', desc: 'Always here when you need us' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10">
                <div className="bg-secondary p-2 rounded-lg">
                  <span className="material-symbols-outlined text-white text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-on-primary/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-10 right-10 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 md:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-10">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="font-display text-xl font-bold text-primary">KifCover</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-primary mb-2">Welcome back</h2>
            <p className="text-on-surface-variant text-sm">Access your insurance dashboard and policy controls.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-on-surface">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary-container hover:text-primary">
                  Forgot Password?
                </Link>
              </div>
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
              Sign In
              {!isSubmitting && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-outline uppercase tracking-wider">or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-border-subtle bg-white text-on-surface py-4 rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-primary">fingerprint</span>
              Login with Biometrics
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>

          <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-border-subtle">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link) => (
              <Link key={link} href="#" className="text-xs text-outline hover:text-primary transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
