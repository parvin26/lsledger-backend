'use client'

import { useEffect, useState } from 'react'

function IconClock({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-lighthouse-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ opacity: 0.6 }}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
import { useRouter } from 'next/navigation'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { TimelineEntry } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'
import { getAccessToken } from '@/lib/supabaseClient'

interface DashboardTimelineProps {
  onEntryClick: (entry: TimelineEntry) => void
}

/** Group entries by date label (today, yesterday, or formatted date for earlier). Does not change API contract. */
function groupEntriesByDate(entries: TimelineEntry[]): { label: string; entries: TimelineEntry[] }[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

  const groups: Map<string, TimelineEntry[]> = new Map()

  for (const entry of entries) {
    const t = new Date(entry.created_at).getTime()
    let label: string
    if (t >= todayStart) {
      label = `${now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} · Today`
    } else if (t >= yesterdayStart) {
      const d = new Date(yesterdayStart)
      label = `${d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })} · Yesterday`
    } else {
      const d = new Date(t)
      label = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) + ' · Earlier'
    }
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(entry)
  }

  const order: string[] = []
  groups.forEach((_, label) => order.push(label))
  order.sort((a, b) => {
    const aIsToday = a.includes('Today')
    const bIsToday = b.includes('Today')
    if (aIsToday && !bIsToday) return -1
    if (!aIsToday && bIsToday) return 1
    const aIsYesterday = a.includes('Yesterday')
    const bIsYesterday = b.includes('Yesterday')
    if (aIsYesterday && !bIsYesterday) return -1
    if (!aIsYesterday && bIsYesterday) return 1
    return 0
  })

  return order.map((label) => ({ label, entries: groups.get(label)! }))
}

/** Map API status to pill display: Reviewed (blue) or Recorded only (grey). */
function statusPillLabel(status: TimelineEntry['status']): string {
  if (status === 'Reviewed – link available' || status === 'Reviewed') return 'Reviewed'
  return 'Recorded only'
}

function isReviewed(status: TimelineEntry['status']): boolean {
  return status === 'Reviewed – link available' || status === 'Reviewed'
}

export function DashboardTimeline({ onEntryClick }: DashboardTimelineProps) {
  const router = useRouter()
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [timelineError, setTimelineError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
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
          const friendlyFallback = "We couldn't load your recent entries. If this keeps happening, check your connection or try again later. The service may be temporarily unavailable."
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

  const grouped = groupEntriesByDate(entries)
  const hasEntries = entries.length > 0

  return (
    <section>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-lighthouse-navy)' }}>
          Your learning timeline
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>
          Most recent first. Only &apos;Reviewed&apos; entries appear in your capability ledger.
        </p>
      </div>

      {entriesLoading ? (
        <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted-text)' }}>Loading…</p>
      ) : timelineError ? (
        <p className="helper" style={{ color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>
          {timelineError}
        </p>
      ) : !hasEntries ? (
        <div className="bg-white rounded-xl border border-[var(--color-border-subtle)] shadow-sm p-12 text-center">
          <div
            style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--color-app-bg)',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconClock size={32} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            No entries yet
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)', marginBottom: '1.5rem' }}>
            Your learning timeline will appear here after you create your first entry.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold text-white bg-ledger-crimson hover:brightness-110"
            style={{ fontSize: '0.875rem' }}
            onClick={() => {
              const createBtn = document.querySelector('[data-create-entry]') as HTMLButtonElement | null
              createBtn?.click()
            }}
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {grouped.map(({ label, entries: groupEntries }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--color-muted-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                    paddingLeft: '0.25rem',
                  }}
                >
                  {label}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupEntries.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => handleEntryClick(entry)}
                        className="block w-full text-left p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                        style={{
                          background: 'var(--color-card-shell)',
                          borderColor: 'var(--color-border-subtle)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-lighthouse-navy)', flex: '1 1 auto', minWidth: 0 }}>
                            {entry.title}
                          </span>
                          <span
                            className={isReviewed(entry.status) ? 'ds-pill ds-pill-reviewed' : 'ds-pill ds-pill-recorded'}
                            style={{ flexShrink: 0 }}
                          >
                            {statusPillLabel(entry.status)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-deep-slate)',
                            lineHeight: 1.4,
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {entry.evidence_summary}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '0.5rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid var(--color-divider)',
                            fontSize: '0.75rem',
                            color: 'var(--color-muted-text)',
                          }}
                        >
                          <span>
                            {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          <span style={{ fontWeight: 500, color: 'var(--color-signal-blue)' }}>Open →</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {/* Existing "Load earlier entries" restyled; no backend pagination yet so button is present but non-functional. */}
            <button
              type="button"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-deep-slate)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
              }}
            >
              Load earlier entries →
            </button>
          </div>
        </>
      )}
    </section>
  )
}
