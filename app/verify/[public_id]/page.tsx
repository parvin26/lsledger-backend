'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVerification } from '@/lib/ledgerApi'
import type { VerificationRecord } from '@/types/api'

const LAYER_NAMES = ['Explanation', 'Application', 'Trade-offs / limits', 'Reflection / next steps'] as const

export default function VerifyPage() {
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
        if (!cancelled) setError(err?.message ?? 'Failed to load verification')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [publicId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
        <div className="form-card" style={{ paddingTop: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="heading" style={{ color: 'var(--color-lighthouse-navy)' }}>Capability Review Record</h1>
          <p style={{ color: 'var(--color-muted-text)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
        <div className="form-card" style={{ paddingTop: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="Lighthouse Ledger" width={160} height={180} style={{ display: 'block', objectFit: 'contain' }} />
          </Link>
          <h1 className="heading" style={{ color: 'var(--color-lighthouse-navy)' }}>Capability Review Record</h1>
          <p className="error-msg" style={{ marginTop: '1rem' }}>{error ?? 'Not found'}</p>
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
      <div className="ds-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Lighthouse Ledger" width={160} height={180} style={{ display: 'block', objectFit: 'contain' }} />
        </Link>
        <h1 className="heading" style={{ color: 'var(--color-lighthouse-navy)' }}>Capability Review Record</h1>
        <p className="helper" style={{ color: 'var(--color-muted-text)' }}>Public verification record. No sign-in required.</p>

        <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Domain</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-deep-slate)' }}>{data.domain}</div>
          </div>

          {data.evidence_summary && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>What was reviewed</div>
              <div style={{ fontSize: '1rem', color: 'var(--color-deep-slate)' }}>{data.evidence_summary}</div>
            </div>
          )}

          {data.intent_prompt && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Learning Intent</div>
              <div style={{ fontSize: '1rem', color: 'var(--color-deep-slate)' }}>{data.intent_prompt}</div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Capability Summary</div>
            <div style={{ fontSize: '1rem', color: 'var(--color-deep-slate)' }}>{data.capabilitySummary}</div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Confidence Band</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: isVerified ? 'var(--color-signal-blue)' : 'var(--color-deep-slate)' }}>{data.confidenceBand}</div>
            {isVerified && <span className="verified-badge" style={{ fontSize: '0.875rem', marginLeft: '0.5rem', color: 'var(--color-signal-blue)' }}>Verified</span>}
          </div>

          {hasLayerBreakdown && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Layer summary</div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)', margin: 0, lineHeight: 1.7 }}>
                {LAYER_NAMES.map((name, i) => `${name}: ${layerDescriptors[i] ?? '—'}`).join('; ')}.
              </p>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Record ID</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--color-muted-text)', wordBreak: 'break-all' }}>{data.public_id}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Date</div>
            <div style={{ fontSize: '1rem', color: 'var(--color-deep-slate)' }}>{date}</div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-divider)', fontSize: '0.875rem', color: 'var(--color-muted-text)', lineHeight: 1.8 }}>
          <p style={{ margin: 0 }}>
            <strong>Disclaimer:</strong> This is a capability review record based on submitted evidence and assessment responses.
            It is not a degree, license, certification, or hiring decision. This record reflects a review of demonstrated
            capabilities at the time of assessment and does not constitute formal accreditation or qualification.
          </p>
        </div>
      </div>
    </div>
  )
}
