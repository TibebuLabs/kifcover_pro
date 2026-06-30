import { clsx } from 'clsx'

interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  dot?: boolean
}

const variantStyles = {
  success: 'bg-secondary-container/30 text-secondary border-secondary/20',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-error-container text-on-error-container border-error/20',
  info: 'bg-primary-fixed/30 text-primary border-primary/20',
  neutral: 'bg-surface-container text-on-surface-variant border-outline-variant',
}

const dotStyles = {
  success: 'bg-secondary',
  warning: 'bg-yellow-500',
  error: 'bg-error',
  info: 'bg-primary',
  neutral: 'bg-outline',
}

export function Badge({ label, variant = 'neutral', dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
      variantStyles[variant]
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotStyles[variant])} />}
      {label}
    </span>
  )
}
