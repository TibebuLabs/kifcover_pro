const products = [
  { icon: 'directions_car', name: 'Auto Insurance', desc: 'Comprehensive vehicle protection against accidents, theft, and liability.' },
  { icon: 'medical_services', name: 'Health Insurance', desc: 'Medical coverage for hospitalisation, outpatient care, and wellness.' },
  { icon: 'flight_takeoff', name: 'Travel Insurance', desc: 'Peace of mind for unexpected travel events — globally covered.' },
  { icon: 'devices', name: 'Gadget Insurance', desc: 'Protect smartphones and electronics from damage and theft.' },
  { icon: 'agriculture', name: 'Agriculture', desc: 'Parametric crop insurance protecting small-holder farmers from climate risk.' },
  { icon: 'account_balance', name: 'Life & Credit', desc: 'Life and credit life insurance for individuals and lending platforms.' },
  { icon: 'business_center', name: 'Business Insurance', desc: 'SME coverage for fire, theft, liability, and business interruption.' },
  { icon: 'pregnant_woman', name: 'Micro-Insurance', desc: 'Affordable micro-products for gig workers and low-income earners.' },
]

export function ProductsSection() {
  return (
    <section className="py-24 bg-surface" id="sectors">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-display text-4xl font-bold text-primary mb-2">Products for every sector</h2>
            <p className="text-on-surface-variant">Ready-to-deploy insurance for every customer need</p>
          </div>
          <button className="text-primary font-semibold text-sm border-b-2 border-primary pb-0.5 hover:text-secondary hover:border-secondary transition-colors self-start md:self-auto">
            View all products →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-white p-6 rounded-2xl shadow-card border border-border-subtle hover:-translate-y-1 hover:shadow-card-hover transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <span className="material-symbols-outlined">{product.icon}</span>
              </div>
              <h4 className="font-semibold text-primary text-sm mb-1">{product.name}</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">{product.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
