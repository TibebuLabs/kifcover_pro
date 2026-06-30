'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'policy', label: 'My Policies', href: '/dashboard/policies' },
  { icon: 'assignment_turned_in', label: 'Claims', href: '/dashboard/claims' },
  { icon: 'storefront', label: 'Marketplace', href: '/marketplace' },
  { icon: 'account_circle', label: 'My Account', href: '/dashboard/account' },
  { icon: 'security', label: 'Security', href: '/dashboard/security' },
]

const adminItems = [
  { icon: 'analytics', label: 'Analytics', href: '/admin/analytics' },
  { icon: 'group', label: 'Partners', href: '/admin/partners' },
  { icon: 'manage_accounts', label: 'Users', href: '/admin/users' },
  { icon: 'gavel', label: 'Compliance', href: '/admin/compliance' },
  { icon: 'history', label: 'Audit Logs', href: '/admin/audit' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const isAdmin = user?.role === 'PLATFORM_ADMIN' || user?.role === 'INSURANCE_PROVIDER'

  const NavLink = ({ icon, label, href }: typeof navItems[0]) => (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
        pathname === href
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
      {label}
    </Link>
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col py-6 px-4 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-4 mb-8">
        <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          shield_with_heart
        </span>
        <span className="font-display text-xl font-bold text-primary">KifCover</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Admin</p>
            </div>
            {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-outline-variant/30 pt-4 mt-4 space-y-2">
        <Link href="/developer" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl text-sm">
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
