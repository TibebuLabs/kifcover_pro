'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

function getRoleLabel(role?: string) {
  switch (role) {
    case 'PLATFORM_ADMIN':     return { label: 'Platform Admin', color: 'bg-red-100 text-red-700' }
    case 'INSURANCE_PROVIDER': return { label: 'Insurer', color: 'bg-violet-100 text-violet-700' }
    case 'PARTNER_ADMIN':      return { label: 'Partner', color: 'bg-amber-100 text-amber-700' }
    default:                   return { label: 'Customer', color: 'bg-primary/10 text-primary' }
  }
}

function getSettingsPath(role?: string) {
  switch (role) {
    case 'PARTNER_ADMIN': return '/partner/settings'
    default:              return '/dashboard/account'
  }
}

function getSecurityPath() {
  return '/dashboard/security'
}

export function UserMenu() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, close])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); buttonRef.current?.focus() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, close])

  // Close on route change
  useEffect(() => { close() }, [pathname, close])

  if (!user) return null

  const { label: roleLabel, color: roleColor } = getRoleLabel(user.role)
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()

  const menuItems = [
    { icon: 'person',       label: 'My Profile',  href: getSettingsPath(user.role) },
    { icon: 'settings',     label: 'Settings',     href: getSettingsPath(user.role) },
    { icon: 'security',     label: 'Security',     href: getSecurityPath() },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-on-primary text-xs font-bold shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="hidden md:flex flex-col items-start min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate leading-tight max-w-[120px]">
            {user.firstName} {user.lastName}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wide ${roleColor.split(' ')[1]} leading-tight`}>
            {roleLabel}
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 hidden md:block"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-border-subtle shadow-elevated overflow-hidden z-50 animate-in">
          {/* User info header */}
          <div className="px-5 py-4 bg-surface-container-low border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-on-primary text-sm font-bold shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                {user.phone && (
                  <p className="text-xs text-on-surface-variant truncate">{user.phone}</p>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${roleColor}`}>
                {roleLabel}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                user.kycStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-700'
                  : user.kycStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
              }`}>
                {user.kycStatus === 'VERIFIED' ? 'Verified' : user.kycStatus === 'REJECTED' ? 'Rejected' : 'Pending KYC'}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive(item.href)
                    ? 'bg-primary-container/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-border-subtle py-1.5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
