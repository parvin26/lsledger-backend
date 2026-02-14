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

/* Small icons for evidence type segmented control */
function IconLink({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
function IconText({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}
function IconFile({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}
function IconUpload({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

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
  const [draftSaving, setDraftSaving] = useState(false)
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

  /** Save evidence and intent without running analysis or navigating. Reuses existing APIs. */
  async function handleSaveDraft() {
    if (!entryId) return
    setError(null)
    setDraftSaving(true)
    try {
      const token = GUEST_MODE_ENABLED ? null : await getAccessToken()
      if (!GUEST_MODE_ENABLED && !token) {
        router.replace('/login')
        setDraftSaving(false)
        return
      }
      const trimmedContent = evidenceContent.trim()
      const trimmedIntent = intentPrompt.trim()
      if (evidenceType === 'file' && !existingFile && file) {
        const formData = new FormData()
        formData.set('entry_id', entryId)
        formData.set('file', file)
        await api.uploadEvidence(token, formData)
      } else if (evidenceType !== 'file' && trimmedContent) {
        await api.addEvidence(token, { entry_id: entryId, evidence_type: evidenceType, content: trimmedContent })
      }
      if (trimmedIntent) {
        await api.saveIntent(token, { entry_id: entryId, intent_prompt: trimmedIntent })
      }
    } catch (err) {
      const e = err as ApiError
      if (!GUEST_MODE_ENABLED && e?.status === 401) router.replace('/login')
      else setError(e?.message ?? 'Something went wrong.')
    } finally {
      setDraftSaving(false)
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
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link
          href="/dashboard"
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-muted-text)', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}
        >
          ← Dashboard
        </Link>

        <header style={{ marginBottom: '2rem', position: 'relative' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-lighthouse-navy)' }}>
            Add evidence and intent
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-deep-slate)', marginBottom: '0.5rem' }}>
            Add your evidence, then explain why you want this reviewed.
          </p>
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-deep-slate)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'var(--color-card-shell)',
              padding: '0.25rem 0.75rem',
              borderRadius: 9999,
              border: '2px solid var(--color-deep-slate)',
            }}
          >
            STEP 1 OF 3 · EVIDENCE & INTENT
          </span>
        </header>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="error-msg" role="alert">{error}</p>
            <button type="button" onClick={() => setError(null)} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
              Back to evidence
            </button>
          </div>
        )}
        {eligibilityWarning && !error && (
          <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-beacon-red)', borderRadius: 8, background: 'rgba(196, 50, 45, 0.06)' }}>
            <p className="error-msg" style={{ marginTop: 0 }} role="alert">{eligibilityWarning}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>This is a recommendation, not a final judgment. You can edit evidence below or continue to assessment.</p>
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
          <form onSubmit={handleSubmit}>
            <div className="ds-card" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                  Evidence type
                </label>
                <div className="ds-segmented" role="group" aria-label="Evidence type">
                  {(['link', 'text', 'file'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={evidenceType === type ? 'active' : ''}
                      aria-pressed={evidenceType === type}
                      onClick={() => setEvidenceType(type)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                    >
                      {type === 'link' && <IconLink size={16} />}
                      {type === 'text' && <IconText size={16} />}
                      {type === 'file' && <IconFile size={16} />}
                      {type === 'link' ? 'Link' : type === 'text' ? 'Text' : 'File'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>
                  Use a link for GitHub, decks, videos, or shared docs.
                </p>
              </div>

              {evidenceType === 'link' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                      Evidence (what you learned or did) / Link URL
                    </label>
                    <input
                      type="url"
                      value={evidenceContent}
                      onChange={(e) => { setEvidenceContent(e.target.value); setError(null); setEligibilityWarning(null) }}
                      className="input"
                      placeholder="https://…"
                      disabled={loading}
                      required
                      style={{ background: 'rgba(246, 241, 232, 0.3)' }}
                    />
                  </div>
                  {isYouTubeUrl(evidenceContent) && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginTop: '-0.5rem' }}>
                      We&apos;ll read the video transcript where available to ask specific questions about what you watched.
                    </p>
                  )}
                </>
              )}

              {evidenceType === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                    Evidence (what you learned or did)
                  </label>
                  <input
                    type="text"
                    value={evidenceContent}
                    onChange={(e) => { setEvidenceContent(e.target.value); setError(null); setEligibilityWarning(null) }}
                    className="input"
                    placeholder="Describe your learning or paste a link title…"
                    disabled={loading}
                    required
                    style={{ background: 'rgba(246, 241, 232, 0.3)' }}
                  />
                </div>
              )}

              {evidenceType === 'file' && (
                <div style={{ marginBottom: '1rem' }}>
                  {evidenceLoading ? (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted-text)' }}>Loading…</p>
                  ) : existingFile ? (
                    <div style={{ padding: '0.75rem', border: '1px solid var(--color-divider)', borderRadius: 8, background: 'var(--color-sand-background)' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)' }}>Current file: </span>
                      <span style={{ fontWeight: 500 }}>{existingFile.original_filename ?? existingFile.content ?? 'File'}</span>
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={FILE_ACCEPT}
                          style={{ fontSize: '0.875rem' }}
                          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                        />
                        <button type="button" className="btn-secondary" disabled={replaceLoading} onClick={handleReplaceFile}>
                          {replaceLoading ? 'Replacing…' : 'Replace file'}
                        </button>
                      </div>
                      {file && <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>New file: {file.name}</p>}
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'block',
                        border: '2px dashed var(--color-divider)',
                        borderRadius: 12,
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    >
                      <input
                        type="file"
                        accept={FILE_ACCEPT}
                        style={{ display: 'none' }}
                        disabled={loading}
                        required={evidenceType === 'file' && !existingFile}
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      <span style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-muted-text)' }}><IconUpload size={28} /></span>
                      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-lighthouse-navy)', marginBottom: '0.25rem' }}>
                        Drag a file here or choose from your device
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)' }}>PDF, PNG, JPG up to 10MB</span>
                      {file && <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                    </label>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ marginBottom: '0.25rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                  Intent (why you want this reviewed)
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>
                  Share the context, goal, or challenge. This helps reviewers understand your depth.
                </p>
                <textarea
                  value={intentPrompt}
                  onChange={(e) => { setIntentPrompt(e.target.value); setError(null); setEligibilityWarning(null) }}
                  className="input"
                  rows={4}
                  style={{ minHeight: '100px', resize: 'vertical', background: 'rgba(246, 241, 232, 0.3)' }}
                  placeholder='e.g. "Learning for a client project. Tried a new approach to error handling and want feedback on my reasoning."'
                  disabled={loading}
                  required
                />
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-divider)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={loading || draftSaving}
                  onClick={handleSaveDraft}
                >
                  {draftSaving ? 'Saving…' : 'Save as draft'}
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving and analyzing…' : 'Save and continue'}
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginLeft: 'auto' }}>
                  You can edit this entry before it&apos;s sent for review.
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AddPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted-text)' }}>Loading…</div>}>
      <AddForm />
    </Suspense>
  )
}
