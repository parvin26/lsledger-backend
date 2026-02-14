'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

const LAYER_LABELS: [string, string, string, string] = ['Explanation', 'Application', 'Trade-offs / limits', 'Reflection / next steps']
const MAX_ANSWER_LENGTH = 600

function AssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('entry_id')
  const [questions, setQuestions] = useState<{ q1: string; q2: string; q3: string; q4: string } | null>(null)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entryId) {
      router.replace('/dashboard')
      return
    }
    let cancelled = false
    const tokenPromise = GUEST_MODE_ENABLED ? Promise.resolve(null) : getAccessToken()
    tokenPromise
      .then((token) => {
        if (!GUEST_MODE_ENABLED && !token) { router.replace('/login'); return }
        return api.generateQuestions(token, entryId)
      })
      .then((q) => {
        if (!cancelled && q) setQuestions({ q1: q.q1, q2: q.q2, q3: q.q3, q4: q.q4 })
      })
      .catch((err) => {
        if (!cancelled) {
          const e = err as ApiError
          if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
          else setError(e?.message ?? 'Failed to load questions.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [entryId, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!entryId) return
    const a = [answers.q1, answers.q2, answers.q3, answers.q4]
    if (a.some((x) => !x.trim())) {
      setError('Please answer all four questions.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        setSubmitting(false)
        return
      }
      const res = await api.evaluateAnswers(token, {
        entry_id: entryId,
        answers: [
          { questionNumber: 1, answer: answers.q1.trim() },
          { questionNumber: 2, answer: answers.q2.trim() },
          { questionNumber: 3, answer: answers.q3.trim() },
          { questionNumber: 4, answer: answers.q4.trim() },
        ],
      })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ll_result', JSON.stringify({
          entry_id: entryId,
          public_id: res.public_id ?? null,
          confidence_band: res.confidence_band,
          capability_summary: res.capability_summary ?? '',
          layer1_descriptor: res.layer1_descriptor ?? null,
          layer2_descriptor: res.layer2_descriptor ?? null,
          layer3_descriptor: res.layer3_descriptor ?? null,
          layer4_descriptor: res.layer4_descriptor ?? null,
        }))
      }
      const publicId = res.public_id ?? ''
      router.push(publicId ? `/result?public_id=${publicId}` : '/result')
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
      else setError(e?.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!entryId) return null
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted-text)' }}>Loading questions…</p>
      </div>
    )
  }
  if (error && !questions) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
        <p className="error-msg">{error}</p>
        <Link href="/dashboard" className="btn-secondary" style={{ display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>
          Dashboard
        </Link>
      </div>
    )
  }
  if (!questions) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link
          href="/dashboard"
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-muted-text)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}
        >
          ← Dashboard
        </Link>

        <header style={{ marginBottom: '2rem', position: 'relative' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            Answer practitioner questions
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-deep-slate)' }}>
            Share how you approached this work so reviewers can understand your depth.
          </p>
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-deep-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'var(--color-card-shell)',
              padding: '0.25rem 0.75rem',
              borderRadius: 9999,
              border: '2px solid var(--color-deep-slate)',
            }}
          >
            STEP 2 OF 3 · REFLECTION
          </span>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Guidance panel - visible on desktop via grid when we add a media query or keep single column */}
          <div
            className="ds-card"
            style={{
              padding: '1rem 1.25rem',
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
              Guidance
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Deep reflection is the core of the Ledger. Be honest about your process.
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', fontStyle: 'italic', margin: 0 }}>
              &ldquo;Don&apos;t just say what you did. Say why you did it, what alternatives you considered, and how you validated the result.&rdquo;
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <p className="error-msg" role="alert">{error}</p>}
            {([1, 2, 3, 4] as const).map((n) => (
              <div
                key={n}
                className="ds-card"
                style={{
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Question {n}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--color-muted-text)' }}>
                    {answers[`q${n}`].length} / {MAX_ANSWER_LENGTH}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-lighthouse-navy)' }}>
                  {LAYER_LABELS[n - 1]}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '0.5rem' }}>
                  {(questions as Record<string, string>)[`q${n}`]}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>
                  Specific examples help reviewers assess your reasoning.
                </p>
                <textarea
                  value={answers[`q${n}`]}
                  onChange={(e) => { setAnswers((a) => ({ ...a, [`q${n}`]: e.target.value })); setError(null) }}
                  className="input"
                  rows={4}
                  maxLength={MAX_ANSWER_LENGTH}
                  style={{ minHeight: '96px', resize: 'vertical', background: 'var(--color-card-shell)' }}
                  disabled={submitting}
                  required
                  placeholder="Describe your thinking, trade-offs, or constraints…"
                />
                <p style={{ fontSize: '0.625rem', color: 'var(--color-muted-text)', marginTop: '0.375rem', textAlign: 'right' }}>
                  Recommended: at least 2–3 sentences
                </p>
              </div>
            ))}

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-divider)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <Link
                href={entryId ? `/add?entry_id=${entryId}` : '/dashboard'}
                style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-deep-slate)', textDecoration: 'none' }}
              >
                Back to evidence
              </Link>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginLeft: 'auto' }}>
                You can revise these answers before you submit for review.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-text)' }}>Loading…</div>}>
      <AssessmentForm />
    </Suspense>
  )
}
