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

  const navLinkStyle = { fontSize: '0.9375rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
        <img src="/logo.svg" alt="" className="home-nav-logo" width={24} height={28} />
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Lighthouse Ledger</span>
      </Link>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/about" style={navLinkStyle}>
          About
        </Link>
        <Link href="/login" style={navLinkStyle}>
          Sign in
        </Link>
        <button
          type="button"
          className="btn-primary"
          onClick={handleStartRecording}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9375rem' }}
        >
          Start Recording
        </button>
      </nav>
    </header>
  )
}
