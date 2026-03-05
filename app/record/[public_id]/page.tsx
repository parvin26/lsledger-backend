'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVerification } from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { VerificationRecord } from '@/types/api'
import { Badge, CopyLinkRow } from '@/app/components/ui'
import { getConfidenceVariant } from '@/app/components/ui'

const LAYER_NAMES = ['Explanation', 'Application', 'Trade-offs / limits', 'Reflection / next steps'] as const

export default function RecordPage() {
  const params = useParams()
  const publicId = typeof params?.public_id === 'string' ? params.public_id : ''
  const [data, setData] = useState<VerificationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicId) {
      setLoading(false)
      setError('Invalid verification ID')
      return
    }
    let cancelled = false
    getVerification(publicId)
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err) => {
        if (!cancelled) {
          const apiErr = err as ApiError
          setError(
            apiErr?.status === 404
              ? 'Record not found or not available.'
              : 'Something went wrong.'
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [publicId])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[800px] mx-auto">
          <header className="bg-lighthouse-navy text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 rounded-none">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Capability Review Record</h1>
            <p className="text-sm mt-1 text-white/80">Public record</p>
          </header>
          <p className="text-[var(--color-muted-text)] mt-6">Loading…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[800px] mx-auto">
          <header className="bg-lighthouse-navy text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 rounded-none">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Capability Review Record</h1>
          </header>
          <div className="mt-6 p-6 bg-white rounded-xl border border-[var(--color-border-subtle)]">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.svg" alt="Lighthouse Ledger" width={100} height={80} className="block object-contain" />
            </Link>
            <p className="error-msg" role="alert">{error ?? 'Record not found or not available.'}</p>
            <Link href="/" className="text-sm text-[var(--color-signal-blue)] mt-3 inline-block no-underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const date = new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const isVerified = data.confidenceBand === 'Medium' || data.confidenceBand === 'High'
  const layerDescriptors = [
    data.layer1_descriptor,
    data.layer2_descriptor,
    data.layer3_descriptor,
    data.layer4_descriptor
  ]
  const hasLayerBreakdown = layerDescriptors.some(Boolean)
  const recordUrl = typeof window !== 'undefined' ? `${window.location.origin}/record/${publicId}` : `/record/${publicId}`

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-2" style={{ fontVariant: 'small-caps' }}>
        {label}
      </div>
      <div className="text-base" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '0 1rem 2rem' }}>
      <header className="bg-lighthouse-navy text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 rounded-none">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Capability Review Record</h1>
          <p className="text-sm mt-1 text-white/80">Public record. No sign-in required.</p>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto -mt-2">
        <div className="bg-white rounded-xl border border-[var(--color-border-subtle)] shadow-sm p-6 sm:p-8">
          <Section label="Domain">
            {data.domain}
          </Section>

          {data.evidence_summary && (
            <Section label="What was reviewed">
              {data.evidence_summary}
            </Section>
          )}

          {data.intent_prompt && (
            <Section label="Learning intent">
              {data.intent_prompt}
            </Section>
          )}

          <Section label="Capability summary">
            {data.capabilitySummary}
          </Section>

          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-2" style={{ fontVariant: 'small-caps' }}>
              Confidence band
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getConfidenceVariant(data.confidenceBand)}>
                {data.confidenceBand}
              </Badge>
              {isVerified && (
                <Badge variant="status-verified">Verified</Badge>
              )}
            </div>
          </div>

          {hasLayerBreakdown && (
            <Section label="Layer summary">
              {LAYER_NAMES.map((name, i) => `${name}: ${layerDescriptors[i] ?? '—'}`).join('; ')}.
            </Section>
          )}

          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)] mb-2" style={{ fontVariant: 'small-caps' }}>
              Record ID
            </div>
            <div className="text-sm font-mono text-[var(--color-muted-text)] break-all">
              {data.public_id}
            </div>
          </div>

          <Section label="Date">
            {date}
          </Section>

          <CopyLinkRow
            url={recordUrl}
            label="Shareable record link"
            helperText="Share this link so others can verify this capability review."
          />
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
          <p className="text-sm text-[var(--color-muted-text)] leading-relaxed" style={{ opacity: 0.9 }}>
            <strong>Disclaimer:</strong> This is a capability review record based on submitted evidence and assessment responses.
            It is not a degree, license, certification, or hiring decision. This record reflects a review of demonstrated
            capabilities at the time of assessment and does not constitute formal accreditation or qualification.
          </p>
        </div>
      </div>
    </div>
  )
}
