'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

export function NavBar() {
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

  const navLinkStyle = { fontSize: '0.9375rem', color: 'var(--color-deep-slate)', textDecoration: 'none', fontWeight: 500 }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        maxWidth: '1120px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
        <img src="/logo.svg" alt="" className="home-nav-logo" width={100} height={80} style={{ objectFit: 'contain' }} />
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-lighthouse-navy)' }}>Lighthouse Ledger</span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <Link href="/about" style={navLinkStyle}>
          About
        </Link>
        <Link href="/dashboard" style={navLinkStyle}>
          Dashboard
        </Link>
        <Link href="/login" style={navLinkStyle}>
          Sign in
        </Link>
        <button
          type="button"
          className="btn-secondary btn-nav-cta"
          onClick={handleStartRecording}
        >
          Start a record
        </button>
      </nav>
    </header>
  )
}
