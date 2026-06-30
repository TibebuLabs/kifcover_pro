import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-[40px] p-16 relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 z-10">
            <h2 className="font-display text-4xl font-bold text-on-primary mb-6 max-w-xl">
              Join us in building the rails that will power the future of insurance in Ethiopia.
            </h2>
            <p className="text-on-primary/70 text-lg mb-10 max-w-lg">
              Whether you're a fintech, bank, e-commerce platform, or insurer — KifCover gives you the infrastructure to launch and scale embedded insurance in days, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-secondary-fixed-dim transition-colors text-center"
              >
                Get started for free
              </Link>
              <Link
                href="#"
                className="border border-white/20 text-on-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors text-center"
              >
                Talk to our team
              </Link>
            </div>
          </div>

          {/* Decorative */}
          <div className="hidden lg:flex flex-col gap-4 z-10">
            {[
              { icon: 'rocket_launch', label: 'Go live in days' },
              { icon: 'security', label: 'Bank-grade security' },
              { icon: 'support_agent', label: '24/7 support' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-secondary-fixed">{item.icon}</span>
                <span className="text-sm font-semibold text-on-primary/80">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Blob decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
