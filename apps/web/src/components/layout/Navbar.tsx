'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const navLinks = [
  { label: 'Sectors', href: '/#sectors' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Developer', href: '/developer' },
  { label: 'Resources', href: '/#resources' },
  { label: 'Company', href: '/#company' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-border-subtle'
          : 'bg-surface-glass backdrop-blur-sm border-b border-outline-variant/30'
      }`}
    >
      <nav className="max-w-[1280px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_with_heart
          </span>
          <span className="font-display text-2xl font-bold text-primary tracking-tight">KifCover</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-on-surface-variant hover:text-primary font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-on-surface-variant border border-border-subtle bg-surface-container-lowest px-4 py-2 rounded-xl hover:bg-surface-container-low transition-all"
          >
            Login
          </Link>
          <Button size="sm" href="/auth/register">
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-on-surface-variant"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-border-subtle px-8 py-6 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-on-surface-variant hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
            <Link href="/auth/login" className="text-center text-sm font-semibold text-primary border border-border-subtle rounded-xl py-3">
              Login
            </Link>
            <Link href="/auth/register" className="text-center text-sm font-semibold bg-primary text-white rounded-xl py-3">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
