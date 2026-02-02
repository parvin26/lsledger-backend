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
    <div className="form-card" style={{ paddingTop: '2rem', maxWidth: '560px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.svg" alt="" width="48" height="32" style={{ display: 'block' }} />
          <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Lighthouse Ledger</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {GUEST_MODE_ENABLED ? 'Guest session' : session?.email ?? 'Loading…'}
          </span>
          {!GUEST_MODE_ENABLED && session !== null && (
            <button
              type="button"
              onClick={signOut}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem' }}
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      {showMainContent ? (
        <>
          <h1 className="heading">Dashboard</h1>
          <p className="helper">Create a new learning entry or open one from your learning timeline.</p>
          {error && <p className="error-msg" role="alert">{error}</p>}
          <button type="button" onClick={handleCreateEntry} className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating…' : 'Create entry'}
          </button>
        </>
      ) : (
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Loading session…</p>
      )}

      {/* Timeline always mounted so GET /api/entries runs on dashboard load (guest or authed). */}
      <DashboardTimeline onEntryClick={setDetailEntry} />

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
            className="form-card"
            style={{ maxWidth: '400px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="entry-detail-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {detailEntry.title}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {detailEntry.evidence_summary}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Status: {detailEntry.status}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text)', marginBottom: '1rem' }}>
              {detailEntry.status === 'Under review'
                ? 'Complete the assessment to get a verification link.'
                : 'This entry has not been reviewed yet. Add evidence and complete the assessment to get a verification link.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {detailEntry.status === 'Under review' ? (
                <Link
                  href={`/assessment?entry_id=${detailEntry.id}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Continue assessment
                </Link>
              ) : (
                <>
                  <Link
                    href={`/add?entry_id=${detailEntry.id}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    {detailEntry.file_evidence_id ? 'View / replace file & continue' : 'Add evidence & continue'}
                  </Link>
                </>
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
