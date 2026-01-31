'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { NavBar } from '@/app/components/NavBar'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

export default function HomePage() {
  const router = useRouter()
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    if (GUEST_MODE_ENABLED) {
      setSignedIn(true)
      return
    }
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session?.user)
    })
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleStartRecording() {
    if (GUEST_MODE_ENABLED) {
      router.push('/dashboard')
      return
    }
    if (signedIn) router.push('/dashboard')
    else router.push('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <NavBar />

      {/* Hero */}
      <section
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '3rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        <img src="/logo.svg" alt="" className="home-hero-logo" width={40} height={47} />
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '1rem',
            color: 'var(--text)',
          }}
        >
          Record real learning.<br />Verify real capability.
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          A system for recording and reviewing learning gained through real work and experience. Producing factual capability records.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
          <button type="button" onClick={handleStartRecording} className="btn-primary">
            Start Recording
          </button>
          <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Sign In
          </Link>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
          For this early test version, you can explore the full flow as a guest. Sign‑in will be added later.
        </p>
      </section>

      {/* What Lighthouse Ledger is / is not */}
      <section
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
            What Lighthouse Ledger is
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['A learning record system', 'Evidence-based capability verification', 'Learner-owned records', 'Honest documentation of real work'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--navy)', flexShrink: 0 }} aria-hidden>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>
            What Lighthouse Ledger is not
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {['Not an academy or course platform', 'Not a certification mill', 'Not a hiring tool', 'Not about scores or badges'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }} aria-hidden>✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our Philosophy */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '2rem', color: 'var(--text)' }}>
          Our Philosophy
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { title: 'Evidence over attendance', body: 'What you can demonstrate matters more than where you sat.' },
            { title: 'Understanding over completion', body: 'Knowing why matters more than checking boxes.' },
            { title: 'Learner ownership', body: 'Your records belong to you. Always.' },
          ].map(({ title, body }) => (
            <div
              key={title}
              style={{
                padding: '1.25rem 1.5rem',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text)' }}>{title}</h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 1.5rem 2rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
          marginTop: '2rem',
        }}
      >
        <img src="/logo.svg" alt="Lighthouse Ledger" className="home-footer-logo" width={24} height={28} />
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)' }}>Lighthouse Ledger</span>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
          A capability record system. Evidence over attendance. Understanding over completion.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          © 2026 Lighthouse Ledger. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
