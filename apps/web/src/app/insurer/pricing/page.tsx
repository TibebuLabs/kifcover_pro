'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

interface Rule { id: string; ruleKey: string; operator: string; value: string; multiplier: number }
interface Product { id: string; name: string; category: string; pricingRules: Rule[] }
interface RuleForm { productId: string; ruleKey: string; operator: string; value: string; multiplier: number }

const OPERATORS = [
  { value: 'gt',   label: '> Greater than' },
  { value: 'lt',   label: '< Less than' },
  { value: 'eq',   label: '= Equals' },
  { value: 'bool', label: '✓ Is true' },
]

const COMMON_KEYS = ['vehicleAge', 'age', 'hasPreExistingCondition', 'highRiskLocation', 'travelDays', 'smoker', 'floodZone']

export default function InsurerPricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [err, setErr] = useState('')

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<RuleForm>()

  useEffect(() => {
    api.get('/insurer/products').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const onAdd = async (data: RuleForm) => {
    setErr('')
    try {
      await api.post(`/insurer/products/${data.productId}/pricing-rules`, {
        ruleKey: data.ruleKey, operator: data.operator,
        value: String(data.value), multiplier: +data.multiplier,
      })
      const r = await api.get('/insurer/products')
      setProducts(r.data)
      reset()
      setAdding(false)
    } catch (e: any) { setErr(e.response?.data?.message || 'Failed to add rule') }
  }

  const onRemove = async (ruleId: string) => {
    try {
      await api.delete(`/insurer/pricing-rules/${ruleId}`)
      const r = await api.get('/insurer/products')
      setProducts(r.data)
    } catch {}
  }

  return (
    <>
      <DashboardHeader title="Pricing Rules" subtitle="Configure dynamic risk-based premium multipliers per product." />
      <main className="p-8 flex-1 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setAdding(v => !v)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Rule
          </Button>
        </div>

        {adding && (
          <Card>
            <h3 className="font-display text-lg font-bold text-primary mb-6">New Pricing Rule</h3>
            <form onSubmit={handleSubmit(onAdd)} className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Product</label>
                <select {...register('productId', { required: true })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none">
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Risk Factor</label>
                <input list="ruleKeys" {...register('ruleKey', { required: true })} placeholder="e.g. vehicleAge"
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none" />
                <datalist id="ruleKeys">{COMMON_KEYS.map(k => <option key={k} value={k} />)}</datalist>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface">Operator</label>
                <select {...register('operator', { required: true })}
                  className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-sm focus:outline-none">
                  {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <Input label="Threshold Value" placeholder="e.g. 5" {...register('value', { required: true })} />
              <Input label="Multiplier (e.g. 0.15 = +15%)" type="number" step="0.01" placeholder="0.15"
                {...register('multiplier', { required: true })} />
              {err && <p className="col-span-2 text-xs text-error">{err}</p>}
              <div className="col-span-2 flex gap-3">
                <Button type="submit" loading={isSubmitting}>Add Rule</Button>
                <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-border-subtle h-32 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-6">
            {products.filter(p => (p.pricingRules?.length ?? 0) > 0).map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden">
                <div className="px-6 py-4 bg-surface-container-low border-b border-border-subtle flex items-center gap-3">
                  <h3 className="font-display font-bold text-primary">{p.name}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">{p.category}</span>
                  <span className="text-xs text-on-surface-variant ml-auto">{p.pricingRules.length} rule{p.pricingRules.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {p.pricingRules.map(r => (
                    <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                      <code className="text-sm font-mono bg-surface-container px-3 py-1 rounded-lg text-primary">{r.ruleKey}</code>
                      <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">{r.operator}</span>
                      <span className="text-sm font-semibold text-on-surface">{r.value}</span>
                      <span className="ml-auto text-sm font-bold text-secondary">+{Math.round(r.multiplier * 100)}%</span>
                      <button onClick={() => onRemove(r.id)} className="text-error hover:text-error/70 transition-colors ml-2">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {products.every(p => !p.pricingRules?.length) && (
              <Card><div className="text-center py-16 text-on-surface-variant">No pricing rules yet. Add rules to adjust premiums based on risk factors.</div></Card>
            )}
          </div>
        )}
      </main>
    </>
  )
}
