'use client'

export type ConfidenceBand = 'High' | 'Medium' | 'Low'
export type StatusBadge = 'Draft' | 'Submitted' | 'Verified'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'confidence-high' | 'confidence-medium' | 'confidence-low' | 'status-draft' | 'status-submitted' | 'status-verified' | 'neutral'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  'confidence-high': 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30',
  'confidence-medium': 'bg-[var(--color-signal-blue)]/15 text-[var(--color-signal-blue)] border-[var(--color-signal-blue)]/30',
  'confidence-low': 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/40',
  'status-draft': 'bg-[var(--color-muted-text)]/10 text-[var(--color-muted-text)] border-[var(--color-divider)]',
  'status-submitted': 'bg-[var(--color-signal-blue)]/15 text-[var(--color-signal-blue)] border-[var(--color-signal-blue)]/30',
  'status-verified': 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30 font-semibold',
  neutral: 'bg-[var(--color-muted-text)]/10 text-[var(--color-deep-slate)] border-[var(--color-divider)]',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}

export function getConfidenceVariant(band: string): BadgeProps['variant'] {
  const b = band.toLowerCase()
  if (b.includes('high')) return 'confidence-high'
  if (b.includes('medium')) return 'confidence-medium'
  if (b.includes('low')) return 'confidence-low'
  return 'neutral'
}
