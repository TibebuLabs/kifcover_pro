'use client'
import { clsx } from 'clsx'
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import Link from 'next/link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Render as a Next.js Link instead of a button */
  href?: string
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm hover:shadow-md focus-visible:ring-primary',
  secondary: 'bg-secondary text-on-secondary hover:opacity-90 focus-visible:ring-secondary',
  outline: 'border border-border-subtle bg-surface-container-lowest text-primary hover:bg-surface-container-low focus-visible:ring-primary',
  ghost: 'text-primary hover:bg-surface-container-low focus-visible:ring-primary',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, href, ...props }, ref) => {
    const classes = clsx(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    )

    const content: ReactNode = (
      <>
        {loading && (
          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
        )}
        {children}
      </>
    )

    if (href) {
      return (
        <Link href={href} className={clsx(classes, (disabled || loading) && 'pointer-events-none opacity-60')}>
          {content}
        </Link>
      )
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={classes} {...props}>
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'
