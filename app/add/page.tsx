'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { EvidenceItem } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'

const FILE_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg,.webp'

function isYouTubeUrl(url: string): boolean {
  const u = url.trim().toLowerCase()
  return u.includes('youtube.com/watch') || u.includes('youtu.be/')
}

function AddForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('entry_id')
  const [evidenceType, setEvidenceType] = useState<'link' | 'text' | 'file'>('text')
  const [evidenceContent, setEvidenceContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [intentPrompt, setIntentPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [replaceLoading, setReplaceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null)
  const [existingEvidence, setExistingEvidence] = useState<EvidenceItem[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!entryId) router.replace('/dashboard')
  }, [entryId, router])

  useEffect(() => {
    if (!entryId) return
    let cancelled = false
    setEvidenceLoading(true)
    const tokenPromise = GUEST_MODE_ENABLED ? Promise.resolve(null) : getAccessToken()
    tokenPromise
      .then((token) => {
        if (!GUEST_MODE_ENABLED && !token) return
        return api.getEvidence(token, entryId)
      })
      .then((res) => {
        if (!cancelled && res?.evidence?.length) setExistingEvidence(res.evidence)
      })
      .catch(() => {
        if (!cancelled) setExistingEvidence([])
      })
      .finally(() => {
        if (!cancelled) setEvidenceLoading(false)
      })
    return () => { cancelled = true }
  }, [entryId])

  const existingFile = existingEvidence.find((e) => e.evidence_type === 'file')

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
    } else if (evidenceType === 'text') {
      if (!trimmedContent || trimmedContent.length < 25) {
        setError('Please provide at least a short description of what you learned or did (a few sentences).')
        setEligibilityWarning(null)
        return
      }
    } else {
      if (!existingFile && (!file || file.size === 0)) {
        setError('Please select a file.')
        setEligibilityWarning(null)
        return
      }
    }

    setError(null)
    setEligibilityWarning(null)
    setLoading(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        setLoading(false)
        return
      }
      if (evidenceType === 'file' && !existingFile && file) {
        const formData = new FormData()
        formData.set('entry_id', entryId)
        formData.set('file', file)
        await api.uploadEvidence(token, formData)
      } else if (evidenceType !== 'file') {
        await api.addEvidence(token, { entry_id: entryId, evidence_type: evidenceType, content: trimmedContent })
      }
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

  async function handleReplaceFile() {
    if (!entryId || !fileInputRef.current?.files?.length) return
    const f = fileInputRef.current.files[0]
    if (!f || f.size === 0) return
    setReplaceLoading(true)
    setError(null)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        setReplaceLoading(false)
        return
      }
      const formData = new FormData()
      formData.set('entry_id', entryId)
      formData.set('file', f)
      await api.replaceEvidence(token, formData)
      const res = await api.getEvidence(token, entryId)
      setExistingEvidence(res.evidence ?? [])
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
      else setError(e?.message ?? 'Something went wrong.')
    } finally {
      setReplaceLoading(false)
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
      <p className="helper">Add a link, text, or file evidence, then describe your learning intent.</p>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="evidenceType" checked={evidenceType === 'link'} onChange={() => setEvidenceType('link')} />
                Link (YouTube, GitHub, course link)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="evidenceType" checked={evidenceType === 'text'} onChange={() => setEvidenceType('text')} />
                Text
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="evidenceType" checked={evidenceType === 'file'} onChange={() => setEvidenceType('file')} />
                File
              </label>
            </div>
          </div>

          {evidenceType === 'link' && (
            <>
              <label className="label">
                URL
                <input
                  type="url"
                  value={evidenceContent}
                  onChange={(e) => { setEvidenceContent(e.target.value); setError(null); setEligibilityWarning(null) }}
                  className="input"
                  placeholder="https://…"
                  disabled={loading}
                  required
                />
              </label>
              {isYouTubeUrl(evidenceContent) && (
                <p className="helper" style={{ marginTop: '-0.5rem', fontSize: '0.875rem' }}>
                  We&apos;ll read the video transcript where available to ask specific questions about what you watched.
                </p>
              )}
            </>
          )}

          {evidenceType === 'text' && (
            <label className="label">
              Evidence (what you learned or did)
              <input
                type="text"
                value={evidenceContent}
                onChange={(e) => { setEvidenceContent(e.target.value); setError(null); setEligibilityWarning(null) }}
                className="input"
                placeholder="Describe your learning…"
                disabled={loading}
                required
              />
            </label>
          )}

          {evidenceType === 'file' && (
            <div>
              {evidenceLoading ? (
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)' }}>Loading…</p>
              ) : existingFile ? (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current file: </span>
                  <span style={{ fontWeight: 500 }}>{existingFile.original_filename ?? existingFile.content ?? 'File'}</span>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={FILE_ACCEPT}
                      style={{ fontSize: '0.875rem' }}
                      onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={replaceLoading}
                      onClick={handleReplaceFile}
                    >
                      {replaceLoading ? 'Replacing…' : 'Replace file'}
                    </button>
                  </div>
                  {file && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>New file: {file.name}</p>}
                </div>
              ) : (
                <label className="label">
                  File (PDF, document, slide deck, image, etc.)
                  <input
                    type="file"
                    accept={FILE_ACCEPT}
                    className="input"
                    style={{ padding: '0.5rem' }}
                    disabled={loading}
                    required={evidenceType === 'file' && !existingFile}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                </label>
              )}
            </div>
          )}

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
