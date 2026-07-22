'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { insurerApi } from '@/lib/api'

interface Rule { id: string; ruleKey: string; operator: string; value: string; multiplier: number }
interface Product { id: string; name: string; category: string; pricingRules: Rule[] }

const OPERATORS = [
  { value: 'gt',   label: '> Greater than', icon: 'greater_than' },
  { value: 'lt',   label: '< Less than',    icon: 'less_than' },
  { value: 'eq',   label: '= Equals',       icon: 'equal' },
  { value: 'bool', label: '✓ Is true',      icon: 'check' },
]

const COMMON_KEYS = [
  { key: 'vehicleAge',              label: 'Vehicle Age',        icon: 'directions_car' },
  { key: 'age',                     label: 'Age',                icon: 'person' },
  { key: 'hasPreExistingCondition', label: 'Pre-existing',       icon: 'medical_services' },
  { key: 'highRiskLocation',        label: 'High-risk Location', icon: 'location_on' },
  { key: 'travelDays',              label: 'Travel Days',        icon: 'flight' },
  { key: 'smoker',                  label: 'Smoker',             icon: 'smoking_rooms' },
  { key: 'floodZone',              label: 'Flood Zone',         icon: 'water' },
]

interface RuleForm { productId: string; ruleKey: string; operator: string; value: string; multiplier: number }

export default function InsurerPricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<RuleForm>()

  useEffect(() => {
    insurerApi.products().then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const onAdd = async (data: RuleForm) => {
    setErr('')
    try {
      await insurerApi.addRule(data.productId, {
        ruleKey: data.ruleKey, operator: data.operator,
        value: String(data.value), multiplier: +data.multiplier,
      })
      const r = await insurerApi.products()
      setProducts(r.data)
      reset()
      setAdding(false)
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed to add rule') }
  }

  const onRemove = async (ruleId: string) => {
    try {
      await insurerApi.removeRule(ruleId)
      const r = await insurerApi.products()
      setProducts(r.data)
    } catch {}
  }

  const totalRules = products.reduce((sum, p) => sum + (p.pricingRules?.length ?? 0), 0)

  return (
    <>
      <DashboardHeader title="Dynamic Pricing Engine" subtitle="Configure risk-adjustment multipliers to optimize premiums per product." />
      <main className="p-8 flex-1 space-y-6">
        {/* Summary row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-2xl">
            <span className="material-symbols-outlined text-primary text-[18px]">price_change</span>
            <span className="text-sm font-bold text-primary">{totalRules}</span>
            <span className="text-xs text-on-surface-variant">rules active</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-2xl">
            <span className="material-symbols-outlined text-violet-600 text-[18px]">inventory_2</span>
            <span className="text-sm font-bold text-violet-600">{products.length}</span>
            <span className="text-xs text-on-surface-variant">products</span>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setAdding(v => !v)} className="shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Rule
            </Button>
          </div>
        </div>

        {/* Add rule form */}
        {adding && (
          <Card className="border-2 border-primary/20 !shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">add</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-primary">New Pricing Rule</h3>
                <p className="text-xs text-on-surface-variant">Add a risk factor multiplier to any product</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onAdd)} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Product</label>
                <select {...register('productId', { required: true })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-2xl text-sm focus:outline-none focus:border-primary transition-colors">
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Risk Factor</label>
                <input list="ruleKeys" {...register('ruleKey', { required: true })} placeholder="e.g. vehicleAge"
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-2xl text-sm focus:outline-none focus:border-primary transition-colors" />
                <datalist id="ruleKeys">{COMMON_KEYS.map(k => <option key={k.key} value={k.key} />)}</datalist>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Operator</label>
                <select {...register('operator', { required: true })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-2xl text-sm focus:outline-none focus:border-primary transition-colors">
                  {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <Input label="Threshold Value" placeholder="e.g. 5" {...register('value', { required: true })} />
              <Input label="Multiplier (0.15 = +15%)" type="number" step="0.01" placeholder="0.15"
                {...register('multiplier', { required: true })} />
              {err && <p className="col-span-2 text-xs text-error flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">error</span>{err}</p>}
              <div className="col-span-2 flex gap-3">
                <Button type="submit" loading={isSubmitting}>Add Rule</Button>
                <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Rules by product */}
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-3xl border h-40 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-5">
            {products.filter(p => (p.pricingRules?.length ?? 0) > 0).map(p => (
              <div key={p.id} className="bg-white rounded-3xl border border-border-subtle shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[18px]">price_change</span>
                  </div>
                  <h3 className="font-display font-bold text-primary">{p.name}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">{p.category}</span>
                  <span className="text-xs text-on-surface-variant ml-auto">{p.pricingRules.length} rule{p.pricingRules.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {p.pricingRules.map(r => {
                    const op = OPERATORS.find(o => o.value === r.operator)
                    return (
                      <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-lowest transition-colors">
                        <code className="text-sm font-mono bg-primary/5 text-primary px-3 py-1.5 rounded-xl font-semibold">{r.ruleKey}</code>
                        <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-lg">{op?.label ?? r.operator}</span>
                        <span className="text-sm font-bold text-on-surface">{r.value}</span>
                        <div className="ml-auto flex items-center gap-3">
                          <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">+{Math.round(r.multiplier * 100)}%</span>
                          <button onClick={() => onRemove(r.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {products.every(p => !p.pricingRules?.length) && (
              <Card>
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">price_change</span>
                  <p className="text-on-surface-variant font-medium">No pricing rules yet</p>
                  <p className="text-xs text-on-surface-variant mt-1">Add rules to adjust premiums based on risk factors</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </>
  )
}
