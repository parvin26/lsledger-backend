'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

function AddForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('entry_id')
  const [evidenceType, setEvidenceType] = useState<'link' | 'text'>('text')
  const [evidenceContent, setEvidenceContent] = useState('')
  const [intentPrompt, setIntentPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!entryId) router.replace('/dashboard')
  }, [entryId, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!entryId) return
    const trimmedContent = evidenceContent.trim()
    const trimmedIntent = intentPrompt.trim()

    if (!trimmedIntent) {
      setError('Intent is required.')
      setEligibilityWarning(null)
      return
    }
    if (evidenceType === 'link') {
      if (!trimmedContent) {
        setError('Please enter a URL for link evidence.')
        setEligibilityWarning(null)
        return
      }
    } else {
      if (!trimmedContent || trimmedContent.length < 25) {
        setError('Please provide at least a short description of what you learned or did (a few sentences).')
        setEligibilityWarning(null)
        return
      }
    }

    setError(null)
    setEligibilityWarning(null)
    setLoading(true)
    try {
      const token = await getAccessToken()
      await api.addEvidence(token, { entry_id: entryId, evidence_type: evidenceType, content: trimmedContent })
      await api.saveIntent(token, { entry_id: entryId, intent_prompt: trimmedIntent })
      const analysis = await api.analyzeEntry(token, entryId)
      if (analysis.eligible) {
        router.push(`/assessment?entry_id=${entryId}`)
      } else {
        setEligibilityWarning(analysis.eligibility_reason ?? 'Evidence was marked as not ideal for assessment.')
      }
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
      else setError(e?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function goToAssessment() {
    if (entryId) router.push(`/assessment?entry_id=${entryId}`)
  }

  if (!entryId) return null

  return (
    <div className="form-card" style={{ paddingTop: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </header>
      <h1 className="heading">Add evidence and intent</h1>
      <p className="helper">Add a link or text evidence, then describe your learning intent.</p>
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <p className="error-msg" role="alert">{error}</p>
          <button type="button" onClick={() => setError(null)} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
            Back to evidence
          </button>
        </div>
      )}
      {eligibilityWarning && !error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--ledger-crimson)', borderRadius: '6px', background: 'rgba(183, 28, 42, 0.06)' }}>
          <p className="error-msg" style={{ marginTop: 0 }} role="alert">{eligibilityWarning}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This is a recommendation, not a final judgment. You can edit evidence below or continue to assessment.</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setEligibilityWarning(null)} className="btn-secondary">
              Back to evidence
            </button>
            <button type="button" onClick={goToAssessment} className="btn-primary">
              Continue anyway
            </button>
          </div>
        </div>
      )}
      {!error && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Evidence type</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="evidenceType" checked={evidenceType === 'link'} onChange={() => setEvidenceType('link')} />
                Link (YouTube, GitHub, course link)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="evidenceType" checked={evidenceType === 'text'} onChange={() => setEvidenceType('text')} />
                Text
              </label>
            </div>
          </div>
          <label className="label">
            {evidenceType === 'link' ? 'URL' : 'Evidence (what you learned or did)'}
            <input
              type={evidenceType === 'link' ? 'url' : 'text'}
              value={evidenceContent}
              onChange={(e) => { setEvidenceContent(e.target.value); setError(null); setEligibilityWarning(null) }}
              className="input"
              placeholder={evidenceType === 'link' ? 'https://…' : 'Describe your learning…'}
              disabled={loading}
              required
            />
          </label>
          <label className="label">
            Intent (why or how you want this reviewed)
            <textarea
              value={intentPrompt}
              onChange={(e) => { setIntentPrompt(e.target.value); setError(null); setEligibilityWarning(null) }}
              className="input"
              rows={4}
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="e.g. Learning for a project. Applied it in practice."
              disabled={loading}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving and analyzing…' : 'Save and continue'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="form-card" style={{ paddingTop: '2rem' }}><p>Loading…</p></div>}>
      <AddForm />
    </Suspense>
  )
}
