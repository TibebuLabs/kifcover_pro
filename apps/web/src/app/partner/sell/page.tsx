'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'

interface Product { id: string; name: string; category: string; basePrice: number; coverageAmount: number; durationDays: number }
interface Quote { id: string; premium: number; coverageAmount: number; expiresAt: string }

type Step = 'product' | 'customer' | 'quote' | 'payment' | 'success'

const RISK_FIELDS: Record<string, Array<{ key: string; label: string; type: string }>> = {
  AUTO:        [{ key: 'vehicleAge',  label: 'Vehicle Age (years)',  type: 'number' }],
  HEALTH:      [{ key: 'age',         label: 'Customer Age',         type: 'number' }],
  TRAVEL:      [{ key: 'travelDays',  label: 'Travel Days',          type: 'number' }],
  GADGET:      [{ key: 'deviceValue', label: 'Device Value (ETB)',   type: 'number' }],
  LIFE:        [{ key: 'age',         label: 'Customer Age',         type: 'number' }],
  AGRICULTURE: [{ key: 'farmSizeHa',  label: 'Farm Size (ha)',       type: 'number' }],
}

export default function PartnerSellPage() {
  const [step, setStep] = useState<Step>('product')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [policyId, setPolicyId] = useState('')
  const [err, setErr] = useState('')

  const customerForm = useForm<{ email: string; firstName: string; lastName: string; phone: string }>()
  const riskForm = useForm()

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data)).catch(() => {})
  }, [])

  const onSelectProduct = (p: Product) => { setSelectedProduct(p); setStep('customer') }

  const onCustomer = async (data: any) => {
    // Generate quote with basic metadata
    setErr('')
    try {
      const fields = RISK_FIELDS[selectedProduct!.category] ?? []
      const metadata: Record<string,any> = {}
      fields.forEach(f => { metadata[f.key] = Number(riskForm.getValues(f.key)) || 0 })
      const res = await api.post('/quotes/generate', { productId: selectedProduct!.id, metadata })
      setQuote(res.data)
      setStep('quote')
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed to generate quote') }
  }

  const onBind = async (provider: string) => {
    if (!quote) return
    setErr('')
    try {
      const policyRes = await api.post('/policies/issue', { quoteId: quote.id })
      await api.post('/payments/initiate', { policyId: policyRes.data.id, amount: quote.premium, provider })
      setPolicyId(policyRes.data.id)
      setStep('success')
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed to issue policy') }
  }

  const reset = () => { setStep('product'); setSelectedProduct(null); setQuote(null); setErr(''); setPolicyId('') }

  return (
    <>
      <DashboardHeader title="Sell Insurance" subtitle="Issue a new policy for a customer through your channel." />
      <main className="p-8 flex-1 max-w-2xl space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs">
          {(['product', 'customer', 'quote', 'payment', 'success'] as Step[]).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`font-semibold ${step === s ? 'text-primary' : 'text-outline'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < arr.length - 1 && <span className="text-outline">›</span>}
            </div>
          ))}
        </div>

        {err && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">{err}</div>}

        {/* Step: Select product */}
        {step === 'product' && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-primary">Select Product</h3>
            {products.map(p => (
              <button key={p.id} onClick={() => onSelectProduct(p)}
                className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-border-subtle hover:border-primary/30 hover:bg-surface-container-low transition-all text-left shadow-card">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">shield</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{p.name}</p>
                  <p className="text-xs text-on-surface-variant">{p.category} · Coverage: ETB {p.coverageAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">ETB {p.basePrice.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant">{p.durationDays} days</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step: Customer + risk details */}
        {step === 'customer' && selectedProduct && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Customer Details — {selectedProduct.name}</h3>
            <form onSubmit={customerForm.handleSubmit(onCustomer)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" {...customerForm.register('firstName', { required: true })} />
                <Input label="Last Name"  {...customerForm.register('lastName', { required: true })} />
              </div>
              <Input label="Email" type="email" icon="mail" {...customerForm.register('email', { required: true })} />
              <Input label="Phone" type="tel" icon="phone" placeholder="+251 9x xxx xxxx" {...customerForm.register('phone')} />

              {(RISK_FIELDS[selectedProduct.category] ?? []).map(f => (
                <Input key={f.key} label={f.label} type={f.type} {...riskForm.register(f.key)} />
              ))}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('product')}>← Back</Button>
                <Button type="submit" className="flex-1">Get Quote →</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Step: Quote */}
        {step === 'quote' && quote && selectedProduct && (
          <Card>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <h3 className="font-display text-xl font-bold text-primary">Quote Generated</h3>
              <p className="text-xs text-on-surface-variant">Valid until {new Date(quote.expiresAt).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-container/80 rounded-2xl p-8 text-white text-center mb-6">
              <p className="text-white/70 text-sm mb-1">Annual Premium</p>
              <p className="text-4xl font-bold">ETB {quote.premium.toLocaleString()}</p>
              <p className="text-white/70 text-xs mt-1">Coverage: ETB {quote.coverageAmount.toLocaleString()}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('customer')}>← Back</Button>
              <Button className="flex-1" onClick={() => setStep('payment')}>Proceed to Payment →</Button>
            </div>
          </Card>
        )}

        {/* Step: Payment */}
        {step === 'payment' && quote && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Collect Payment — ETB {quote.premium.toLocaleString()}</h3>
            <div className="space-y-3">
              {[
                { id: 'telebirr', name: 'Telebirr',    icon: 'phone_android' },
                { id: 'bank',     name: 'Bank Transfer', icon: 'account_balance' },
                { id: 'card',     name: 'Card',         icon: 'credit_card' },
              ].map(p => (
                <button key={p.id} onClick={() => onBind(p.id)}
                  className="w-full flex items-center gap-4 p-4 bg-surface-container-low border border-border-subtle rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined text-primary">{p.icon}</span>
                  <span className="font-semibold text-on-surface">{p.name}</span>
                  <span className="material-symbols-outlined text-outline ml-auto">chevron_right</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <Card>
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              <h3 className="font-display text-2xl font-bold text-primary mb-2">Policy Issued!</h3>
              <p className="text-on-surface-variant mb-8">The customer's policy has been successfully created and is now active.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={reset}>Sell Another Policy</Button>
                <Button variant="outline" href="/partner/policies">View All Policies</Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </>
  )
}
