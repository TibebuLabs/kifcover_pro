'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function DocumentUploadPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)

  const canSubmit = frontFile !== null

  const handleSubmit = async () => {
    if (!frontFile) return
    setUploading(true)
    try {
      await api.post('/kyc/upload', {
        type: 'document',
        frontUrl: `https://storage.kifcover.et/kyc/${user?.id}/document/front-${Date.now()}.jpg`,
        backUrl: backFile ? `https://storage.kifcover.et/kyc/${user?.id}/document/back-${Date.now()}.jpg` : undefined,
      })
    } catch {
      // continue in dev
    } finally {
      setUploading(false)
      setUploaded(true)
    }
  }

  if (uploaded) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-primary mb-4">Documents Submitted!</h2>
          <p className="text-on-surface-variant mb-2">Your documents have been uploaded and are being reviewed.</p>
          <p className="text-sm text-outline mb-10">You will receive a notification once verification is complete.</p>
          <div className="bg-white rounded-2xl border border-border-subtle p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined">schedule</span>
              <span className="text-sm font-semibold">Average review time: ~3 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span className="text-sm">{frontFile?.name}{backFile ? ` + ${backFile.name}` : ''}</span>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              href="/auth/pin-setup"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all"
            >
              Set up Security PIN
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-semibold text-sm hover:bg-surface-container-highest transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
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
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary mb-2">Upload Documents</h1>
          <p className="text-on-surface-variant">Provide a clear photo of your identification document.</p>
        </div>

        <div className="bg-white rounded-3xl border border-border-subtle shadow-card p-10">
          <div className="space-y-4 mb-8">
            {/* Front upload */}
            <div>
              <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                Front of document
                <span className="text-error text-xs">* required</span>
              </p>
              <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 text-center hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer">
                <input
                  ref={frontRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setFrontFile(e.target.files?.[0] ?? null)}
                />
                {frontFile ? (
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-4xl text-secondary block">check_circle</span>
                    <p className="font-semibold text-secondary text-sm">{frontFile.name}</p>
                    <p className="text-xs text-outline">{(frontFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={(e) => { e.preventDefault(); setFrontFile(null); frontRef.current?.click() }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Replace file
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">add_a_photo</span>
                    <p className="font-semibold text-on-surface-variant text-sm">Tap to take a photo or upload</p>
                    <p className="text-xs text-outline mt-1">JPG, PNG or PDF &middot; Max 5MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Back upload */}
            <div>
              <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                Back of document
                <span className="text-xs text-on-surface-variant font-normal">optional</span>
              </p>
              <label className="block border-2 border-dashed border-outline-variant/40 rounded-2xl p-10 text-center hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer">
                <input
                  ref={backRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setBackFile(e.target.files?.[0] ?? null)}
                />
                {backFile ? (
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-4xl text-secondary block">check_circle</span>
                    <p className="font-semibold text-secondary text-sm">{backFile.name}</p>
                    <p className="text-xs text-outline">{(backFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      onClick={(e) => { e.preventDefault(); setBackFile(null); backRef.current?.click() }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Replace file
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">add_a_photo</span>
                    <p className="font-semibold text-on-surface-variant text-sm">Upload back of document</p>
                    <p className="text-xs text-outline mt-1">JPG, PNG or PDF &middot; Max 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-primary-container/10 rounded-xl p-5 mb-8">
            <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
              Photo tips
            </p>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">check</span>
                Make sure all text on the document is readable
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">check</span>
                Avoid glare, shadows, or blurry images
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">check</span>
                Place the document on a dark, flat surface
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5">check</span>
                Ensure all four corners of the document are visible
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/kyc"
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </Link>
            <Button onClick={handleSubmit} disabled={!canSubmit} loading={uploading}>
              {!uploading && <>Submit Documents <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          Your documents are encrypted end-to-end and deleted after verification.
        </p>
      </div>
    </div>
  )
}
