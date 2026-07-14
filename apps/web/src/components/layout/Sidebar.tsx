'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'

interface NavItem { icon: string; label: string; href: string }

// ── Per-role navigation maps ──────────────────────────────────────────────────

const customerNav: NavItem[] = [
  { icon: 'dashboard',           label: 'Dashboard',    href: '/dashboard' },
  { icon: 'policy',              label: 'My Policies',  href: '/dashboard/policies' },
  { icon: 'assignment_turned_in',label: 'Claims',       href: '/dashboard/claims' },
  { icon: 'payments',            label: 'Payments',     href: '/dashboard/payments' },
  { icon: 'storefront',          label: 'Marketplace',  href: '/marketplace' },
  { icon: 'account_circle',      label: 'My Account',   href: '/dashboard/account' },
  { icon: 'security',            label: 'Security',     href: '/dashboard/security' },
]

const partnerNav: NavItem[] = [
  { icon: 'dashboard',           label: 'Overview',         href: '/partner/dashboard' },
  { icon: 'person_add',          label: 'Sell Insurance',   href: '/partner/sell' },
  { icon: 'group',               label: 'Customers',        href: '/partner/customers' },
  { icon: 'policy',              label: 'Policies',         href: '/partner/policies' },
  { icon: 'payments',            label: 'Payouts',          href: '/partner/payouts' },
  { icon: 'bar_chart',           label: 'Reports',          href: '/partner/reports' },
  { icon: 'api',                 label: 'API Access',       href: '/partner/api-access' },
  { icon: 'settings',            label: 'Settings',         href: '/partner/settings' },
]

const insurerNav: NavItem[] = [
  { icon: 'dashboard',          label: 'Overview',       href: '/insurer/dashboard' },
  { icon: 'inventory_2',        label: 'Products',       href: '/insurer/products' },
  { icon: 'price_change',       label: 'Pricing Rules',  href: '/insurer/pricing' },
  { icon: 'assignment_turned_in',label: 'Claims Queue',  href: '/insurer/claims' },
  { icon: 'analytics',          label: 'Analytics',      href: '/insurer/analytics' },
]

const adminNav: NavItem[] = [
  { icon: 'analytics',       label: 'Analytics',        href: '/admin/analytics' },
  { icon: 'manage_accounts', label: 'Users',            href: '/admin/users' },
  { icon: 'group',           label: 'Partners',         href: '/admin/partners' },
  { icon: 'business',        label: 'Insurers',         href: '/admin/insurers' },
  { icon: 'gavel',           label: 'Compliance',       href: '/admin/compliance' },
  { icon: 'account_balance', label: 'Financials',       href: '/admin/financials' },
  { icon: 'monitor_heart',   label: 'API Monitor',      href: '/admin/api-monitor' },
  { icon: 'history',         label: 'Audit Logs',       href: '/admin/audit' },
]

function getRoleConfig(role?: string): { nav: NavItem[]; label: string; color: string } {
  switch (role) {
    case 'PARTNER_ADMIN':      return { nav: partnerNav,  label: 'Partner',  color: 'text-amber-600' }
    case 'INSURANCE_PROVIDER': return { nav: insurerNav,  label: 'Insurer',  color: 'text-violet-600' }
    case 'PLATFORM_ADMIN':     return { nav: adminNav,    label: 'Admin',    color: 'text-red-600' }
    default:                   return { nav: customerNav, label: 'Customer', color: 'text-primary' }
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { nav, label, color } = getRoleConfig(user?.role)

  // Admins also see the customer nav section
  const showCustomerSection = user?.role === 'PLATFORM_ADMIN'

  const NavLink = ({ icon, label: lbl, href }: NavItem) => (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
        pathname === href || pathname.startsWith(href + '/')
          ? 'bg-primary-container/10 text-primary font-semibold border-r-4 border-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      )}
    >
      <span
        className="material-symbols-outlined text-[22px]"
        style={pathname === href ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {icon}
      </span>
      {lbl}
    </Link>
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col py-6 px-4 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 mb-6">
        <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          shield_with_heart
        </span>
        <span className="font-display text-xl font-bold text-primary">KifCover</span>
      </Link>

      {/* Role badge */}
      <div className="px-4 mb-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${color} bg-surface-container px-2 py-1 rounded-lg`}>
          {label}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {nav.map((item) => <NavLink key={item.href} {...item} />)}

        {/* Admin users also get quick customer navigation */}
        {showCustomerSection && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Platform</p>
            </div>
            {customerNav.slice(0, 3).map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* User identity + logout */}
      <div className="border-t border-outline-variant/30 pt-4 mt-4 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-2 mb-1">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary text-xs font-bold shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
          </div>
        </div>
        <Link href="/developer" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl text-sm transition-colors">
          <span className="material-symbols-outlined text-[20px]">code</span>
          Developer Tools
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-error-container hover:text-on-error-container rounded-xl text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Log Out
        </button>
      </div>
    </aside>
  )
}
