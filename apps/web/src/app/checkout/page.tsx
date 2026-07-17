'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { quoteApi, policyApi, paymentApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Quote {
  id: string; productName: string; premium: number; coverageAmount: number
  durationDays: number; metadata: Record<string, any>; expiresAt: string; createdAt: string
  product?: { id: string; name: string; description: string; features: string[]; category: string }
}

const paymentMethods = [
  { id: 'TELEBIRR', label: 'Telebirr', icon: 'smartphone', desc: 'Pay instantly via Telebirr mobile wallet', color: 'bg-red-50 border-red-200 text-red-700' },
  { id: 'BANK', label: 'Bank Transfer', icon: 'account_balance', desc: 'Direct bank transfer (processing 1-2 days)', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'CARD', label: 'Credit/Debit Card', icon: 'credit_card', desc: 'Pay with Visa or Mastercard', color: 'bg-purple-50 border-purple-200 text-purple-700' },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const quoteId = searchParams.get('quoteId')
  const { user } = useAuthStore()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState('TELEBIRR')
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment')
  const [policyNumber, setPolicyNumber] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!quoteId) { setLoading(false); return }
    quoteApi.get(quoteId)
      .then(r => { setQuote(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [quoteId])

  const handlePurchase = async () => {
    if (!quote) return
    setProcessing(true)
    setError('')
    try {
      const policyRes = await policyApi.issue(quote.id)
      const policy = policyRes.data
      setPolicyNumber(policy.policyNumber || policy.id)

      const payRes = await paymentApi.initiate({
        policyId: policy.id,
        amount: quote.premium,
        provider: selectedProvider,
      })

      if (payRes.data?.checkoutUrl) {
        window.open(payRes.data.checkoutUrl, '_blank')
      }

      setStep('success')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Purchase failed. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background-main flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </>
    )
  }

  if (!quoteId || !quote) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background-main flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">receipt_long</span>
            <h1 className="font-display text-2xl font-bold text-primary mb-2">No Quote Found</h1>
            <p className="text-on-surface-variant text-sm mb-8">
              {!quoteId ? 'No quote ID provided.' : 'This quote may have expired or is invalid.'}
            </p>
            <Link href="/marketplace" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all">
              Browse Products
            </Link>
          </div>
        </main>
      </>
    )
  }

  if (step === 'success') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background-main flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-primary mb-3">Policy Activated!</h1>
            <p className="text-on-surface-variant mb-2">Your insurance policy is now active.</p>
            <p className="text-sm text-on-surface-variant mb-8">
              Policy Number: <span className="font-mono font-bold text-primary">{policyNumber}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/policies" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all">
                View My Policies
              </Link>
              <Link href="/dashboard" className="border border-border-subtle px-6 py-3 rounded-xl font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-main">
        <div className="bg-gradient-to-r from-primary to-primary-container py-12 text-on-primary">
          <div className="max-w-[1280px] mx-auto px-8">
            <Link href={quote.product?.id ? `/quote/${quote.product.id}` : '/marketplace'}
              className="inline-flex items-center gap-1 text-on-primary/70 hover:text-on-primary text-sm mb-4 transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Quote
            </Link>
            <h1 className="font-display text-3xl font-bold">Checkout</h1>
            <p className="text-on-primary/70 text-sm mt-1">Review your quote and complete payment</p>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Payment method selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* KYC Check */}
              {user?.kycStatus !== 'VERIFIED' && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">KYC Verification Required</p>
                      <p className="text-xs text-amber-600">You must complete identity verification before purchasing a policy.</p>
                    </div>
                  </div>
                  <Link href="/kyc" className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap">
                    Verify Now
                  </Link>
                </div>
              )}

              {/* Payment method */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">payment</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary">Payment Method</h3>
                    <p className="text-xs text-on-surface-variant">Choose how you&apos;d like to pay</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setSelectedProvider(pm.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedProvider === pm.id
                          ? `${pm.color} border-current shadow-sm`
                          : 'border-border-subtle hover:border-outline-variant bg-surface-container-lowest'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl ${selectedProvider === pm.id ? '' : 'text-on-surface-variant'}`}>
                        {pm.icon}
                      </span>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${selectedProvider === pm.id ? '' : 'text-on-surface'}`}>{pm.label}</p>
                        <p className="text-xs text-on-surface-variant">{pm.desc}</p>
                      </div>
                      {selectedProvider === pm.id && (
                        <span className="material-symbols-outlined text-primary">radio_button_checked</span>
                      )}
                      {selectedProvider !== pm.id && (
                        <span className="material-symbols-outlined text-outline">radio_button_unchecked</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              {/* Confirm button */}
              <Button
                onClick={handlePurchase}
                loading={processing}
                size="lg"
                className="w-full"
                disabled={user?.kycStatus !== 'VERIFIED'}
              >
                <span className="material-symbols-outlined text-[20px] mr-2">lock</span>
                Confirm & Pay — ETB {quote.premium.toLocaleString()}
              </Button>
              <p className="text-[10px] text-on-surface-variant text-center">
                By confirming, you agree to KifCover&apos;s Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Right: Order summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <h3 className="font-display text-lg font-bold text-primary mb-6">Order Summary</h3>

                {/* Product */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-subtle">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">shield</span>
                  </div>
                  <div>
                    <p className="font-semibold text-primary text-sm">{quote.productName}</p>
                    {quote.product?.category && <Badge label={quote.product.category} variant="info" />}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border-subtle">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Coverage Amount</span>
                    <span className="font-semibold text-primary">ETB {quote.coverageAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Duration</span>
                    <span className="font-semibold text-on-surface">{quote.durationDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Quote Valid Until</span>
                    <span className="text-on-surface text-xs">{new Date(quote.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-on-surface">Total to Pay</span>
                  <span className="text-2xl font-bold text-primary">ETB {quote.premium.toLocaleString()}</span>
                </div>

                {/* Features */}
                {quote.product?.features && quote.product.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border-subtle">
                    <p className="text-xs font-semibold text-on-surface-variant mb-3">Includes:</p>
                    <div className="space-y-2">
                      {quote.product.features.slice(0, 4).map((f: string) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-[14px]">check_circle</span>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
