'use client'

import Link from 'next/link'
import { NavBar } from '@/app/components/NavBar'

/* Inline SVG icons – dark blue for verify cards, red X / blue check for problem toggle */
function IconCheck({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
function IconX({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
function IconStackedDocs({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6h12v2H6V6z" />
      <path d="M6 10h10v2H6v-2z" />
      <path d="M6 14h8v2H6v-2z" />
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
function IconShieldCheck({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function IconPerson({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <rect x="16" y="14" width="4" height="4" rx="1" />
    </svg>
  )
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', color: 'var(--color-deep-slate)' }}>
      <NavBar />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        {/* Intro */}
        <section id="philosophy" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem', alignItems: 'start' }}>
          <div>
            <h1 className="heading" style={{ marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
              About Lighthouse Ledger
            </h1>
            <p className="helper" style={{ marginBottom: '1.5rem', color: 'var(--color-deep-slate)' }}>
              Why this system exists and who it is for.
            </p>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-deep-slate)' }}>
              Lighthouse Ledger was created for people whose most important learning does not happen in classrooms. Founders, MSME owners, youth, and self-taught builders learn through work, experiments, and community projects.
            </p>
          </div>
          <div className="ds-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
              Who this is for
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Founders & makers', 'Self-taught developers', 'Small business owners', 'Community builders', 'Non-traditional learners'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-signal-blue)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The problem */}
        <section className="ds-card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
            The problem
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-deep-slate)', margin: 0 }}>
              Real capability rarely appears on formal transcripts. Traditional credentials are slow, expensive, and often out of reach. Existing digital badges mostly track attendance, not understanding.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
              {['Classrooms', 'Multiple choice', 'Real work & evidence'].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: label === 'Real work & evidence' ? 'var(--color-card-shell)' : 'var(--color-sand-background)',
                    border: `1px solid ${label === 'Real work & evidence' ? 'var(--color-divider)' : 'transparent'}`,
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span>{label}</span>
                  {label === 'Real work & evidence' ? (
                    <IconCheck size={18} color="var(--color-signal-blue)" />
                  ) : (
                    <IconX size={18} color="var(--color-beacon-red)" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our response - dark band */}
        <section
          style={{
            background: 'var(--color-lighthouse-navy)',
            color: '#fff',
            padding: '2rem 1.5rem',
            borderRadius: 12,
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Our response</h2>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, margin: 0, opacity: 0.95 }}>
            Lighthouse Ledger is a learning record and review system that listens to evidence first. We ask structured, practitioner-level questions to test how you think, what you understand, and how you would apply it.
          </p>
        </section>

        {/* How we verify capability */}
        <section id="how-we-verify" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-lighthouse-navy)' }}>
            How we verify capability
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { title: 'Evidence first', body: "We start with what you've actually done.", Icon: IconStackedDocs },
              { title: 'Structured questions', body: 'Practitioner prompts test your depth of understanding.', Icon: IconBarChart },
              { title: 'Confidence band', body: 'Clear signals of verification strength for each record.', Icon: IconShieldCheck },
              { title: 'Owned by you', body: 'A portable ledger you control, shareable only when you choose.', Icon: IconPerson },
            ].map(({ title, body, Icon }) => (
              <div key={title} className="ds-card" style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '0.75rem', color: 'var(--color-lighthouse-navy)' }}>
                  <Icon size={28} color="var(--color-lighthouse-navy)" />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-lighthouse-navy)' }}>{title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-deep-slate)', lineHeight: 1.5, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Long-term ambition */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-muted-text)', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingLeft: '0.75rem', borderLeft: '3px solid var(--color-lighthouse-navy)' }}>
            LONG-TERM AMBITION
          </div>
          <blockquote style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-lighthouse-navy)', lineHeight: 1.4, marginBottom: '0.75rem', marginLeft: 0, marginRight: 0 }}>
            To prove that non-traditional learners can be assessed with the same seriousness as formal students.
          </blockquote>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-deep-slate)' }}>
            We are laying the groundwork for stackable, verifiable micro-credentials that one day plug into wider education, employment, and digital public infrastructure.
          </p>
        </section>

        {/* What we will never be + Where we are now */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div className="ds-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-lighthouse-navy)' }}>
              What Lighthouse Ledger will never be
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Not a replacement for universities', 'Not a gatekeeper', 'Not making hiring decisions', 'Not an automated AI judge'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  <span style={{ flexShrink: 0 }}><IconX size={18} color="var(--color-beacon-red)" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ds-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-lighthouse-navy)' }}>
              Where we are now
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--color-deep-slate)', marginBottom: '1rem' }}>
              This is an early test version. Sign-in is limited to invited users as we learn with our first cohort.
            </p>
            {/* TODO: Requires product approval – wire "Get updates" to backend (e.g. newsletter or waitlist) when available. */}
            <button type="button" className="btn-secondary" style={{ fontSize: '0.875rem' }}>
              GET UPDATES
            </button>
          </div>
        </section>
      </main>

      {/* Footer CTA – full-width white stripe */}
      <section style={{ width: '100%', background: 'var(--color-card-shell)', padding: '2rem 1.5rem', borderTop: '1px solid var(--color-divider)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            Start your capability ledger
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-deep-slate)', marginBottom: '1.5rem' }}>
            Quietly build a record of what you can actually do, at your own pace.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '0.75rem' }}>
            Start a sample record
          </Link>
          <Link href="#philosophy" style={{ fontSize: '0.9375rem', color: 'var(--color-signal-blue)', fontWeight: 500 }}>
            Read the philosophy →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--color-divider)', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="" width={32} height={37} style={{ display: 'block', objectFit: 'contain' }} />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-lighthouse-navy)' }}>Lighthouse Ledger</span>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <Link href="/about" style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/about" style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/about" style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', textDecoration: 'none' }}>Contact</Link>
        </nav>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)' }}>© 2026 Lighthouse Ledger. All rights reserved.</p>
      </footer>
    </div>
  )
}
