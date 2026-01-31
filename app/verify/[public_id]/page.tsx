'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getVerification } from '@/lib/ledgerApi'

interface VerificationData {
  public_id: string
  domain: string
  capabilitySummary: string
  confidenceBand: 'Low' | 'Medium' | 'High'
  created_at: string
  intent_prompt?: string
}

export default function VerifyPage() {
  const params = useParams()
  const publicId = typeof params?.public_id === 'string' ? params.public_id : ''
  const [data, setData] = useState<VerificationData | null>(null)
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
      <div className="form-card" style={{ paddingTop: '3rem', maxWidth: '800px' }}>
        <h1 className="heading">Capability Review Record</h1>
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="form-card" style={{ paddingTop: '3rem', maxWidth: '800px' }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          <img src="/logo.svg" alt="Lighthouse Ledger" width="120" height="80" style={{ display: 'block' }} />
        </Link>
        <h1 className="heading">Capability Review Record</h1>
        <p className="error-msg" style={{ marginTop: '1rem' }}>{error ?? 'Not found'}</p>
      </div>
    )
  }

  const date = new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const isVerified = data.confidenceBand === 'Medium' || data.confidenceBand === 'High'

  return (
    <div className="form-card" style={{ paddingTop: '2rem', maxWidth: '800px', lineHeight: 1.6 }}>
      <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem' }}>
        <img src="/logo.svg" alt="Lighthouse Ledger" width="120" height="80" style={{ display: 'block' }} />
      </Link>
      <h1 className="heading">Capability Review Record</h1>
      <p className="helper">Public verification record. No sign-in required.</p>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Domain</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>{data.domain}</div>
        </div>

        {data.intent_prompt && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Learning Intent</div>
            <div style={{ fontSize: '1rem', color: 'var(--text)' }}>{data.intent_prompt}</div>
          </div>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Capability Summary</div>
          <div style={{ fontSize: '1rem', color: 'var(--text)' }}>{data.capabilitySummary}</div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Confidence Band</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: isVerified ? 'var(--ledger-crimson)' : 'var(--text)' }}>{data.confidenceBand}</div>
          {isVerified && <span className="verified-badge" style={{ fontSize: '0.875rem', marginLeft: '0.5rem' }}>Verified</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Record ID</div>
          <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{data.public_id}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Date</div>
          <div style={{ fontSize: '1rem', color: 'var(--text)' }}>{date}</div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <p style={{ margin: 0 }}>
          <strong>Disclaimer:</strong> This is a capability review record based on submitted evidence and assessment responses.
          It is not a degree, license, certification, or hiring decision. This record reflects a review of demonstrated
          capabilities at the time of assessment and does not constitute formal accreditation or qualification.
        </p>
      </div>
    </div>
  )
}
