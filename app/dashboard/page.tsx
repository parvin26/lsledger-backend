'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser, getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { TimelineEntry } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'
import { DashboardTimeline } from './DashboardTimeline'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailEntry, setDetailEntry] = useState<TimelineEntry | null>(null)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    if (GUEST_MODE_ENABLED) {
      setSession({ email: undefined })
      return
    }
    supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.user) router.replace('/login')
      else setSession({ email: s.user.email ?? undefined })
    })
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_e, s) => {
      if (!s?.user) router.replace('/login')
      else setSession({ email: s.user.email ?? undefined })
    })
    return () => subscription.unsubscribe()
  }, [router])

  async function handleCreateEntry() {
    setError(null)
    setLoading(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        setLoading(false)
        return
      }
      const res = await api.createEntry(token, { title: 'New learning entry', description: '' })
      router.push(`/add?entry_id=${res.entry_id}`)
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) {
        router.replace('/login')
        return
      }
      if (e?.status === 503 && e?.code === 'GUEST_CONFIG') {
        setError('Guest mode is not configured on the server. Set GUEST_USER_ID in .env.local.')
        return
      }
      if (e?.status === 0 && e?.code === 'NETWORK_ERROR') {
        setError('Cannot reach the server. Check your connection, or the service may be temporarily unavailable.')
        return
      }
      setError(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadFile(evidenceId: string) {
    setDownloadLoading(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        return
      }
      const { url } = await api.getEvidenceSignedUrl(token, evidenceId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
    } finally {
      setDownloadLoading(false)
    }
  }

  function signOut() {
    supabaseBrowser.auth.signOut()
    router.replace('/login')
  }

  const showMainContent = GUEST_MODE_ENABLED || session !== null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', color: 'var(--color-deep-slate)' }}>
      {/* Header – keep as-is per prompt */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          maxWidth: '1120px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.png" alt="" width={40} height={46} style={{ display: 'block', objectFit: 'contain' }} />
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-lighthouse-navy)' }}>Lighthouse Ledger</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-muted-text)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(255,255,255,0.5)',
              padding: '0.25rem 0.75rem',
              borderRadius: 9999,
              border: '1px solid var(--color-divider)',
            }}
          >
            Session: {GUEST_MODE_ENABLED ? 'guest' : session?.email ?? 'Loading…'}
          </span>
          {!GUEST_MODE_ENABLED && session !== null && (
            <button type="button" className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={signOut}>
              Sign out
            </button>
          )}
        </div>
      </header>

      {showMainContent ? (
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          {/* Page title and subtitle */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-deep-slate)' }}>
              Start a new learning entry or continue one from your timeline.
            </p>
          </div>

          <div className="dashboard-grid">
            {/* Left panel: Start a new entry */}
            <div>
              <div className="ds-card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
                  Start a new entry
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  Capture something you learned from real work, a project, or a conversation.
                </p>
                {error && <p className="error-msg" role="alert" style={{ marginBottom: '0.75rem' }}>{error}</p>}
                <button
                  type="button"
                  className="btn-primary"
                  disabled={loading}
                  onClick={handleCreateEntry}
                  data-create-entry
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                >
                  {loading ? 'Creating…' : '+ Create entry'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', textAlign: 'center', marginBottom: '1rem' }}>
                  Takes about 3–5 minutes.
                </p>
                <div style={{ textAlign: 'center' }}>
                  <Link
                    href="/#capability-ledger-preview"
                    style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-signal-blue)', textDecoration: 'none' }}
                  >
                    See example entry →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right panel: Timeline */}
            <div>
              <DashboardTimeline onEntryClick={setDetailEntry} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted-text)' }}>Loading session…</p>
        </div>
      )}

      {/* Entry detail modal – unchanged behavior */}
      {detailEntry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-detail-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => setDetailEntry(null)}
        >
          <div
            className="ds-card"
            style={{ maxWidth: '400px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="entry-detail-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
              {detailEntry.title}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>
              {detailEntry.evidence_summary}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', marginBottom: '1rem' }}>
              Status: {detailEntry.status}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '1rem' }}>
              {detailEntry.status === 'Under review'
                ? 'Complete the assessment to get a verification link.'
                : 'This entry has not been reviewed yet. Add evidence and complete the assessment to get a verification link.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {detailEntry.status === 'Under review' ? (
                <Link href={`/assessment?entry_id=${detailEntry.id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Continue assessment
                </Link>
              ) : (
                <Link href={`/add?entry_id=${detailEntry.id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  {detailEntry.file_evidence_id ? 'View / replace file & continue' : 'Add evidence & continue'}
                </Link>
              )}
              <button type="button" onClick={() => setDetailEntry(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
