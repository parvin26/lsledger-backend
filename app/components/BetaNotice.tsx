'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_URL = 'https://wa.link/e3qs41'
const WHATSAPP_NUMBER = '+60183937031'

export function BetaNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('beta-notice-dismissed')
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('beta-notice-dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-notice-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(26, 39, 64, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleDismiss}
    >
      <div
        className="ds-card"
        style={{
          maxWidth: 420,
          width: '100%',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: 'var(--color-signal-blue)',
            marginBottom: '1rem',
          }}
        >
          BETA
        </div>
        <h2
          id="beta-notice-title"
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--color-lighthouse-navy)',
            marginBottom: '0.75rem',
            lineHeight: 1.4,
          }}
        >
          Platform in development
        </h2>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--color-deep-slate)',
            lineHeight: 1.55,
            marginBottom: '1rem',
          }}
        >
          This platform is currently in beta. Development will be completed in the next hours. Please visit again and let us know if you encounter any issues.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: '#25D366',
            textDecoration: 'none',
            marginBottom: '1.25rem',
          }}
        >
          <span aria-hidden>💬</span>
          Contact us on WhatsApp: {WHATSAPP_NUMBER}
        </a>
        <button
          type="button"
          className="btn-primary"
          onClick={handleDismiss}
          style={{ width: '100%' }}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
