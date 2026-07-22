'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { insurerApi } from '@/lib/api'

interface Product {
  id: string; name: string; category: string; basePrice: number
  coverageAmount: number; durationDays: number; status: string; isActive: boolean
  features: string[]; description: string
  pricingRules?: Array<{ id: string; ruleKey: string; multiplier: number }>
  premiumTiers?: Array<{ id: string; label: string; premium: number }>
}

const CATEGORIES = ['AUTO','HEALTH','TRAVEL','GADGET','LIFE','AGRICULTURE','SME']

const CATEGORY_CONFIG: Record<string, { icon: string; gradient: string; bg: string }> = {
  AUTO:        { icon: 'directions_car',    gradient: 'from-blue-500 to-indigo-600',    bg: 'bg-blue-50' },
  HEALTH:      { icon: 'favorite',          gradient: 'from-rose-500 to-pink-600',      bg: 'bg-rose-50' },
  TRAVEL:      { icon: 'flight',            gradient: 'from-cyan-500 to-blue-500',      bg: 'bg-cyan-50' },
  GADGET:      { icon: 'smartphone',        gradient: 'from-violet-500 to-purple-600',  bg: 'bg-violet-50' },
  LIFE:        { icon: 'shield_with_heart', gradient: 'from-emerald-500 to-teal-600',   bg: 'bg-emerald-50' },
  AGRICULTURE: { icon: 'agriculture',       gradient: 'from-amber-500 to-orange-600',   bg: 'bg-amber-50' },
  SME:         { icon: 'storefront',        gradient: 'from-indigo-500 to-violet-600',  bg: 'bg-indigo-50' },
}

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
  const [filter, setFilter] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>()

  const load = () => {
    setLoading(true)
    insurerApi.products().then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const onCreate = async (data: ProductForm) => {
    setErr(''); setCreating(true)
    try {
      await insurerApi.createProduct({ ...data, features: [], basePrice: +data.basePrice, coverageAmount: +data.coverageAmount, durationDays: +data.durationDays })
      reset(); setShowCreate(false); load()
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed') }
    setCreating(false)
  }

  const publish = async (id: string) => {
    try { await insurerApi.publishProduct(id); load() } catch {}
  }
  const suspend = async (id: string) => {
    try { await insurerApi.suspendProduct(id); load() } catch {}
  }

  const filtered = filter ? products.filter(p => p.category === filter) : products
  const counts = CATEGORIES.map(c => ({ cat: c, count: products.filter(p => p.category === c).length }))

  return (
    <>
      <DashboardHeader title="Product Catalog" subtitle="Create, manage, and publish insurance products to the marketplace." />
      <main className="p-8 flex-1 space-y-6">
        {/* Category filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all ${
              !filter ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-border-subtle text-on-surface-variant hover:border-primary/30'
            }`}>
            All ({products.length})
          </button>
          {counts.filter(c => c.count > 0).map(c => {
            const cfg = CATEGORY_CONFIG[c.cat]
            return (
              <button key={c.cat} onClick={() => setFilter(filter === c.cat ? '' : c.cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all ${
                  filter === c.cat ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-border-subtle text-on-surface-variant hover:border-primary/30'
                }`}>
                <span className={`material-symbols-outlined text-[16px] ${filter === c.cat ? 'text-on-primary' : cfg?.bg.replace('bg-', 'text-')}`}>{cfg?.icon}</span>
                {c.cat} ({c.count})
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(v => !v)} className="shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Product
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <Card className="border-2 border-primary/20 !shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">add_box</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-primary">Create New Product</h3>
                <p className="text-xs text-on-surface-variant">Fill in details to publish to marketplace</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onCreate)} className="grid grid-cols-2 gap-4">
              <Input label="Product Name" icon="inventory_2" error={errors.name?.message}
                {...register('name', { required: 'Required' })} />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Category</label>
                <select {...register('category', { required: 'Required' })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-2xl text-sm focus:outline-none focus:border-primary transition-colors">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Description</label>
                <textarea rows={2} {...register('description', { required: 'Required' })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-2xl text-sm focus:outline-none resize-none focus:border-primary transition-colors" />
              </div>
              <Input label="Base Price (ETB)" type="number" icon="payments"
                {...register('basePrice', { required: 'Required', min: 1 })} />
              <Input label="Coverage Amount (ETB)" type="number" icon="shield"
                {...register('coverageAmount', { required: 'Required', min: 1 })} />
              <Input label="Duration (days)" type="number" icon="calendar_today"
                {...register('durationDays', { required: 'Required', min: 1 })} />
              {err && <p className="col-span-2 text-xs text-error flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span>{err}</p>}
              <div className="col-span-2 flex gap-3">
                <Button type="submit" loading={creating}>Create Product</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Product cards */}
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl border h-36 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(p => {
              const cfg = CATEGORY_CONFIG[p.category] ?? CATEGORY_CONFIG.AUTO
              return (
                <div key={p.id} className="bg-white rounded-3xl border border-border-subtle shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                  <div className="flex">
                    {/* Category gradient strip */}
                    <div className={`w-2 bg-gradient-to-b ${cfg.gradient}`} />

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md`}>
                              <span className="material-symbols-outlined text-white text-[20px]">{cfg.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-primary text-lg leading-tight">{p.name}</h3>
                              <span className="text-xs text-on-surface-variant">{p.category}</span>
                            </div>
                            <Badge
                              label={p.status === 'PUBLISHED' ? 'Live' : p.status === 'SUSPENDED' ? 'Suspended' : 'Draft'}
                              variant={p.status === 'PUBLISHED' ? 'success' : p.status === 'SUSPENDED' ? 'error' : 'neutral'}
                              dot
                            />
                          </div>

                          <p className="text-sm text-on-surface-variant mb-4 line-clamp-1">{p.description}</p>

                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div className="bg-surface-container-low rounded-2xl p-3">
                              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Base Price</p>
                              <p className="text-base font-extrabold text-primary">ETB {p.basePrice.toLocaleString()}</p>
                            </div>
                            <div className="bg-surface-container-low rounded-2xl p-3">
                              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Coverage</p>
                              <p className="text-base font-extrabold text-primary">ETB {p.coverageAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-surface-container-low rounded-2xl p-3">
                              <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider mb-1">Duration</p>
                              <p className="text-base font-extrabold text-primary">{p.durationDays} days</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4">
                            {(p.pricingRules?.length ?? 0) > 0 && (
                              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">price_change</span>
                                {p.pricingRules!.length} pricing rule{p.pricingRules!.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {(p.premiumTiers?.length ?? 0) > 0 && (
                              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">layer</span>
                                {p.premiumTiers!.length} tier{p.premiumTiers!.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {p.status === 'PUBLISHED' ? (
                            <button onClick={() => suspend(p.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 border-2 border-rose-200 px-4 py-2.5 rounded-2xl hover:bg-rose-50 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">pause</span>
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => publish(p.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 border-2 border-emerald-200 px-4 py-2.5 rounded-2xl hover:bg-emerald-50 transition-colors">
                              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                              Publish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <Card>
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">inventory_2</span>
                  <p className="text-on-surface-variant font-medium">{filter ? 'No products in this category' : 'No products yet'}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Create your first product to get started</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </>
  )
}
