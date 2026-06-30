import { clsx } from 'clsx'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
}

export function Card({ children, hover, glass, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border-subtle p-6',
        glass
          ? 'glass-card'
          : 'bg-surface-container-lowest shadow-card',
        hover && 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
