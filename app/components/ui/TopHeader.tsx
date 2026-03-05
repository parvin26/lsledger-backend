'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface TopHeaderProps {
  backHref: string
  backLabel?: string
  title: string
  subtitle?: string
  stepPill?: string
  navyBand?: boolean
}

export function TopHeader({
  backHref,
  backLabel = 'Dashboard',
  title,
  subtitle,
  stepPill,
  navyBand = false,
}: TopHeaderProps) {
  return (
    <header className={navyBand ? 'bg-lighthouse-navy text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-5 rounded-none' : ''}>
      <div className="max-w-[720px] mx-auto">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium mb-4 min-h-[44px] py-2 -ml-2 pr-2"
          style={{
            color: navyBand ? 'rgba(255,255,255,0.9)' : 'var(--color-muted-text)',
            textDecoration: 'none',
          }}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} aria-hidden />
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className="text-2xl sm:text-[1.875rem] font-semibold tracking-tight"
              style={{
                color: navyBand ? '#fff' : 'var(--color-lighthouse-navy)',
                marginBottom: subtitle ? '0.25rem' : 0,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-base sm:text-lg"
                style={{
                  color: navyBand ? 'rgba(255,255,255,0.9)' : 'var(--color-deep-slate)',
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {stepPill && (
            <span
              className="shrink-0 text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded-full border"
              style={{
                color: navyBand ? 'rgba(255,255,255,0.9)' : 'var(--color-deep-slate)',
                background: navyBand ? 'rgba(255,255,255,0.12)' : 'var(--color-card-shell)',
                borderColor: navyBand ? 'rgba(255,255,255,0.3)' : 'var(--color-divider)',
              }}
            >
              {stepPill}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
