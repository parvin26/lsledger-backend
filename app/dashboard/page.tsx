'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser, getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
      else setError(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    supabaseBrowser.auth.signOut()
    router.replace('/login')
  }

  if (!GUEST_MODE_ENABLED && session === null) return null

  return (
    <div className="form-card" style={{ paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <img src="/logo.svg" alt="" width="48" height="32" style={{ display: 'block' }} />
          <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Lighthouse Ledger</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {GUEST_MODE_ENABLED ? 'Guest session' : session?.email ?? ''}
          </span>
          {!GUEST_MODE_ENABLED && (
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
      <h1 className="heading">Dashboard</h1>
      <p className="helper">Create a new learning entry to add evidence and request assessment.</p>
      {error && <p className="error-msg" role="alert">{error}</p>}
      <button type="button" onClick={handleCreateEntry} className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Creating…' : 'Create entry'}
      </button>
    </div>
  )
}
