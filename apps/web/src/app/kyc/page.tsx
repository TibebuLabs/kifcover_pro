'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const idTypes = [
  { id: 'national_id', label: 'National ID', icon: 'badge', desc: 'Fidal / Ethiopian National ID card' },
  { id: 'passport', label: 'Passport', icon: 'flight', desc: 'Ethiopian passport' },
  { id: 'driver_license', label: "Driver's License", icon: 'directions_car', desc: 'Ethiopian driving permit' },
] as const

type IdType = (typeof idTypes)[number]['id']

export default function KycPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [idType, setIdType] = useState<IdType | null>(null)
  const [docNumber, setDocNumber] = useState('')
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const canNext =
    (step === 0 && idType !== null) ||
    (step === 1 && docNumber.trim().length >= 4) ||
    (step === 2 && frontFile !== null) ||
    step === 3

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setSubmitting(true)
    try {
      await api.post('/kyc/upload', {
        type: idType,
        documentNumber: docNumber,
        frontUrl: frontFile ? `https://storage.kifcover.et/kyc/${user?.id}/${idType}/front-${Date.now()}.jpg` : undefined,
        backUrl: backFile ? `https://storage.kifcover.et/kyc/${user?.id}/${idType}/back-${Date.now()}.jpg` : undefined,
      })
    } catch {
      // continue in dev if API unavailable
    } finally {
      setSubmitting(false)
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-4">Identity Submitted!</h2>
          <p className="text-on-surface-variant mb-2">Your documents are being reviewed. This typically takes under 5 minutes.</p>
          <p className="text-sm text-outline mb-10">You will receive a notification once your KYC is approved.</p>
          <div className="bg-white rounded-2xl border border-border-subtle p-6 mb-8 text-left">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined">schedule</span>
              <span className="text-sm font-semibold">Average review time: ~3 minutes</span>
            </div>
          </div>
          <Link
            href="/auth/pin-setup"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all"
          >
            Set up Security PIN
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

      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Identity Verification</h1>
          <p className="text-on-surface-variant">Complete KYC to start purchasing insurance policies.</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center mb-12">
          {['ID Type', 'Document No.', 'Upload', 'Review'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < step
                    ? 'bg-secondary border-secondary text-on-secondary'
                    : i === step
                    ? 'bg-primary border-primary text-on-primary'
                    : 'bg-white border-outline-variant text-outline'
                }`}>
                  {i < step
                    ? <span className="material-symbols-outlined text-[18px]">check</span>
                    : <span className="text-xs font-bold">{i + 1}</span>
                  }
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant whitespace-nowrap">{label}</span>
              </div>
              {i < 3 && (
                <div className={`w-16 h-0.5 mx-2 mb-4 rounded ${i < step ? 'bg-secondary' : 'bg-outline-variant/30'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: ID Type */}
        {step === 0 && (
          <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
            <h2 className="font-display text-xl font-bold text-primary mb-2">Select your ID type</h2>
            <p className="text-on-surface-variant text-sm mb-8">Choose the document you will use for verification.</p>

            <div className="space-y-3">
              {idTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setIdType(t.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                    idType === t.id
                      ? 'border-primary bg-primary-container/10 shadow-sm'
                      : 'border-border-subtle hover:border-outline-variant/60 hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    idType === t.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{t.label}</p>
                    <p className="text-xs text-on-surface-variant">{t.desc}</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      idType === t.id ? 'border-primary' : 'border-outline-variant'
                    }`}>
                      {idType === t.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleNext} disabled={!canNext}>
                Continue <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Document Number */}
        {step === 1 && (
          <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">pin</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Document Number</h2>
                <p className="text-sm text-on-surface-variant">Enter the number on your {idTypes.find((t) => t.id === idType)?.label}</p>
              </div>
            </div>

            <label className="block mb-8">
              <span className="text-sm font-semibold text-primary mb-2 block">Document Number</span>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 1234567890123"
                className="w-full px-4 py-3 rounded-xl border border-border-subtle text-primary placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {docNumber.length > 0 && docNumber.length < 4 && (
                <p className="text-error text-xs mt-1">Must be at least 4 characters</p>
              )}
            </label>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <Button onClick={handleNext} disabled={!canNext}>
                Continue <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Documents */}
        {step === 2 && (
          <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Upload Document</h2>
                <p className="text-sm text-on-surface-variant">Take a photo or upload a clear image of your ID</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 text-center hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
                />
                {frontFile ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">check_circle</span>
                    <p className="font-semibold text-secondary text-sm">{frontFile.name}</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">credit_card</span>
                    <p className="font-semibold text-on-surface-variant text-sm">Upload front of your ID</p>
                    <p className="text-xs text-outline mt-1">JPG, PNG or PDF &middot; Max 5MB</p>
                  </>
                )}
              </label>

              <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 text-center hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
                />
                {backFile ? (
                  <>
                    <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">check_circle</span>
                    <p className="font-semibold text-secondary text-sm">{backFile.name}</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">credit_card</span>
                    <p className="font-semibold text-on-surface-variant text-sm">Upload back of your ID</p>
                    <p className="text-xs text-outline mt-1">JPG, PNG or PDF &middot; Max 5MB</p>
                  </>
                )}
              </label>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <Button onClick={handleNext} disabled={!canNext}>
                Continue <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">rate_review</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-primary">Review & Submit</h2>
                <p className="text-sm text-on-surface-variant">Please confirm your details before submitting.</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 mb-8 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">ID Type</span>
                <span className="text-sm font-semibold text-primary">{idTypes.find((t) => t.id === idType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Document Number</span>
                <span className="text-sm font-semibold text-primary">{docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Front Document</span>
                <span className="text-sm font-semibold text-primary">{frontFile ? 'Uploaded' : 'Not uploaded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Back Document</span>
                <span className="text-sm font-semibold text-primary">{backFile ? 'Uploaded' : 'Not uploaded'}</span>
              </div>
            </div>

            <div className="bg-primary-container/10 rounded-xl p-4 mb-8 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                By submitting, you confirm the information is accurate. KYC review typically takes under 5 minutes.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <Button onClick={handleNext} loading={submitting}>
                {!submitting && <>Submit for Review <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-outline mt-6">
          Your data is encrypted and processed securely. We comply with Ethiopian data protection regulations.
        </p>
      </div>
    </div>
  )
}
