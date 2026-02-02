'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { TimelineEntry } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'
import { getAccessToken } from '@/lib/supabaseClient'

interface DashboardTimelineProps {
  onEntryClick: (entry: TimelineEntry) => void
}

export function DashboardTimeline({ onEntryClick }: DashboardTimelineProps) {
  const router = useRouter()
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [timelineError, setTimelineError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      console.log('DASHBOARD_TIMELINE_USE_EFFECT_RUNNING')
      setTimelineError(null)
      try {
        const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
        if (!GUEST_MODE_ENABLED && token === null) {
          if (!cancelled) {
            setEntries([])
            setEntriesLoading(false)
          }
          return
        }
        const res = await api.listEntries(token)
        if (!cancelled) {
          setEntries(res.entries)
          setTimelineError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setEntries([])
          const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : ''
          const friendlyFallback = 'We couldn\'t load your recent entries. Please try again in a moment, or create a new entry to start your learning ledger.'
          setTimelineError(
            msg && msg !== 'Failed to fetch' && !msg.toLowerCase().includes('failed to fetch')
              ? msg
              : friendlyFallback
          )
        }
      } finally {
        if (!cancelled) setEntriesLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function handleEntryClick(entry: TimelineEntry) {
    if (entry.status === 'Reviewed – link available' && entry.public_id) {
      router.push(`/result?public_id=${entry.public_id}`)
      return
    }
    onEntryClick(entry)
  }

  return (
    <section style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>Learning timeline</h2>
      {entriesLoading ? (
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Loading…</p>
      ) : timelineError ? (
        <p className="helper" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {timelineError}
        </p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>No entries yet. Create an entry to start.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => handleEntryClick(entry)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border)',
                  background: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: '0.9375rem',
                }}
              >
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {new Date(entry.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span style={{ display: 'block', fontWeight: 500 }}>{entry.title}</span>
                <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {entry.evidence_summary}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--navy)', marginTop: '0.375rem' }}>
                  {entry.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
