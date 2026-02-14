'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { NavBar } from '@/app/components/NavBar'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

/* Inline SVG icons – line-art style */
function IconDocCheck({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  )
}
function IconBarChart({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}
function IconShield({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconDocument({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}
function IconClipboard({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}
function IconBuilding({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M8 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (GUEST_MODE_ENABLED) {
      setSignedIn(true)
      return
    }
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session)
    }).catch(() => {
      setSignedIn(false)
    })
  }, [])

  const handleStartRecording = () => {
    if (GUEST_MODE_ENABLED) {
      router.push('/dashboard')
      return
    }
    if (signedIn) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const scrollToLedgerPreview = () => {
    document.getElementById('capability-ledger-preview')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', color: 'var(--color-deep-slate)' }}>
      <NavBar />

      {/* Hero – two columns on desktop */}
      <section className="hero-grid" style={{ maxWidth: '1120px', margin: '0 auto', padding: '4rem 1.5rem 3rem' }}>
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1rem',
              color: 'var(--color-lighthouse-navy)',
            }}
          >
            Record what you can<br />
            really do.<br />
            Turn real work into a<br />
            trustworthy capability<br />
            ledger.
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-deep-slate)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              maxWidth: '520px',
            }}
          >
            Upload evidence from real work, experiments, and community projects. Get a practitioner review that verifies what you actually understand.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <button type="button" className="btn-primary" onClick={handleStartRecording}>
              Start a sample record
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={scrollToLedgerPreview}
            >
              See example ledger
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted-text)', maxWidth: '480px' }}>
            No courses, no grades. Just honest records of real capability.
          </p>
          <Link
            href="/about#how-we-verify"
            style={{ fontSize: '0.9375rem', color: 'var(--color-signal-blue)', fontWeight: 500, textDecoration: 'underline', display: 'inline-block', marginTop: '0.5rem' }}
          >
            How does verification work? →
          </Link>
        </div>
        <div className="ds-card" style={{ padding: '1.5rem', maxWidth: '360px', marginLeft: 0, marginRight: 0 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted-text)', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            CAPABILITY LEDGER — PREVIEW
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-lighthouse-navy)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>
              JD
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-lighthouse-navy)' }}>Jane Doe</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)' }}>Full-stack engineer</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-signal-blue)', flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-lighthouse-navy)' }}>
                API integration & error handling
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'var(--color-muted-text)', letterSpacing: '0.04em' }}>PRACTITIONER-VERIFIED</span>
              <div style={{ flex: 1, minWidth: 60, height: 6, background: 'var(--color-divider)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: 'var(--color-signal-blue)', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-deep-slate)', letterSpacing: '0.02em' }}>88% CONFIDENCE</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-muted-text)', flexShrink: 0, opacity: 0.6 }} aria-hidden />
              <span style={{ flex: 1, height: 1, background: 'var(--color-divider)', minWidth: 40 }} aria-hidden />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-muted-text)', flexShrink: 0, opacity: 0.6 }} aria-hidden />
              <span style={{ flex: 1, height: 1, background: 'var(--color-divider)', minWidth: 40 }} aria-hidden />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-muted-text)', flexShrink: 0, opacity: 0.6 }} aria-hidden />
              <span style={{ flex: 1, height: 1, background: 'var(--color-divider)', minWidth: 40 }} aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* 5-minute strip – white segment, row layout, outlined button */}
      <section
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--color-divider)',
          background: 'var(--color-card-shell)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <p style={{ fontSize: '1rem', color: 'var(--color-deep-slate)', margin: 0 }}>
            In 5 minutes, you can create your first capability record using work you&apos;ve already done.
          </p>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.9375rem' }}>
              Try the 5-minute walkthrough →
            </button>
          </Link>
        </div>
      </section>

      {/* Diagnostic cards */}
      <section
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}
      >
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
            If this sounds like you, Lighthouse Ledger is for you
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['You learn more from projects than from classes.', 'You have repos, decks, or community work that never show up on transcripts.', 'You want proof of capability, not another certificate.'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', color: 'var(--color-deep-slate)' }}>
                <span style={{ color: 'var(--color-signal-blue)', flexShrink: 0 }} aria-hidden>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-deep-slate)', marginTop: '1rem' }}>
            Outcome: A portable, factual record you control.
          </p>
          <Link href="/about#philosophy" style={{ fontSize: '0.875rem', color: 'var(--color-signal-blue)', fontWeight: 500, marginTop: '0.75rem', display: 'inline-block' }}>
            Read the full philosophy →
          </Link>
        </div>
        <div className="ds-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
            What Lighthouse Ledger will never be
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Not a course platform or content marketplace.', 'Not a hiring filter or gatekeeping tool.', 'Not about scores, badges, or gamified streaks.'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem', color: 'var(--color-deep-slate)' }}>
                <span style={{ color: 'var(--color-beacon-red)', flexShrink: 0 }} aria-hidden>✕</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ borderTop: '1px solid var(--color-divider)', marginTop: '1rem', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', margin: 0 }}>
              Boundary: Always a learner-owned record, never a gate.
            </p>
          </div>
          <Link href="/about#philosophy" style={{ fontSize: '0.875rem', color: 'var(--color-signal-blue)', fontWeight: 500, marginTop: '0.75rem', display: 'inline-block' }}>
            Read the full philosophy →
          </Link>
        </div>
      </section>

      {/* Our philosophy – white cards with SVG icons */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
          Our philosophy
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--color-deep-slate)', marginBottom: '2rem', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          Evidence over attendance. Understanding over completion. Learner ownership above all.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { title: 'Evidence over attendance', body: 'We value what you can demonstrate, not just where you showed up. Real capability leaves a trail of work.', Icon: IconDocCheck },
            { title: 'Understanding over completion', body: 'Finishing a course is easy. Explaining why it matters and how to use it is hard. We verify the latter.', Icon: IconBarChart },
            { title: 'Learner ownership', body: 'Your record belongs to you. Not an institution, not an employer. You control who sees it and when.', Icon: IconShield },
          ].map(({ title, body, Icon }) => (
            <div key={title} className="ds-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ width: 40, height: 40, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-lighthouse-navy)' }}>
                <Icon size={24} color="var(--color-lighthouse-navy)" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-lighthouse-navy)' }}>{title}</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)', lineHeight: 1.5, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What a capability ledger looks like */}
      <section id="capability-ledger-preview" style={{ maxWidth: '1120px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
          What a capability ledger looks like
        </h2>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--color-deep-slate)', marginBottom: '2rem' }}>
          A clean, verified history of what you can do.
        </p>
        <div className="ds-card" style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-lighthouse-navy)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>JD</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-lighthouse-navy)' }}>Jane Doe</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)' }}>Full Stack Engineer</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-signal-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span aria-hidden>✓</span> Verified Account
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--color-divider)', paddingTop: '1rem' }}>
            {[
              { title: 'API Integration & Error Handling', date: 'Oct 12, 2025', meta: 'PR #42, Unit Tests', pct: 85, Icon: IconDocument },
              { title: 'User Research Synthesis', date: 'Oct 10, 2025', meta: 'Documentation', pct: 92, Icon: IconClipboard },
              { title: 'Design System Implementation', date: 'Oct 08, 2025', meta: 'WCAG AA', pct: 78, Icon: IconBuilding },
            ].map((item, i) => {
              const EntryIcon = item.Icon
              return (
              <li key={i} style={{ padding: '0.75rem 0', borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none', display: 'flex', gap: '0.5rem' }}>
                <div style={{ flexShrink: 0, color: 'var(--color-deep-slate)', marginTop: 2 }}>
                  <EntryIcon size={20} color="var(--color-deep-slate)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-lighthouse-navy)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginTop: '0.25rem' }}>{item.date} · {item.meta}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginTop: '0.25rem' }}>Practitioner Verification</div>
                  <div style={{ height: 6, background: 'var(--color-divider)', borderRadius: 3, overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: 'var(--color-signal-blue)', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginTop: '0.25rem' }}>{item.pct}% Confidence</div>
                </div>
              </li>
              )
            })}
          </ul>
          <Link href="/dashboard" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              View full ledger history
            </button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ maxWidth: '1120px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '2rem', color: 'var(--color-lighthouse-navy)' }}>
          How Lighthouse Ledger works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {[
            { step: 1, title: 'Record your evidence', body: 'Add a link, text, or file from real work. Describe your intent for review.', sub: 'Evidence first.' },
            { step: 2, title: 'Answer practitioner questions', body: 'Structured questions test how you think and what you understood.', sub: 'Depth over completion.' },
            { step: 3, title: 'Get a verified record', body: 'Receive a confidence band and a shareable capability record.', sub: 'You own and control it.' },
          ].map(({ step, title, body, sub }) => (
            <div key={step} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '2px solid var(--color-deep-slate)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-deep-slate)' }}>
                {step}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-lighthouse-navy)' }}>{title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-deep-slate)', lineHeight: 1.5, marginBottom: '0.25rem' }}>{body}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA – white stripe */}
      <section style={{ width: '100%', background: 'var(--color-card-shell)', padding: '3rem 1.5rem', borderTop: '1px solid var(--color-divider)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            Start your capability ledger
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-deep-slate)', marginBottom: '1.5rem' }}>
            Quietly build a record of what you can actually do, at your own pace.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <button type="button" className="btn-primary" onClick={handleStartRecording}>
              Start a sample record
            </button>
            <Link href="/about#philosophy" style={{ fontSize: '0.9375rem', color: 'var(--color-signal-blue)', fontWeight: 500, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              Read the philosophy →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 1.5rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--color-divider)',
          marginTop: '2rem',
          background: 'var(--color-sand-background)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <img src="/logo.png" alt="" className="home-footer-logo" width={36} height={42} style={{ objectFit: 'contain' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-lighthouse-navy)' }}>Lighthouse Ledger</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/about" style={{ fontSize: '0.875rem', color: 'var(--color-deep-slate)', textDecoration: 'none' }}>Contact</Link>
        </nav>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)' }}>
          © 2026 Lighthouse Ledger. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
