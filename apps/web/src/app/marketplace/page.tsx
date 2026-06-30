'use client'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import Link from 'next/link'

const categories = ['All', 'AUTO', 'HEALTH', 'TRAVEL', 'GADGET', 'AGRICULTURE', 'LIFE']

const categoryIcons: Record<string, string> = {
  All: 'grid_view',
  AUTO: 'directions_car',
  HEALTH: 'medical_services',
  TRAVEL: 'flight_takeoff',
  GADGET: 'devices',
  AGRICULTURE: 'agriculture',
  LIFE: 'favorite',
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  coverageAmount: number
  durationDays: number
  features: string[]
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = activeCategory !== 'All' ? { category: activeCategory } : {}
        const res = await api.get('/products', { params })
        setProducts(res.data)
      } catch {
        // Use placeholder data in dev
        setProducts([
          { id: '1', name: 'Auto Comprehensive', description: 'Full vehicle protection against accidents, theft, and third-party liability.', category: 'AUTO', basePrice: 1200, coverageAmount: 500000, durationDays: 365, features: ['Accident coverage', 'Theft protection', 'Third-party liability'] },
          { id: '2', name: 'Health Basic', description: 'Essential medical coverage for hospitalisation and outpatient care.', category: 'HEALTH', basePrice: 800, coverageAmount: 200000, durationDays: 365, features: ['Hospitalisation', 'Emergency care', 'Prescriptions'] },
          { id: '3', name: 'Travel International', description: 'Comprehensive travel protection for international trips.', category: 'TRAVEL', basePrice: 350, coverageAmount: 1000000, durationDays: 30, features: ['Medical evacuation', 'Trip cancellation', 'Baggage loss'] },
          { id: '4', name: 'Gadget Shield', description: 'Protect your smartphone and electronics from damage and theft.', category: 'GADGET', basePrice: 200, coverageAmount: 50000, durationDays: 365, features: ['Accidental damage', 'Theft', 'Screen protection'] },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [activeCategory])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-main">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-container py-20 text-on-primary">
          <div className="max-w-[1280px] mx-auto px-8">
            <h1 className="font-display text-5xl font-bold mb-4">Insurance Marketplace</h1>
            <p className="text-on-primary/70 text-lg mb-8 max-w-2xl">
              Choose from a range of carefully designed insurance products. Get an instant quote and be covered in minutes.
            </p>
            <div className="relative max-w-lg">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-8 py-12">
          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-white border border-border-subtle text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{categoryIcons[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border-subtle p-6 animate-pulse">
                  <div className="w-12 h-12 bg-surface-container rounded-xl mb-4" />
                  <div className="h-4 bg-surface-container rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface-container rounded w-full mb-1" />
                  <div className="h-3 bg-surface-container rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">search_off</span>
              <p className="text-on-surface-variant mt-4">No products found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function ProductCard({ product }: { product: Product }) {
  const icon = categoryIcons[product.category] || 'shield'

  return (
    <div className="bg-white rounded-2xl border border-border-subtle shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all group flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
            <span className="material-symbols-outlined text-primary group-hover:text-on-primary transition-colors">{icon}</span>
          </div>
          <Badge label={product.category} variant="info" />
        </div>
        <h3 className="font-display text-lg font-bold text-primary mb-2">{product.name}</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-5">{product.description}</p>
        <ul className="space-y-2">
          {product.features?.slice(0, 3).map((f: string) => (
            <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 border-t border-border-subtle bg-surface-container-lowest rounded-b-2xl flex items-center justify-between">
        <div>
          <p className="text-xs text-on-surface-variant">Starting from</p>
          <p className="text-lg font-bold text-primary">ETB {product.basePrice.toLocaleString()}<span className="text-xs font-normal text-on-surface-variant">/yr</span></p>
        </div>
        <Link
          href={`/quote/${product.id}`}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-all active:scale-[0.97]"
        >
          Get Quote →
        </Link>
      </div>
    </div>
  )
}
