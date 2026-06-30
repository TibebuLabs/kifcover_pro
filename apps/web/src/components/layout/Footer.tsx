import Link from 'next/link'

const footerLinks = {
  Products: ['Auto Insurance', 'Health Insurance', 'Travel Insurance', 'Gadget Protection', 'Agriculture'],
  Solutions: ['API & SDKs', 'White Label', 'Claims Engine', 'Partner Portal', 'Analytics'],
  Company: ['About Us', 'Careers', 'Partners', 'Blog', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Compliance', 'Cookie Policy'],
}

export function Footer() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="max-w-[1280px] mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_with_heart
              </span>
              <span className="font-display text-2xl font-bold">KifCover</span>
            </div>
            <p className="text-sm text-on-primary/70 leading-relaxed mb-6">
              KifCover is an InsurTech company powering embedded insurance for digital businesses across Ethiopia. We partner with licensed insurers to make insurance instant, accessible, and affordable.
            </p>
            <div className="flex gap-3">
              {['public', 'alternate_email', 'share'].map((icon) => (
                <button key={icon} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h5 className="text-xs font-bold uppercase tracking-widest text-secondary-fixed mb-4">{section}</h5>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-on-primary/70 hover:text-secondary-fixed transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-primary/50">
          <p>© {new Date().getFullYear()} KifCover InsurTech. All Rights Reserved.</p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="w-4 h-3 bg-green-600 rounded-sm inline-block" />
            <span>Ethiopia · Addis Ababa</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
