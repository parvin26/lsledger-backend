'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function Footer() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.message ?? 'Something went wrong.')
        return
      }
      setStatus('success')
      setMessage(data.message ?? "Thanks for subscribing!")
      setEmail('')
      setConsent(false)
    } catch {
      setStatus('error')
      setMessage('Could not subscribe. Please try again.')
    }
  }

  const scrollToHowItWorks = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/#how-it-works'
    }
  }

  return (
    <footer className="min-w-0 w-full">
      {/* Newsletter Section */}
      <div className="border-y py-12 px-4 md:px-8" style={{ backgroundColor: 'var(--color-sand-background)', borderColor: 'var(--color-divider)' }}>
        <div className="max-w-[1120px] mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-lighthouse-navy)' }}>
            Stay up-to-date with Lighthouse Ledger
          </h3>
          <p className="mb-6 max-w-xl mx-auto" style={{ color: 'var(--color-deep-slate)' }}>
            Join our email list to receive occasional updates on product development.
          </p>

          <form onSubmit={handleNewsletter} className="flex flex-col gap-4 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border bg-white focus:outline-none focus:ring-2 ll-input-landing disabled:opacity-60"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-deep-slate)' }}
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !consent}
                className="hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm"
                style={{ backgroundColor: 'var(--color-ledger-crimson)' }}
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <label className="flex items-start gap-3 text-left cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={status === 'loading'}
                className="mt-1 rounded border-gray-300 text-ledger-crimson focus:ring-ledger-crimson"
              />
              <span className="text-sm" style={{ color: 'var(--color-deep-slate)' }}>
                I agree to the{' '}
                <Link href="/privacy" className="underline ll-hover-text-navy font-medium" style={{ color: 'var(--color-lighthouse-navy)' }}>
                  Privacy Policy
                </Link>
                {' '}and consent to receive occasional product updates.
              </span>
            </label>
            {message && (
              <p
                role="status"
                className={`text-sm ${status === 'error' ? 'text-red-600' : ''}`}
                style={status === 'success' ? { color: 'var(--color-lighthouse-navy)' } : undefined}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-white border-t py-12 px-4 md:px-8" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="max-w-[1120px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="" className="h-20 w-[100px] object-contain" width={100} height={80} />
                <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--color-deep-slate)' }}>
                  Lighthouse Ledger
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted-text)] leading-relaxed">
                Evidence-first capability verification for non-traditional learners.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Links</h4>
              <div className="flex flex-col gap-3 text-sm text-[var(--color-muted-text)]">
                <Link href="/about" className="transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
                  About
                </Link>
                <Link href="/dashboard" className="transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="text-left transition-colors ll-hover-text-navy"
                  style={{ color: 'var(--color-muted-text)' }}
                >
                  How it works
                </button>
                <Link href="/contact" className="transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
                  Contact
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-lighthouse-navy)' }}>Legal</h4>
              <div className="flex flex-col gap-3 text-sm text-[var(--color-muted-text)]">
                <Link href="/privacy" className="transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
                  Privacy
                </Link>
                <Link href="/terms" className="transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
