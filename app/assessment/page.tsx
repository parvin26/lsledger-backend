'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { McqQuestionItem } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'
import { TopHeader, Card, StickyActionBar } from '@/app/components/ui'

const LAYER_LABELS: [string, string, string, string] = ['Explanation', 'Application', 'Trade-offs / limits', 'Reflection / next steps']
const MAX_ANSWER_LENGTH = 600

function AssessmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('entry_id')
  const [questions, setQuestions] = useState<{ q1: string; q2: string; q3: string; q4: string } | null>(null)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' })
  const [expanded, setExpanded] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [integrityHold, setIntegrityHold] = useState<{ flags: string[]; notes?: string } | null>(null)

  useEffect(() => {
    if (!entryId) {
      router.replace('/dashboard')
      return
    }
    let cancelled = false
    setIntegrityHold(null)
    setError(null)
    const tokenPromise = GUEST_MODE_ENABLED ? Promise.resolve(null) : getAccessToken()
    tokenPromise
      .then((token) => {
        if (!GUEST_MODE_ENABLED && !token) { router.replace('/login'); return }
        return api.generateQuestions(token, entryId)
      })
      .then((q) => {
        if (!cancelled && q) {
          setQuestions({ q1: q.q1, q2: q.q2, q3: q.q3, q4: q.q4 })
          setMcqs(q.mcqs ?? [])
          setMcqAnswers({})
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const e = err as ApiError
          if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
          else if (e?.code === 'INTEGRITY_HOLD' && Array.isArray(e.integrityFlags)) {
            setIntegrityHold({ flags: e.integrityFlags, notes: e.notes })
          } else {
            setError(e?.message ?? 'Failed to load questions.')
          }
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
      setError('Please answer all four reflection questions.')
      return
    }
    const mcqMissing = mcqs.some((m) => typeof mcqAnswers[m.questionNumber] !== 'number')
    if (mcqMissing) {
      setError('Please answer all multiple-choice questions.')
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
      const answerPayload = [
        { questionNumber: 1, answer: answers.q1.trim() },
        { questionNumber: 2, answer: answers.q2.trim() },
        { questionNumber: 3, answer: answers.q3.trim() },
        { questionNumber: 4, answer: answers.q4.trim() },
      ] as Array<{ questionNumber: number; answer?: string; selectedOptionIndex?: number }>
      for (const m of mcqs) {
        const idx = mcqAnswers[m.questionNumber]
        if (typeof idx === 'number') answerPayload.push({ questionNumber: m.questionNumber, selectedOptionIndex: idx })
      }
      const res = await api.evaluateAnswers(token, {
        entry_id: entryId,
        answers: answerPayload,
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
  if (integrityHold) {
    const { flags } = integrityHold
    const explanations: string[] = []
    if (flags.includes('missing_provenance')) {
      explanations.push('Please confirm this is your own work or that you are allowed to share it.')
    }
    if (flags.includes('low_context')) {
      explanations.push('Please add a short description so we can understand what this is about.')
    }
    if (flags.includes('third_party_data_risk')) {
      explanations.push('It looks like this may contain other people\'s data. Please remove or anonymise it, or confirm you have permission to use it.')
    }
    if (flags.includes('obvious_mismatch')) {
      explanations.push('The evidence and your stated intent don\'t seem to align. Please clarify or add more context.')
    }
    if (explanations.length === 0) {
      explanations.push('Please add more context or confirm ownership of the evidence.')
    }

    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '1rem 1rem 2rem' }}>
        <div className="max-w-[720px] mx-auto">
          <TopHeader backHref="/dashboard" title="We need a bit more information" subtitle="Before we can ask fair questions." />
          <Card variant="default" className="p-6 mt-6">
            <ul className="list-disc pl-5 space-y-2 text-deep-slate" style={{ lineHeight: 1.6 }}>
              {explanations.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
            <Link
              href={entryId ? `/add?entry_id=${entryId}` : '/dashboard'}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 mt-6 rounded-lg font-semibold text-white bg-ledger-crimson hover:brightness-110 no-underline"
            >
              Go back to evidence
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !questions) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '2rem 1rem' }}>
        <div className="max-w-[720px] mx-auto">
          <TopHeader backHref="/dashboard" title="Error" />
          <p className="error-msg mt-4">{error}</p>
          <Link href="/dashboard" className="btn-secondary inline-block mt-3 no-underline">
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)', padding: '1rem 1rem 2rem' }}>
      <div className="max-w-[720px] mx-auto">
        <TopHeader
          backHref="/dashboard"
          title="Answer practitioner questions"
          subtitle="Share how you approached this work so reviewers can understand your depth."
          stepPill="Step 2 of 3: Reflection"
        />

        <Card variant="info" className="p-5 mt-6">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-lighthouse-navy)' }}>
            Guidance
          </h3>
          <p className="text-sm mb-2" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.5 }}>
            Deep reflection is the core of the Ledger. Be honest about your process.
          </p>
          <p className="text-xs italic m-0" style={{ color: 'var(--color-muted-text)' }}>
            &ldquo;Don&apos;t just say what you did. Say why you did it, what alternatives you considered, and how you validated the result.&rdquo;
          </p>
        </Card>

        <form id="assessment-form" onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && <p className="error-msg" role="alert">{error}</p>}
          {([1, 2, 3, 4] as const).map((n) => {
            const isExpanded = expanded === n
            return (
              <Card key={n} variant="default" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? 0 : n)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left bg-transparent border-0 cursor-pointer"
                  aria-expanded={isExpanded}
                  aria-controls={`question-${n}-content`}
                  id={`question-${n}-header`}
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-lg font-semibold text-[var(--color-muted-text)]">
                      {String(n).padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--color-lighthouse-navy)' }}>
                      {LAYER_LABELS[n - 1]}
                    </h3>
                    {answers[`q${n}`].length > 0 && (
                      <span className="text-xs text-[var(--color-success)]">Answered</span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  ) : (
                    <ChevronDown className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  )}
                </button>
                <div
                  id={`question-${n}-content`}
                  role="region"
                  aria-labelledby={`question-${n}-header`}
                  hidden={!isExpanded}
                  className="border-t border-[var(--color-border-subtle)]"
                >
                  <div className="p-5 pt-4">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)]">
                        Question {n}
                      </span>
                      <span className="text-xs text-[var(--color-muted-text)]">
                        {answers[`q${n}`].length} / {MAX_ANSWER_LENGTH}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.5 }}>
                      {questions ? (questions as Record<string, string>)[`q${n}`] : (
                        <span className="italic text-[var(--color-muted-text)]">Loading question…</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--color-muted-text)] mb-3">
                      Specific examples help reviewers assess your reasoning.
                    </p>
                    <textarea
                      value={answers[`q${n}`]}
                      onChange={(e) => { setAnswers((a) => ({ ...a, [`q${n}`]: e.target.value })); setError(null) }}
                      className="input w-full p-3 text-base rounded-lg border min-h-[96px] resize-y"
                      style={{
                        borderColor: 'var(--color-border-subtle)',
                        background: 'var(--color-card-shell)',
                      }}
                      rows={4}
                      maxLength={MAX_ANSWER_LENGTH}
                      disabled={submitting || !questions}
                      required
                      placeholder="Describe your thinking, trade-offs, or constraints…"
                    />
                    <p className="text-xs text-[var(--color-muted-text)] mt-2 text-right">
                      Recommended: at least 2 to 3 sentences
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}

          {mcqs.map((mcq) => {
            const isExpanded = expanded === mcq.questionNumber
            const selected = mcqAnswers[mcq.questionNumber]
            const isAnswered = typeof selected === 'number'
            return (
              <Card key={mcq.questionNumber} variant="default" className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? 0 : mcq.questionNumber)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left bg-transparent border-0 cursor-pointer"
                  aria-expanded={isExpanded}
                  aria-controls={`question-${mcq.questionNumber}-content`}
                  id={`question-${mcq.questionNumber}-header`}
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-lg font-semibold text-[var(--color-muted-text)]">
                      {String(mcq.questionNumber).padStart(2, '0')}
                    </span>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--color-lighthouse-navy)' }}>
                      Multiple choice
                    </h3>
                    {isAnswered && (
                      <span className="text-xs text-[var(--color-success)]">Answered</span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  ) : (
                    <ChevronDown className="w-5 h-5 shrink-0" strokeWidth={1.5} aria-hidden />
                  )}
                </button>
                <div
                  id={`question-${mcq.questionNumber}-content`}
                  role="region"
                  aria-labelledby={`question-${mcq.questionNumber}-header`}
                  hidden={!isExpanded}
                  className="border-t border-[var(--color-border-subtle)]"
                >
                  <div className="p-5 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-text)]">
                      Question {mcq.questionNumber}
                    </span>
                    <p className="text-sm mt-2 mb-4" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.5 }}>
                      {mcq.text}
                    </p>
                    <fieldset className="space-y-2">
                      <legend className="sr-only">Select one option</legend>
                      {(mcq.options ?? []).map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                          style={{
                            border: `1px solid ${selected === idx ? 'var(--color-ledger-crimson)' : 'var(--color-border-subtle)'}`,
                            background: selected === idx ? 'var(--color-card-shell)' : 'transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name={`mcq-${mcq.questionNumber}`}
                            value={idx}
                            checked={selected === idx}
                            onChange={() => {
                              setMcqAnswers((a) => ({ ...a, [mcq.questionNumber]: idx }))
                              setError(null)
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm" style={{ color: 'var(--color-deep-slate)' }}>{opt}</span>
                        </label>
                      ))}
                    </fieldset>
                  </div>
                </div>
              </Card>
            )
          })}

          <StickyActionBar
            backHref={entryId ? `/add?entry_id=${entryId}` : '/dashboard'}
            backLabel="Back to evidence"
            primaryLabel="Submit for review"
            primaryDisabled={submitting || !questions || mcqs.some((m) => typeof mcqAnswers[m.questionNumber] !== 'number')}
            primaryLoading={submitting}
            helperText="You can revise these answers before you submit for review."
            formId="assessment-form"
          />
        </form>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-app-bg)' }}>
        <p className="text-[var(--color-muted-text)]">Loading…</p>
      </div>
    }>
      <AssessmentForm />
    </Suspense>
  )
}
