'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-[720px] mx-auto py-16 px-4 md:px-8">
        <Link href="/" className="inline-block text-sm font-medium mb-8 transition-colors ll-hover-text-navy" style={{ color: 'var(--color-muted-text)' }}>
          ← Home
        </Link>

        <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-lighthouse-navy)' }}>
          Contact us
        </h1>
        <p className="text-lg mb-12" style={{ color: 'var(--color-deep-slate)' }}>
          Get in touch with the Lighthouse Ledger team.
        </p>

        <div className="space-y-6" style={{ color: 'var(--color-deep-slate)', lineHeight: 1.7 }}>
          <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-sand-background)', border: '1px solid var(--color-divider)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted-text)' }}>
              Email
            </h2>
            <a
              href="mailto:info@lhledger.com"
              className="text-xl font-medium transition-colors ll-hover-text-navy"
              style={{ color: 'var(--color-signal-blue)' }}
            >
              info@lhledger.com
            </a>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted-text)' }}>
              For general enquiries, support requests, or feedback.
            </p>
          </div>

          <p className="text-sm" style={{ color: 'var(--color-muted-text)' }}>
            We aim to respond within a few business days.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t flex flex-wrap gap-6" style={{ borderColor: 'var(--color-divider)' }}>
          <Link href="/about" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            About
          </Link>
          <Link href="/privacy" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Terms of Service
          </Link>
          <Link href="/" className="text-sm font-medium transition-colors ll-hover-text-navy" style={{ color: 'var(--color-signal-blue)' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
