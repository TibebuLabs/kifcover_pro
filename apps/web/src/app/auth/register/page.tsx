'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('')
      const res = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      })
      const { accessToken, user } = res.data
      setToken(accessToken)
      setUser(user)
      router.push('/kyc')
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10 text-on-primary px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-3xl font-bold">KifCover</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Join thousands protecting what matters most
          </h1>
          <p className="text-on-primary/80 text-lg leading-relaxed mb-12">
            Create your free account and get covered in under 3 minutes. Choose from 50+ insurance products.
          </p>
          <div className="flex items-center gap-6 text-sm text-on-primary/70">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Licensed by NBE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-background-main">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 lg:hidden">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-2xl font-bold text-primary">KifCover</span>
          </Link>

          <h2 className="font-display text-3xl font-bold text-primary mb-2">Create your account</h2>
          <p className="text-on-surface-variant text-sm mb-8">Fill in your details to get started.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Abebe"
                icon="person"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Kebede"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="abebe@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number (optional)"
              type="tel"
              placeholder="+251 91 123 4567"
              icon="phone"
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              icon="lock"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              icon="lock"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {error && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              {!isSubmitting && <>Create Account <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
            </Button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
