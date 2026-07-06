'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setError('')
      const res = await api.post('/auth/register', {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        phone:     data.phone || undefined,
        password:  data.password,
      })
      const { accessToken, user } = res.data
      setToken(accessToken)
      setUser(user)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <span className="font-display text-2xl font-bold text-primary">KifCover</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-primary mb-2">Create your account</h2>
          <p className="text-on-surface-variant text-sm">Join thousands of Ethiopians protecting what matters most.</p>
        </div>

        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Abebe"
                icon="person"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                placeholder="Kebede"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Last name is required' })}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="abebe@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
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
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min. 8 characters' },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              icon="lock"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
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
