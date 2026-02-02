'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getVerification } from '@/lib/ledgerApi'

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
      .catch((err) => {
        if (!cancelled) setResult(null)
        if (typeof console !== 'undefined' && console.error) console.error('Result fallback failed:', err)
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

  if (result === undefined) return <div className="form-card" style={{ paddingTop: '2rem' }}><p>Loading…</p></div>
  if (result === null) {
    return (
      <div className="form-card" style={{ paddingTop: '2rem' }}>
        <p className="helper">No result found. Start from the dashboard.</p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="form-card" style={{ paddingTop: '2rem', maxWidth: '560px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </header>
      <h1 className="heading">Assessment result</h1>
      <p className="helper">Your answers have been evaluated.</p>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Confidence band</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>{confidence || '—'}</div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Capability summary</div>
          <div style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.6 }}>{summary || '—'}</div>
        </div>

        {hasBreakdown && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Breakdown</div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.7 }}>
              {LAYER_NAMES.map((name, i) => (
                <li key={name}>{name}: {layerDescriptors[i] ?? '—'}</li>
              ))}
            </ul>
          </div>
        )}

        {hasVerification && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Verification record</div>
            <span className="verified-badge">Verified</span>
            {hasBreakdown && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.6 }}>
                {LAYER_NAMES.map((name, i) => `${name.toLowerCase()}: ${layerDescriptors[i] ?? '—'}`).join('; ')}.
              </p>
            )}
            <Link
              href={`/verify/${publicId}`}
              style={{ display: 'inline-block', marginTop: '0.75rem', color: 'var(--navy)', fontWeight: 600, wordBreak: 'break-all' }}
            >
              View verification record
            </Link>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Shareable verification link</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Share this secure link with employers, institutions, or collaborators to verify this capability review.
              </p>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/verify/${publicId}` : `/verify/${publicId}`}
              </p>
            </div>
          </div>
        )}

        {!hasVerification && confidence && (
          <p style={{ marginTop: '1rem', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
            No public verification record was issued for this assessment.
          </p>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="form-card" style={{ paddingTop: '2rem' }}><p>Loading…</p></div>}>
      <ResultContentInner />
    </Suspense>
  )
}
