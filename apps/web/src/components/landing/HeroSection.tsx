import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 hero-gradient min-h-[88vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-fixed/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-secondary-container/30 border border-secondary/20 px-4 py-1.5 rounded-full mb-8">
            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse-slow" />
            <span className="text-xs font-semibold text-on-secondary-container">Built for modern tech stacks · Ethiopia</span>
          </div>

          <h1 className="font-display text-[60px] leading-[1.1] text-primary mb-6 tracking-tight font-bold">
            Embedded insurance,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Simplified.
            </span>
          </h1>

          <p className="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            KifCover empowers platforms to protect their customers with seamless, instant insurance integrated directly into your product. API-first infrastructure designed for infinite scale.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-primary-container hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.97]"
            >
              Get Started Free
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link
              href="#solutions"
              className="flex items-center gap-2 border border-border-subtle bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              See how it works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            {[
              { value: '50k+', label: 'Policies issued' },
              { value: '99.9%', label: 'API uptime' },
              { value: '< 48h', label: 'Claims processing' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-lg font-bold text-primary">{stat.value}</span>
                <span className="text-xs text-on-surface-variant">{stat.label}</span>
              </div>
            )).reduce((acc: React.ReactNode[], el, i, arr) => [
              ...acc,
              el,
              ...(i < arr.length - 1 ? [<div key={`div-${i}`} className="h-8 w-px bg-outline-variant/30" />] : []),
            ], [])}
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative hidden lg:flex items-center justify-center">
          <div className="relative w-full">
            {/* Main card */}
            <div className="bg-white rounded-[28px] p-2 shadow-2xl border border-border-subtle">
              <div className="bg-surface-container-low rounded-[22px] p-6 space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-on-surface-variant">Platform Overview</p>
                    <p className="text-lg font-bold text-primary">Dashboard</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary-container/30 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-xs font-semibold text-secondary">Live</span>
                  </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Policies', value: '12,847', change: '+8.2%', icon: 'policy' },
                    { label: 'Claims Today', value: '143', change: '-2.1%', icon: 'assignment_turned_in' },
                    { label: 'GWP (ETB)', value: '4.2M', change: '+15.4%', icon: 'trending_up' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-xl p-4 border border-border-subtle">
                      <span className="material-symbols-outlined text-primary text-[20px]">{kpi.icon}</span>
                      <p className="text-xs text-on-surface-variant mt-2">{kpi.label}</p>
                      <p className="text-base font-bold text-primary">{kpi.value}</p>
                      <p className={`text-xs font-semibold ${kpi.change.startsWith('+') ? 'text-secondary' : 'text-error'}`}>
                        {kpi.change}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="bg-white rounded-xl p-4 border border-border-subtle">
                  <p className="text-xs font-semibold text-on-surface-variant mb-3">Policy Volume (30 days)</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {[35, 52, 48, 65, 72, 58, 80, 75, 88, 70, 92, 85].map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${i === 11 ? 'bg-primary' : 'bg-primary-fixed/60'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-8 glass-card p-4 rounded-2xl shadow-xl max-w-[200px] animate-pulse-slow">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container p-2 rounded-full">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant">Claims Paid</p>
                  <p className="text-sm font-bold text-primary">ETB 4.2M+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
