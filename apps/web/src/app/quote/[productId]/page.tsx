'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { productApi, quoteApi } from '@/lib/api'

interface Product {
  id: string; name: string; description: string; descriptionAm?: string
  category: string; basePrice: number; coverageAmount: number; durationDays: number
  features: string[]; exclusions: string[]; status: string; isActive: boolean
  pricingRules: any[]; premiumTiers: any[]
}

interface PremiumResult {
  premium: number; multiplier: number; coverageAmount: number; durationDays: number
  productName: string; matchedTier?: string; basePrice: number
}

const categoryIcons: Record<string, string> = {
  AUTO: 'directions_car', HEALTH: 'medical_services', TRAVEL: 'flight_takeoff',
  GADGET: 'devices', AGRICULTURE: 'agriculture', LIFE: 'favorite', SME: 'business_center',
}

const categoryRiskFields: Record<string, { key: string; label: string; type: string; placeholder: string; options?: string[] }[]> = {
  AUTO: [
    { key: 'vehicleMake', label: 'Vehicle Make', type: 'text', placeholder: 'e.g. Toyota' },
    { key: 'vehicleModel', label: 'Vehicle Model', type: 'text', placeholder: 'e.g. Corolla' },
    { key: 'vehicleYear', label: 'Vehicle Year', type: 'number', placeholder: 'e.g. 2022' },
    { key: 'engineSize', label: 'Engine Size (cc)', type: 'number', placeholder: 'e.g. 1800' },
    { key: 'vehicleAge', label: 'Vehicle Age (years)', type: 'number', placeholder: 'e.g. 3' },
    { key: 'highRiskLocation', label: 'High-Risk Area?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
  ],
  HEALTH: [
    { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 35' },
    { key: 'hasPreExistingCondition', label: 'Pre-existing Condition?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
    { key: 'highRiskLocation', label: 'High-Risk Area?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
  ],
  TRAVEL: [
    { key: 'destination', label: 'Destination Country', type: 'text', placeholder: 'e.g. UAE' },
    { key: 'travelDays', label: 'Number of Days', type: 'number', placeholder: 'e.g. 14' },
    { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 30' },
    { key: 'highRiskDestination', label: 'High-Risk Destination?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
  ],
  GADGET: [
    { key: 'deviceType', label: 'Device Type', type: 'select', options: ['Smartphone', 'Tablet', 'Laptop', 'Other'], placeholder: '' },
    { key: 'deviceValue', label: 'Device Value (ETB)', type: 'number', placeholder: 'e.g. 45000' },
    { key: 'deviceAge', label: 'Device Age (months)', type: 'number', placeholder: 'e.g. 6' },
  ],
  LIFE: [
    { key: 'age', label: 'Age', type: 'number', placeholder: 'e.g. 35' },
    { key: 'hasPreExistingCondition', label: 'Pre-existing Condition?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
    { key: 'coverageLevel', label: 'Coverage Level', type: 'select', options: ['Basic', 'Standard', 'Premium'], placeholder: '' },
  ],
  AGRICULTURE: [
    { key: 'cropType', label: 'Crop Type', type: 'text', placeholder: 'e.g. Teff' },
    { key: 'acreage', label: 'Acreage (ha)', type: 'number', placeholder: 'e.g. 5' },
    { key: 'highRiskLocation', label: 'High-Risk Area?', type: 'select', options: ['No', 'Yes'], placeholder: '' },
  ],
  SME: [
    { key: 'businessType', label: 'Business Type', type: 'text', placeholder: 'e.g. Retail' },
    { key: 'numEmployees', label: 'Number of Employees', type: 'number', placeholder: 'e.g. 12' },
    { key: 'annualRevenue', label: 'Annual Revenue (ETB)', type: 'number', placeholder: 'e.g. 2000000' },
  ],
}

export default function QuotePage() {
  const { productId } = useParams<{ productId: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [premiumResult, setPremiumResult] = useState<PremiumResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'details' | 'quote'>('details')

  useEffect(() => {
    productApi.get(productId)
      .then(r => { setProduct(r.data); setLoading(false) })
      .catch(() => {
        setProduct({
          id: productId, name: 'Auto Comprehensive', description: 'Full vehicle protection against accidents, theft, and third-party liability.',
          category: 'AUTO', basePrice: 1200, coverageAmount: 500000, durationDays: 365,
          features: ['Accident coverage', 'Theft protection', 'Third-party liability', 'Roadside assistance'],
          exclusions: ['Pre-existing damage', 'Normal wear and tear', 'Driver under influence'],
          status: 'PUBLISHED', isActive: true, pricingRules: [], premiumTiers: [
            { id: '1', label: 'Basic', premium: 900, sumInsuredMin: 0, sumInsuredMax: 300000 },
            { id: '2', label: 'Standard', premium: 1200, sumInsuredMin: 300000, sumInsuredMax: 600000 },
            { id: '3', label: 'Premium', premium: 1800, sumInsuredMin: 600000, sumInsuredMax: 1000000 },
          ],
        })
        setLoading(false)
      })
  }, [productId])

  const riskFields = (product?.category ? categoryRiskFields[product.category] : null) || categoryRiskFields.AUTO

  const handleFieldChange = (key: string, value: string) => {
    setMetadata(prev => ({ ...prev, [key]: value }))
    setPremiumResult(null)
  }

  const calculatePremium = async () => {
    if (!product) return
    setCalculating(true)
    setError('')
    try {
      const payload: Record<string, any> = {}
      for (const [k, v] of Object.entries(metadata)) {
        if (v === '' || v === undefined) continue
        payload[k] = k === 'highRiskLocation' || k === 'hasPreExistingCondition' || k === 'highRiskDestination'
          ? v === 'Yes'
          : (k === 'age' || k === 'vehicleYear' || k === 'vehicleAge' || k === 'travelDays' || k === 'engineSize' || k === 'deviceAge' || k === 'numEmployees' || k === 'acreage' || k === 'deviceValue' || k === 'annualRevenue')
            ? Number(v) : v
      }
      const res = await productApi.calcPremium(product.id, payload)
      setPremiumResult(res.data)
      setStep('quote')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to calculate premium. Please try again.')
    } finally {
      setCalculating(false)
    }
  }

  const handleBuyNow = async () => {
    if (!premiumResult) return
    setQuoteLoading(true)
    setError('')
    try {
      const res = await quoteApi.generate(product!.id, metadata)
      const quoteId = res.data?.id || res.data?.quote?.id
      router.push(`/checkout?quoteId=${quoteId}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate quote. Please try again.')
      setQuoteLoading(false)
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

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background-main flex items-center justify-center px-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error_outline</span>
            <p className="text-on-surface-variant mb-6">Product not found.</p>
            <Link href="/marketplace" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all">
              Back to Marketplace
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-main">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-primary-container py-16 text-on-primary">
          <div className="max-w-[1280px] mx-auto px-8">
            <Link href="/marketplace" className="inline-flex items-center gap-1 text-on-primary/70 hover:text-on-primary text-sm mb-6 transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Marketplace
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">{categoryIcons[product.category] || 'shield'}</span>
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">{product.name}</h1>
                <Badge label={product.category} variant="info" />
              </div>
            </div>
            <p className="text-on-primary/70 text-sm max-w-2xl leading-relaxed">{product.description}</p>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Product info + risk form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Features */}
              {product.features?.length > 0 && (
                <Card>
                  <h3 className="font-display text-lg font-bold text-primary mb-4">What&apos;s Covered</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Exclusions */}
              {product.exclusions?.length > 0 && (
                <Card>
                  <h3 className="font-display text-lg font-bold text-primary mb-4">Exclusions</h3>
                  <div className="space-y-2">
                    {product.exclusions.map((e: string) => (
                      <div key={e} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-error/60 text-[18px]">cancel</span>
                        {e}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Risk parameters form */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary">Your Details</h3>
                    <p className="text-xs text-on-surface-variant">Fill in the fields below to get a personalised premium.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {riskFields.map((field) => (
                    <div key={field.key}>
                      {field.type === 'select' ? (
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-1.5">{field.label}</label>
                          <select
                            value={metadata[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full px-4 py-3 bg-surface-container-alt border border-border-subtle rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          >
                            <option value="">Select...</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      ) : (
                        <Input
                          label={field.label}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={metadata[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button onClick={calculatePremium} loading={calculating} size="lg" className="w-full sm:w-auto">
                    <span className="material-symbols-outlined text-[20px] mr-2">calculate</span>
                    Calculate Premium
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: Quote summary */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <h3 className="font-display text-lg font-bold text-primary mb-6">Quote Summary</h3>

                {/* Product info */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border-subtle">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Product</span>
                    <span className="font-semibold text-on-surface">{product.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Coverage</span>
                    <span className="font-semibold text-primary">ETB {(premiumResult?.coverageAmount ?? product.coverageAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Duration</span>
                    <span className="font-semibold text-on-surface">{premiumResult?.durationDays ?? product.durationDays} days</span>
                  </div>
                  {product.premiumTiers?.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Tiers Available</span>
                      <span className="font-semibold text-on-surface">{product.premiumTiers.length}</span>
                    </div>
                  )}
                </div>

                {/* Premium breakdown */}
                {premiumResult ? (
                  <div className="space-y-3 mb-6 pb-6 border-b border-border-subtle">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Base Premium</span>
                      <span className="text-on-surface">ETB {premiumResult.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Risk Multiplier</span>
                      <span className={`font-semibold ${premiumResult.multiplier > 1 ? 'text-amber-600' : 'text-secondary'}`}>
                        ×{premiumResult.multiplier.toFixed(2)}
                      </span>
                    </div>
                    {premiumResult.matchedTier && (
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Matched Tier</span>
                        <Badge label={premiumResult.matchedTier} variant="info" />
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-2 border-t border-border-subtle">
                      <span className="text-sm font-semibold text-on-surface">Your Premium</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">ETB {premiumResult.premium.toLocaleString()}</span>
                        <p className="text-[10px] text-on-surface-variant">incl. all taxes</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 mb-6 border-b border-border-subtle">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">receipt_long</span>
                    <p className="text-sm text-on-surface-variant">Fill in your details and click &quot;Calculate Premium&quot; to see your personalised quote.</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm mb-4">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                )}

                {/* Buy Now */}
                {premiumResult ? (
                  <Button onClick={handleBuyNow} loading={quoteLoading} size="lg" className="w-full">
                    <span className="material-symbols-outlined text-[20px] mr-2">shopping_cart</span>
                    Buy Now — ETB {premiumResult.premium.toLocaleString()}
                  </Button>
                ) : (
                  <Button disabled size="lg" className="w-full">
                    Get a quote first
                  </Button>
                )}

                <p className="text-[10px] text-on-surface-variant text-center mt-3">
                  Quote valid for 48 hours · Instant policy issuance
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
