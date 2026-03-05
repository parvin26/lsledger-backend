'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface StickyActionBarProps {
  backHref: string
  backLabel: string
  primaryLabel: string
  primaryHref?: string
  onPrimaryClick?: () => void
  primaryDisabled?: boolean
  primaryLoading?: boolean
  helperText?: string
  /** Form id for submit button when bar is outside form */
  formId?: string
}

export function StickyActionBar({
  backHref,
  backLabel,
  primaryLabel,
  primaryHref,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,
  helperText,
  formId,
}: StickyActionBarProps) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-10 mt-8 pt-4 pb-6 px-4 -mx-4 sm:px-0 sm:mx-0 sm:pt-6"
      style={{
        background: 'var(--color-app-bg)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[720px] mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium min-h-[44px] py-2 -ml-2 pr-2"
          style={{ color: 'var(--color-deep-slate)', textDecoration: 'none' }}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} aria-hidden />
          {backLabel}
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          {helperText && (
            <span className="text-xs text-[var(--color-muted-text)] order-last w-full sm:order-none sm:w-auto">
              {helperText}
            </span>
          )}
          {primaryHref ? (
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold text-white bg-ledger-crimson hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-crimson no-underline"
            >
              {primaryLabel}
            </Link>
          ) : (
            <button
              type="submit"
              form={formId || undefined}
              disabled={primaryDisabled || primaryLoading}
              onClick={onPrimaryClick}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold text-white bg-ledger-crimson hover:brightness-110 active:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ledger-crimson"
            >
              {primaryLoading ? 'Submitting…' : primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
