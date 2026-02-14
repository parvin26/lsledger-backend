'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError('Email and password are required.')
      return
    }
    setLoading(true)
    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({ email: trimmed, password })
      if (authError) {
        setError(authError.message)
        return
      }
      router.replace('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="form-card" style={{ paddingTop: '0', width: '100%', maxWidth: '480px' }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Lighthouse Ledger" width={160} height={180} style={{ display: 'block', objectFit: 'contain' }} />
        </Link>
        <h1 className="heading" style={{ color: 'var(--color-lighthouse-navy)' }}>Sign in</h1>
        <p className="helper" style={{ color: 'var(--color-muted-text)' }}>Sign in to your account to continue.</p>
      {error && <p className="error-msg" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <label className="label">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            className="input"
            disabled={loading}
          />
        </label>
        <label className="label">
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            className="input"
            disabled={loading}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      </div>
    </div>
  )
}
