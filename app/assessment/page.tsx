'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'

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
  if (loading) return <div className="form-card" style={{ paddingTop: '2rem' }}><p>Loading questions…</p></div>
  if (error && !questions) return <div className="form-card" style={{ paddingTop: '2rem' }}><p className="error-msg">{error}</p><Link href="/dashboard" className="btn-secondary" style={{ display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>Dashboard</Link></div>
  if (!questions) return null

  return (
    <div className="form-card" style={{ paddingTop: '2rem', maxWidth: '560px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </header>
      <h1 className="heading">Assessment</h1>
      <p className="helper">Answer the following questions about your learning evidence.</p>
      {error && <p className="error-msg" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map((n) => (
          <label key={n} className="label">
            <span style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Question {n}</span>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{(questions as Record<string, string>)[`q${n}`]}</p>
            <textarea
              value={answers[`q${n}` as keyof typeof answers]}
              onChange={(e) => { setAnswers((a) => ({ ...a, [`q${n}`]: e.target.value })); setError(null) }}
              className="input"
              rows={3}
              style={{ minHeight: '72px', resize: 'vertical' }}
              disabled={submitting}
              required
            />
          </label>
        ))}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit answers'}
        </button>
      </form>
    </div>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="form-card" style={{ paddingTop: '2rem' }}><p>Loading…</p></div>}>
      <AssessmentForm />
    </Suspense>
  )
}
