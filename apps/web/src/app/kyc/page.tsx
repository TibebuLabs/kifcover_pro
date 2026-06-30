'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const kycSteps = [
  { id: 'national_id', icon: 'badge', title: 'National ID', desc: 'Upload a photo of your Ethiopian National ID card (front and back).' },
  { id: 'selfie', icon: 'face_retouching_natural', title: 'Live Selfie', desc: 'Take a quick selfie for biometric identity verification.' },
  { id: 'address', icon: 'home', title: 'Address Verification', desc: 'Confirm your current residential address in Ethiopia.' },
]

export default function KycPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [fileSelected, setFileSelected] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(!!e.target.files?.length)
  }

  const handleNext = async () => {
    const step = kycSteps[currentStep]
    setUploading(true)
    try {
      await api.post('/kyc/upload', {
        type: step.id,
        fileUrl: `https://storage.kifcover.et/kyc/${user?.id}/${step.id}/${Date.now()}.jpg`,
      })
    } catch {
      // continue if API unavailable in dev
    } finally {
      setUploading(false)
      setFileSelected(false)
    }

    if (currentStep < kycSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Success animation */}
          <div className="w-24 h-24 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-4">Identity Submitted!</h2>
          <p className="text-on-surface-variant mb-2">
            Your documents are being reviewed. This typically takes under 5 minutes.
          </p>
          <p className="text-sm text-outline mb-10">You'll receive a notification once your KYC is approved.</p>
          <div className="bg-white rounded-2xl border border-border-subtle p-6 mb-8 text-left">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined">schedule</span>
              <span className="text-sm font-semibold">Average review time: ~3 minutes</span>
            </div>
          </div>
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

  const step = kycSteps[currentStep]

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
          {kycSteps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  i < currentStep
                    ? 'bg-secondary border-secondary text-on-secondary'
                    : i === currentStep
                    ? 'bg-primary border-primary text-on-primary'
                    : 'bg-white border-outline-variant text-outline'
                }`}>
                  {i < currentStep
                    ? <span className="material-symbols-outlined text-[18px]">check</span>
                    : <span className="text-xs font-bold">{i + 1}</span>
                  }
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant whitespace-nowrap">{s.title}</span>
              </div>
              {i < kycSteps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-4 rounded ${i < currentStep ? 'bg-secondary' : 'bg-outline-variant/30'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary-container/10 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl">{step.icon}</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-primary">{step.title}</h2>
              <p className="text-sm text-on-surface-variant">Step {currentStep + 1} of {kycSteps.length}</p>
            </div>
          </div>

          <p className="text-on-surface-variant mb-8">{step.desc}</p>

          {/* Upload zone */}
          <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-12 text-center hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer mb-8">
            <input type="file" accept="image/*,.pdf" className="sr-only" onChange={handleFileChange} />
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">upload_file</span>
            <p className="font-semibold text-on-surface-variant text-sm">
              {fileSelected ? '✓ File selected' : 'Drop your file here or click to browse'}
            </p>
            <p className="text-xs text-outline mt-1">JPG, PNG or PDF · Max 5MB</p>
          </label>

          <div className="flex items-center justify-between">
            <button
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
              disabled={currentStep === 0}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <Button onClick={handleNext} loading={uploading}>
              {currentStep < kycSteps.length - 1 ? 'Next Step' : 'Submit for Review'}
              {!uploading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          Your data is encrypted and processed securely. We comply with Ethiopian data protection regulations.
        </p>
      </div>
    </div>
  )
}
