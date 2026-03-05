'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser, getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

interface RunItem {
  runId: string
  startedAt: string
  completedAt: string | null
  questionBudget: number
  questionsAsked: number
  stopReason: string | null
  integrityFlags: string[]
  rubricId: string | null
  confidenceCategory: string | null
}

export default function AdminRunsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [entryId, setEntryId] = useState(searchParams.get('entryId') ?? '')
  const [runs, setRuns] = useState<RunItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overrideRunId, setOverrideRunId] = useState<string | null>(null)
  const [overrideSummary, setOverrideSummary] = useState('')
  const [overrideBand, setOverrideBand] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [overrideSubmitting, setOverrideSubmitting] = useState(false)
  const [reliabilityRunId, setReliabilityRunId] = useState<string | null>(null)
  const [reliabilityData, setReliabilityData] = useState<{ criteria: Array<{ criterion_code: string; kappa: number; percentAgreement: number; meetsThreshold: boolean }> } | null>(null)

  async function fetchRuns(eid?: string) {
    const id = eid ?? entryId
    if (!id.trim()) return
    setLoading(true)
    setError(null)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        return
      }
      const res = await api.getAssessmentRuns(token, id.trim())
      setRuns(res.runs)
    } catch (e) {
      const err = e as { status?: number; message?: string }
      if (!GUEST_MODE_ENABLED && err?.status === 401) router.replace('/login')
      setError(err?.message ?? 'Failed to load runs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!GUEST_MODE_ENABLED) {
      supabaseBrowser.auth.getSession().then(({ data: { session: s } }) => {
        if (!s?.user) router.replace('/login')
      })
      const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_e, s) => {
        if (!s?.user) router.replace('/login')
      })
      return () => subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    const id = searchParams.get('entryId')
    if (id) {
      setEntryId(id)
      fetchRuns(id)
    }
  }, [searchParams])

  async function handleOverride(e: React.FormEvent) {
    e.preventDefault()
    if (!overrideRunId || !overrideSummary.trim()) return
    setOverrideSubmitting(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) return
      await api.overrideAssessmentRun(token, overrideRunId, {
        finalCapabilitySummary: overrideSummary,
        finalConfidenceBand: overrideBand,
      })
      setOverrideRunId(null)
      setOverrideSummary('')
      setOverrideBand('Medium')
      fetchRuns()
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Override failed')
    } finally {
      setOverrideSubmitting(false)
    }
  }

  async function fetchReliability(runId: string) {
    if (reliabilityRunId === runId && reliabilityData) {
      setReliabilityRunId(null)
      setReliabilityData(null)
      return
    }
    setReliabilityRunId(runId)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) return
      const res = await api.getReliability(token, runId)
      setReliabilityData({ criteria: res.criteria })
    } catch {
      setReliabilityData({ criteria: [] })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Link href="/dashboard" style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
          Assessor — Assessment Runs
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '1.5rem' }}>
          Enter an entry ID to list runs. Override and reliability are for internal use.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={entryId}
            onChange={(e) => setEntryId(e.target.value)}
            placeholder="Entry ID (UUID)"
            style={{ padding: '0.5rem 0.75rem', minWidth: '280px', border: '1px solid var(--color-divider)', borderRadius: 4 }}
          />
          <button
            type="button"
            onClick={() => fetchRuns()}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Loading…' : 'Load runs'}
          </button>
        </div>

        {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>{error}</p>}

        {runs.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-divider)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Run ID</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Started</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Completed</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Stop reason</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Integrity flags</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Rubric</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Confidence</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.runId} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.runId.slice(0, 8)}…</td>
                    <td style={{ padding: '0.5rem' }}>{new Date(r.startedAt).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem' }}>{r.completedAt ? new Date(r.completedAt).toLocaleString() : '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{r.stopReason ?? '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{r.integrityFlags.length ? r.integrityFlags.join(', ') : '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{r.rubricId ?? '—'}</td>
                    <td style={{ padding: '0.5rem' }}>{r.confidenceCategory ?? '—'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setOverrideRunId(overrideRunId === r.runId ? null : r.runId)}
                        style={{ marginRight: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Override
                      </button>
                      <button
                        type="button"
                        onClick={() => fetchReliability(r.runId)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Reliability
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {overrideRunId && (
          <form onSubmit={handleOverride} style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-card-shell)', borderRadius: 8 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Override run {overrideRunId.slice(0, 8)}…</h3>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Capability summary
            </label>
            <textarea
              value={overrideSummary}
              onChange={(e) => setOverrideSummary(e.target.value)}
              required
              rows={3}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid var(--color-divider)', borderRadius: 4 }}
            />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Confidence band
            </label>
            <select
              value={overrideBand}
              onChange={(e) => setOverrideBand(e.target.value as 'Low' | 'Medium' | 'High')}
              style={{ padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid var(--color-divider)', borderRadius: 4 }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" disabled={overrideSubmitting}>
                {overrideSubmitting ? 'Saving…' : 'Save override'}
              </button>
              <button type="button" onClick={() => { setOverrideRunId(null); setOverrideSummary(''); setOverrideBand('Medium') }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {reliabilityData && reliabilityRunId && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-card-shell)', borderRadius: 8 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Reliability (κ) for run {reliabilityRunId.slice(0, 8)}…</h3>
            {reliabilityData.criteria.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>No double-rated criteria. Run evaluate-secondary for a second rater.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Criterion</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>κ</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Agreement %</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>≥ 0.8</th>
                  </tr>
                </thead>
                <tbody>
                  {reliabilityData.criteria.map((c) => (
                    <tr key={c.criterion_code} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                      <td style={{ padding: '0.5rem' }}>{c.criterion_code}</td>
                      <td style={{ padding: '0.5rem' }}>{c.kappa.toFixed(3)}</td>
                      <td style={{ padding: '0.5rem' }}>{c.percentAgreement.toFixed(1)}%</td>
                      <td style={{ padding: '0.5rem' }}>{c.meetsThreshold ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button type="button" onClick={() => { setReliabilityRunId(null); setReliabilityData(null) }} style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
