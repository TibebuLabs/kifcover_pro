'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function PinSetupPage() {
  const router = useRouter()
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', ''])
  const [phase, setPhase] = useState<'create' | 'confirm'>('create')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusNext = (index: number) => {
    if (index < 5) inputRefs.current[index + 1]?.focus()
  }

  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleChange = (index: number, value: string, setter: (v: string[]) => void, current: string[]) => {
    if (!/^\d*$/.test(value)) return
    const next = [...current]
    next[index] = value.slice(-1)
    setter(next)
    if (value) focusNext(index)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent, setter: (v: string[]) => void, current: string[]) => {
    if (e.key === 'Backspace' && !current[index]) {
      e.preventDefault()
      focusPrev(index)
      const next = [...current]
      next[index - 1] = ''
      setter(next)
    }
  }

  const handlePaste = (e: React.ClipboardEvent, setter: (v: string[]) => void) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    setter([...pasted, ...Array(6 - pasted.length).fill('')])
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const pinValue = (arr: string[]) => arr.join('')
  const pinFilled = (arr: string[]) => arr.every((d) => d !== '')

  const handleContinue = () => {
    setError('')
    if (pinFilled(pin)) {
      setPhase('confirm')
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    }
  }

  const handleSubmit = async () => {
    if (pinValue(pin) !== pinValue(confirmPin)) {
      setError('PINs do not match. Please try again.')
      setPhase('create')
      setConfirmPin(['', '', '', '', '', ''])
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/pin', { pin: pinValue(pin) })
      setCompleted(true)
    } catch {
      setCompleted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock
              </span>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-4">PIN Created!</h2>
          <p className="text-on-surface-variant mb-8">Your security PIN has been set. Use it to confirm transactions and sign in.</p>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all"
          >
            Go to Dashboard
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-main">
      {/* Top bar */}
      <div className="bg-surface-container-lowest border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            <span className="font-display text-xl font-bold text-primary">KifCover</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
            256-bit encrypted
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-8 py-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">
            {phase === 'create' ? 'Create Security PIN' : 'Confirm PIN'}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {phase === 'create'
              ? 'Choose a 6-digit PIN to secure your account.'
              : 'Re-enter your PIN to confirm.'}
          </p>
        </div>

        {/* PIN inputs */}
        <div className="flex justify-center gap-3 mb-8">
          {(phase === 'create' ? pin : confirmPin).map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(
                i,
                e.target.value,
                phase === 'create' ? setPin : setConfirmPin,
                phase === 'create' ? pin : confirmPin,
              )}
              onKeyDown={(e) => handleKeyDown(
                i,
                e,
                phase === 'create' ? setPin : setConfirmPin,
                phase === 'create' ? pin : confirmPin,
              )}
              onPaste={(e) => handlePaste(e, phase === 'create' ? setPin : setConfirmPin)}
              className="w-14 h-16 text-center text-2xl font-bold text-primary bg-white border-2 border-border-subtle rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm mb-6">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {phase === 'create' ? (
          <Button onClick={handleContinue} disabled={!pinFilled(pin)} className="w-full" size="lg">
            Continue <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Button>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleSubmit} disabled={!pinFilled(confirmPin)} loading={submitting} className="w-full" size="lg">
              {!submitting && <>Confirm PIN <span className="material-symbols-outlined text-[20px]">check</span></>}
            </Button>
            <button
              onClick={() => { setPhase('create'); setError(''); setConfirmPin(['', '', '', '', '', '']); }}
              className="w-full text-center text-sm text-on-surface-variant hover:text-primary py-2 transition-colors"
            >
              Go back and change PIN
            </button>
          </div>
        )}

        <p className="text-center text-xs text-outline mt-8">
          Your PIN is encrypted and stored securely. Never share it with anyone.
        </p>
      </div>
    </div>
  )
}
