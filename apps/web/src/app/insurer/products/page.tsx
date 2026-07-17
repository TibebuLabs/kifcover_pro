'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

interface Product {
  id: string; name: string; category: string; basePrice: number
  coverageAmount: number; durationDays: number; isActive: boolean; features: string[]
  pricingRules?: Array<{ id: string; ruleKey: string; operator: string; value: string; multiplier: number }>
}

const CATEGORIES = ['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE']

interface ProductForm {
  name: string; description: string; category: string
  basePrice: number; coverageAmount: number; durationDays: number
}

export default function InsurerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>()

  const load = () => {
    setLoading(true)
    api.get('/insurer/products').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const onCreate = async (data: ProductForm) => {
    setErr(''); setCreating(true)
    try {
      await api.post('/insurer/products', { ...data, features: [], basePrice: +data.basePrice, coverageAmount: +data.coverageAmount, durationDays: +data.durationDays })
      reset(); setShowCreate(false); load()
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed') }
    setCreating(false)
  }

  const toggleActive = async (p: Product) => {
    try {
      await api.patch(`/insurer/products/${p.id}`, { isActive: !p.isActive })
      load()
    } catch {}
  }

  return (
    <>
      <DashboardHeader title="Insurance Products" subtitle="Manage your product catalog and coverage offerings." />
      <main className="p-8 flex-1 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(v => !v)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </Button>
        </div>

        {showCreate && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">Create Product</h3>
            <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-2 gap-4">
              <Input label="Product Name" icon="inventory_2" error={errors.name?.message}
                {...register('name', { required: 'Required' })} />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Category</label>
                <select {...register('category', { required: 'Required' })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Description</label>
                <textarea rows={2} {...register('description', { required: 'Required' })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none resize-none" />
              </div>
              <Input label="Base Price (ETB)" type="number" icon="payments"
                {...register('basePrice', { required: 'Required', min: 1 })} />
              <Input label="Coverage Amount (ETB)" type="number" icon="shield"
                {...register('coverageAmount', { required: 'Required', min: 1 })} />
              <Input label="Duration (days)" type="number" icon="calendar_today"
                {...register('durationDays', { required: 'Required', min: 1 })} />
              {err && <p className="col-span-2 text-xs text-error">{err}</p>}
              <div className="col-span-2 flex gap-3">
                <Button type="submit" loading={creating}>Create Product</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-24 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-border-subtle p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-bold text-primary">{p.name}</h3>
                      <Badge label={p.category} variant="info" />
                      <Badge label={p.isActive ? 'Active' : 'Inactive'} variant={p.isActive ? 'success' : 'neutral'} dot />
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div><p className="text-xs text-outline mb-0.5">Base Price</p><p className="font-semibold text-primary">ETB {p.basePrice.toLocaleString()}</p></div>
                      <div><p className="text-xs text-outline mb-0.5">Coverage</p><p className="font-semibold text-primary">ETB {p.coverageAmount.toLocaleString()}</p></div>
                      <div><p className="text-xs text-outline mb-0.5">Duration</p><p className="font-semibold text-primary">{p.durationDays} days</p></div>
                    </div>
                    {(p.pricingRules?.length ?? 0) > 0 && (
                      <p className="text-xs text-on-surface-variant mt-3">{p.pricingRules!.length} pricing rule{p.pricingRules!.length !== 1 ? 's' : ''} applied</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        p.isActive ? 'border-error/30 text-error hover:bg-error-container' : 'border-secondary/30 text-secondary hover:bg-secondary-container/20'
                      }`}>
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <Card><div className="text-center py-16"><p className="text-on-surface-variant">No products yet. Create your first product above.</p></div></Card>
            )}
          </div>
        )}
      </main>
    </>
  )
}
