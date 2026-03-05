'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type {
  DemoAminaResponse,
  DemoAminaQuestion,
  DemoAminaAnswer,
  DemoAminaEvidence,
  DemoAminaCriterionScore,
} from '@/lib/demoAmina'

const LAYER_NAMES: Record<number, string> = {
  1: 'Explanation',
  2: 'Application',
  3: 'Trade-offs / limits',
  4: 'Reflection / next steps',
}

function WhyAskedToggle({ whyAsked }: { whyAsked: Record<string, unknown> }) {
  const [open, setOpen] = useState(false)
  const purpose = whyAsked?.purpose as string | undefined
  const evidenceTrigger = whyAsked?.evidenceTrigger as { conceptsDetected?: string[] } | undefined
  const scoringBasis = whyAsked?.scoringBasis as { featuresExpected?: string[] } | undefined

  if (!purpose && !evidenceTrigger && !scoringBasis) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--color-signal-blue)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          textDecoration: 'underline',
        }}
      >
        {open ? 'Hide' : 'Why this question?'}
      </button>
      {open && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'var(--color-sand-background)',
            borderRadius: 8,
            fontSize: '0.8125rem',
            color: 'var(--color-deep-slate)',
            lineHeight: 1.5,
          }}
        >
          {purpose && <p style={{ margin: '0 0 0.25rem 0' }}><strong>Purpose:</strong> {purpose}</p>}
          {evidenceTrigger?.conceptsDetected?.length ? (
            <p style={{ margin: '0 0 0.25rem 0' }}>
              <strong>Concepts detected:</strong> {evidenceTrigger.conceptsDetected.join(', ')}
            </p>
          ) : null}
          {scoringBasis?.featuresExpected?.length ? (
            <p style={{ margin: 0 }}>
              <strong>Features expected:</strong> {scoringBasis.featuresExpected.join(', ')}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function DemoAminaPage() {
  const [data, setData] = useState<DemoAminaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    fetch('/api/demo/amina')
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Demo data not found. Run the demo seed migration first.' : 'Failed to load demo')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err?.message ?? 'Failed to load demo'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem', textAlign: 'center', color: 'var(--color-muted-text)' }}>
          Loading demo…
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Link href="/" style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
            ← Home
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-lighthouse-navy)', marginBottom: '0.5rem' }}>
            Demo: Amina
          </h1>
          <p className="error-msg">{error ?? 'Demo data not found.'}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>
            Run the demo seed migration in Supabase SQL Editor: <code style={{ background: 'var(--color-card-shell)', padding: '0.125rem 0.375rem', borderRadius: 4 }}>docs/migrations/demo_amina_seed.sql</code>
          </p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  const { entry, evidence, questions, answers, verification, rubric_breakdown } = data

  const getAnswer = (qNum: number): string => {
    const a = answers.find((x) => x.question_number === qNum)
    return a?.answer_text ?? ''
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-muted-text)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}
        >
          ← Home
        </Link>

        <header style={{ marginBottom: '2rem', position: 'relative' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            Demo: {entry.title}
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-deep-slate)' }}>
            Scripted walkthrough for product video recording.
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
            STEP {step} OF 3
          </span>
        </header>

        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: s === step ? '2px solid var(--color-lighthouse-navy)' : '1px solid var(--color-divider)',
                borderRadius: 8,
                background: s === step ? 'var(--color-card-shell)' : 'transparent',
                color: s === step ? 'var(--color-lighthouse-navy)' : 'var(--color-muted-text)',
                cursor: 'pointer',
              }}
            >
              {s === 1 && 'Evidence'}
              {s === 2 && 'Questions & answers'}
              {s === 3 && 'Capability record'}
            </button>
          ))}
        </div>

        {/* Step 1: Evidence preview */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="ds-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
                1. Evidence preview
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '1rem' }}>
                Amina submitted two pieces of evidence for her grocery shop operations assessment.
              </p>

              {evidence.map((e: DemoAminaEvidence, idx: number) => (
                <div
                  key={e.id}
                  style={{
                    marginBottom: idx < evidence.length - 1 ? '1.5rem' : 0,
                    padding: '1rem',
                    background: 'var(--color-sand-background)',
                    borderRadius: 8,
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    {e.evidence_type === 'link' ? 'YouTube video transcript' : 'Inventory notebook excerpt'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {e.evidence_type === 'link' && e.transcript ? e.transcript : e.content ?? ''}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn-primary" onClick={() => setStep(2)}>
              Next: Questions & answers
            </button>
          </div>
        )}

        {/* Step 2: Questions + sample answers */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="ds-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
                2. Questions asked & sample answers
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '1rem' }}>
                Based on the evidence, the system asked these questions. Amina&apos;s sample answers are shown below.
              </p>

              {questions.map((q: DemoAminaQuestion) => (
                <div
                  key={q.question_number}
                  style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--color-sand-background)',
                    borderRadius: 8,
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Question {q.question_number}
                    </span>
                    {q.layer_number && (
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-muted-text)' }}>
                        {LAYER_NAMES[q.layer_number]}
                        {q.criterion_code && ` · ${q.criterion_code}`}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
                    {q.question_text}
                  </p>
                  <WhyAskedToggle whyAsked={q.why_asked} />
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-divider)' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      Sample answer
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', lineHeight: 1.6, margin: 0 }}>
                      {getAnswer(q.question_number) || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back: Evidence
              </button>
              <button type="button" className="btn-primary" onClick={() => setStep(3)}>
                Next: Capability record
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Capability record with rubric breakdown */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="ds-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
                3. Capability record
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', marginBottom: '1rem' }}>
                The assessment produced this capability record with rubric breakdown.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Confidence band
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-deep-slate)' }}>
                  {verification.confidence_band}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Capability summary
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--color-deep-slate)', lineHeight: 1.6 }}>
                  {verification.capability_summary}
                </div>
              </div>

              {verification.evidence_summary && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Evidence reviewed
                  </div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)' }}>
                    {verification.evidence_summary}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Rubric breakdown
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9375rem', color: 'var(--color-deep-slate)', lineHeight: 1.7 }}>
                  {rubric_breakdown.map((c: DemoAminaCriterionScore) => (
                    <li key={c.criterion_code}>
                      {c.criterion_name}: <strong>{c.descriptor}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-sand-background)', borderRadius: 8, border: '1px solid var(--color-divider)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>Verification record</div>
                <span className="verified-badge" style={{ color: 'var(--color-signal-blue)' }}>Verified</span>
                <Link
                  href={`/record/${verification.public_id}`}
                  style={{ display: 'inline-block', marginTop: '0.5rem', color: 'var(--color-lighthouse-navy)', fontWeight: 600 }}
                >
                  View verification record →
                </Link>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                Back: Questions & answers
              </button>
              <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
                Done
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
