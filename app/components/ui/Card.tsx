'use client'

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'info' | 'verification'
  className?: string
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const base = 'rounded-xl border shadow-sm'
  const variants = {
    default: 'bg-white border-[var(--color-border-subtle)]',
    info: 'bg-[var(--color-info-tint)] border-[var(--color-signal-blue)]/20',
    verification: 'bg-white border-[var(--color-signal-blue)]/30 shadow-md',
  }
  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
