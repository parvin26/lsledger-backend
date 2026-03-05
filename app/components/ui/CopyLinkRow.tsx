'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

export interface CopyLinkRowProps {
  url: string
  label?: string
  helperText?: string
}

export function CopyLinkRow({ url, label = 'Shareable verification link', helperText }: CopyLinkRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url])

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-[var(--color-muted-text)] mb-1">{label}</div>
      {helperText && (
        <p className="text-sm text-[var(--color-muted-text)] mb-2" style={{ lineHeight: 1.5 }}>
          {helperText}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-[var(--color-app-bg)] border border-[var(--color-border-subtle)]">
        <code className="text-sm break-all flex-1 min-w-0" style={{ color: 'var(--color-deep-slate)' }}>
          {url}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm min-h-[44px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lighthouse-navy"
          style={{
            background: copied ? 'var(--color-success)' : 'var(--color-lighthouse-navy)',
            color: '#fff',
          }}
          aria-label={copied ? 'Copied' : 'Copy link'}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2} />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" strokeWidth={1.5} />
              Copy
            </>
          )}
        </button>
      </div>
      {copied && (
        <p className="text-sm text-[var(--color-success)] mt-2 font-medium" role="status">
          Link copied to clipboard.
        </p>
      )}
    </div>
  )
}
