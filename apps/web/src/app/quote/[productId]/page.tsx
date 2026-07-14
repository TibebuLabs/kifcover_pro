'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

export default function QuotePage() {
  const { productId } = useParams<{ productId: string }>()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">calculate</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-primary mb-2">Get a Quote</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Product: <span className="font-semibold">{productId}</span>
          </p>
          <p className="text-on-surface-variant mb-8">Quote generation coming soon.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Marketplace
          </Link>
        </div>
      </main>
    </>
  )
}
