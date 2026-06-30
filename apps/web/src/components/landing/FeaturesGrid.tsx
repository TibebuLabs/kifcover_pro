import Link from 'next/link'

export function FeaturesGrid() {
  return (
    <section id="solutions" className="py-24 max-w-[1280px] mx-auto px-8">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl font-bold text-primary mb-4">Your one-stop solution for embedding insurance</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">Infrastructure that grows with your ambition — from startup to enterprise scale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large feature */}
        <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-border-subtle shadow-card hover:shadow-card-hover transition-all group">
          <div className="bg-primary-container/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">api</span>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-3">Unified Distribution Channel</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Launch insurance solutions that offer easy policy management and full accessibility — online or offline — through a single integration point. One API, infinite reach.
          </p>
          <div className="bg-surface-container-low rounded-2xl p-4 border border-border-subtle font-mono text-sm text-primary">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-on-surface-variant">index.js</span>
            </div>
            <pre className="text-xs leading-relaxed overflow-x-auto text-primary/80">{`const policy = await KifCover.quote({
  product: "AUTO_COMPREHENSIVE",
  partner_id: "PARTNER_001"
});
// → { premium: 1200, qr_code: "KIF-..." }`}</pre>
          </div>
        </div>

        {/* Small feature */}
        <div className="bg-secondary-container/10 rounded-3xl p-10 border border-border-subtle hover:bg-secondary-container/20 transition-all group flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">verified_user</span>
            <h3 className="text-xl font-bold text-primary mb-3">Multiple Products</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Auto, health, travel, gadget, agriculture — explore a variety of insurance products or design your own custom product.
            </p>
          </div>
          <Link href="/marketplace" className="flex items-center gap-2 text-secondary font-semibold text-sm mt-8 group-hover:gap-3 transition-all">
            Explore Products
            <span className="material-symbols-outlined text-[20px]">arrow_right_alt</span>
          </Link>
        </div>

        {/* Instant claims */}
        <div className="bg-surface-container-low rounded-3xl p-10 border border-border-subtle hover:shadow-card-hover transition-all">
          <span className="material-symbols-outlined text-primary text-4xl mb-6 block">speed</span>
          <h3 className="text-xl font-bold text-primary mb-3">Instant Claims</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Automated claims support from submission to payout. OCR document processing, fraud detection, and API-triggered settlements in under 48 hours.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full w-[68%] bg-secondary rounded-full" />
            </div>
            <span className="text-xs font-semibold text-secondary">68% auto-approved</span>
          </div>
        </div>

        {/* White label */}
        <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-border-subtle flex flex-col md:flex-row items-center gap-10 hover:shadow-card-hover transition-all">
          <div className="flex-1">
            <span className="material-symbols-outlined text-primary text-4xl mb-6 block">palette</span>
            <h3 className="text-xl font-bold text-primary mb-3">White Label Solution</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Distribute and manage insurance solutions under your own brand identity. Fully customisable widgets, checkout flows, and policy documents.
            </p>
          </div>
          <div className="w-full md:w-64 bg-background-alt rounded-2xl p-6 border border-border-subtle flex flex-col gap-3">
            <div className="h-2 w-full bg-primary-fixed/30 rounded" />
            <div className="h-2 w-3/4 bg-primary-fixed/20 rounded" />
            <div className="h-2 w-1/2 bg-primary-fixed/10 rounded" />
            <div className="h-10 w-full bg-primary rounded-lg mt-2 flex items-center justify-center">
              <span className="text-xs font-bold text-on-primary">Your Brand · Powered by KifCover</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
