const partners = ['Telebirr', 'Commercial Bank', 'Awash Bank', 'Dashen Bank', 'Safaricom', 'Kifiya', 'Yenepay', 'HelloCash']

export function LogoScroll() {
  const doubled = [...partners, ...partners]

  return (
    <section className="py-14 border-y border-border-subtle bg-surface-container-lowest overflow-hidden">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-8">
        Trusted by leading platforms
      </p>
      <div className="logo-mask overflow-hidden">
        <div className="animate-marquee flex gap-16 px-8">
          {doubled.map((name, i) => (
            <span key={i} className="font-display text-xl font-bold text-primary/40 hover:text-primary/80 transition-colors whitespace-nowrap cursor-default">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
