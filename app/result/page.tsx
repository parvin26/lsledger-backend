'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getVerification } from '@/lib/ledgerApi'
import { TopHeader, Card, Badge, CopyLinkRow } from '@/app/components/ui'
import { getConfidenceVariant } from '@/app/components/ui'

type LayerDescriptor = 'Strong' | 'Adequate' | 'Needs work'
const LAYER_NAMES = ['Explanation', 'Application', 'Trade-offs / limits', 'Reflection / next steps'] as const

type ResultState = {
  public_id: string | null
  confidence_band: string
  capability_summary: string
  layer1_descriptor?: LayerDescriptor | null
  layer2_descriptor?: LayerDescriptor | null
  layer3_descriptor?: LayerDescriptor | null
  layer4_descriptor?: LayerDescriptor | null
} | null | undefined

function ResultContentInner() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<ResultState>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = sessionStorage.getItem('ll_result')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setResult({
          public_id: parsed.public_id ?? null,
          confidence_band: parsed.confidence_band ?? '',
          capability_summary: parsed.capability_summary ?? '',
          layer1_descriptor: parsed.layer1_descriptor ?? null,
          layer2_descriptor: parsed.layer2_descriptor ?? null,
          layer3_descriptor: parsed.layer3_descriptor ?? null,
          layer4_descriptor: parsed.layer4_descriptor ?? null,
        })
        sessionStorage.removeItem('ll_result')
        return
      } catch {
        // fall through to URL/backend
      }
    }

    const publicIdFromUrl = searchParams.get('public_id')?.trim()
    if (!publicIdFromUrl) {
      setResult(null)
      return
    }

    let cancelled = false
    getVerification(publicIdFromUrl)
      .then((data) => {
        if (cancelled) return
        setResult({
          public_id: data.public_id,
          confidence_band: data.confidenceBand,
          capability_summary: data.capabilitySummary,
          layer1_descriptor: data.layer1_descriptor ?? null,
          layer2_descriptor: data.layer2_descriptor ?? null,
          layer3_descriptor: data.layer3_descriptor ?? null,
          layer4_descriptor: data.layer4_descriptor ?? null,
        })
      })
      .catch(() => {
        if (!cancelled) setResult(null)
      })
    return () => { cancelled = true }
  }, [searchParams])

  const publicId = result?.public_id ?? ''
  const confidence = result?.confidence_band ?? ''
  const summary = result?.capability_summary ?? ''
  const hasVerification = publicId && (confidence === 'Medium' || confidence === 'High')
  const layerDescriptors: (LayerDescriptor | null | undefined)[] = result
    ? [result.layer1_descriptor, result.layer2_descriptor, result.layer3_descriptor, result.layer4_descriptor]
    : []
  const hasBreakdown = layerDescriptors.some(Boolean)
  const recordUrl = typeof window !== 'undefined' ? `${window.location.origin}/record/${publicId}` : `/record/${publicId}`

  if (result === undefined) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[560px] mx-auto">
          <TopHeader backHref="/dashboard" title="Assessment result" />
          <p className="text-[var(--color-muted-text)] mt-6">Loading…</p>
        </div>
      </div>
    )
  }
  if (result === null) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[560px] mx-auto">
          <TopHeader backHref="/dashboard" title="Assessment result" />
          <p className="helper text-[var(--color-muted-text)] mt-6">No result found. Start from the dashboard.</p>
          <Link href="/dashboard" className="btn-secondary inline-block mt-3 no-underline">
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '1rem 1rem 2rem' }}>
      <div className="max-w-[560px] mx-auto">
        <header className="bg-lighthouse-navy text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 rounded-none">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm font-medium mb-4 text-white/90 no-underline"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Assessment result</h1>
          <p className="text-base mt-1 text-white/90">Your answers have been evaluated.</p>
        </header>

        <div className="mt-6 space-y-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-2">
              Confidence band
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getConfidenceVariant(confidence)}>
                {confidence || '—'}
              </Badge>
              {confidence && (
                <span className="text-sm text-[var(--color-muted-text)]">
                  {confidence === 'High' && 'Strong evidence of capability.'}
                  {confidence === 'Medium' && 'Reasonable evidence of capability.'}
                  {confidence === 'Low' && 'Limited evidence. Consider adding more context.'}
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-2">
              Capability summary
            </div>
            <div
              className="p-4 rounded-lg bg-white border border-[var(--color-border-subtle)]"
              style={{ color: 'var(--color-deep-slate)', lineHeight: 1.6 }}
            >
              {summary || '—'}
            </div>
          </div>

          {hasBreakdown && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-3">
                Breakdown
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LAYER_NAMES.map((name, i) => (
                  <div
                    key={name}
                    className="flex justify-between items-center p-3 rounded-lg bg-white border border-[var(--color-border-subtle)]"
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--color-lighthouse-navy)' }}>
                      {name}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-deep-slate)' }}>
                      {layerDescriptors[i] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasVerification && (
            <Card variant="verification" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-[var(--color-muted-text)]">Verification record</span>
                <Badge variant="status-verified">Verified</Badge>
              </div>
              {hasBreakdown && (
                <p className="text-sm mb-4" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.6 }}>
                  {LAYER_NAMES.map((name, i) => `${name.toLowerCase()}: ${layerDescriptors[i] ?? '—'}`).join('; ')}.
                </p>
              )}
              <Link
                href={`/record/${publicId}`}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold text-white bg-ledger-crimson hover:brightness-110 no-underline mb-4"
              >
                View verification record
              </Link>
              <CopyLinkRow
                url={recordUrl}
                label="Shareable verification link"
                helperText="Share this secure link with employers, institutions, or collaborators to verify this capability review."
              />
            </Card>
          )}

          {!hasVerification && confidence && (
            <p className="text-sm text-[var(--color-muted-text)]">
              No public verification record was issued for this assessment.
            </p>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold border-2 border-lighthouse-navy text-lighthouse-navy hover:bg-lighthouse-navy/5 no-underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[560px] mx-auto">
          <TopHeader backHref="/dashboard" title="Assessment result" />
          <p className="text-[var(--color-muted-text)] mt-6">Loading…</p>
        </div>
      </div>
    }>
      <ResultContentInner />
    </Suspense>
  )
}
