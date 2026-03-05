'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAccessToken } from '@/lib/supabaseClient'
import * as api from '@/lib/ledgerApi'
import type { ApiError } from '@/lib/apiClient'
import type { EvidenceItem, IntentCategory } from '@/types/api'
import { GUEST_MODE_ENABLED } from '@/lib/featureFlags'
import { TopHeader, Card } from '@/app/components/ui'

const FILE_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg,.webp'

const INTENT_OPTIONS: { value: IntentCategory; label: string }[] = [
  { value: 'phd_application', label: 'Apply for a programme or scholarship (e.g. PhD, fellowship).' },
  { value: 'employer_review', label: 'Show capability to an employer or client.' },
  { value: 'self_learning', label: 'Get feedback for my own learning.' },
  { value: 'funding_application', label: 'Support a funding or grant application.' },
  { value: 'course_progress', label: 'Progress inside an existing course or training.' },
  { value: 'other', label: 'Other (something else).' },
]

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
  const [intentCategory, setIntentCategory] = useState<IntentCategory | null>(null)
  const [intentDetails, setIntentDetails] = useState('')
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

  useEffect(() => {
    if (!entryId) return
    let cancelled = false
    const tokenPromise = GUEST_MODE_ENABLED ? Promise.resolve(null) : getAccessToken()
    tokenPromise
      .then((token) => {
        if (!GUEST_MODE_ENABLED && !token) return
        return api.getEntryIntent(token, entryId)
      })
      .then((res) => {
        if (cancelled || !res) return
        if (res.intent_category) {
          setIntentCategory(res.intent_category)
          setIntentDetails(res.intent_details ?? '')
        } else if (res.intent_prompt) {
          setIntentCategory('other')
          setIntentDetails(res.intent_prompt)
        }
      })
      .catch(() => { /* ignore; form starts empty */ })
    return () => { cancelled = true }
  }, [entryId])

  const existingFile = existingEvidence.find((e) => e.evidence_type === 'file')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!entryId) return
    const trimmedContent = evidenceContent.trim()

    if (!intentCategory) {
      setError('Please select what you want this review to help with.')
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
      await api.saveIntent(token, {
        entry_id: entryId,
        intent_category: intentCategory,
        intent_details: intentDetails.trim() || null,
      })
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
      if (evidenceType === 'file' && !existingFile && file) {
        const formData = new FormData()
        formData.set('entry_id', entryId)
        formData.set('file', file)
        await api.uploadEvidence(token, formData)
      } else if (evidenceType !== 'file' && trimmedContent) {
        await api.addEvidence(token, { entry_id: entryId, evidence_type: evidenceType, content: trimmedContent })
      }
      if (intentCategory) {
        await api.saveIntent(token, {
          entry_id: entryId,
          intent_category: intentCategory,
          intent_details: intentDetails.trim() || null,
        })
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
    <div style={{ minHeight: '100vh', background: 'var(--color-sand-background)', padding: '2rem 1.5rem', paddingTop: '2.5rem' }}>
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
              color: 'var(--color-lighthouse-navy)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'var(--color-card-shell)',
              padding: '0.25rem 0.75rem',
              borderRadius: 9999,
              border: '1px solid var(--color-divider)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            STEP 1 OF 3 · EVIDENCE & INTENT
          </span>
        </header>

        {error && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="error-msg" role="alert">{error}</p>
            {(error.includes('mime_type') || error.includes('schema cache')) && (
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--color-deep-slate)' }}>
                Run the database migration: add <code>SUPABASE_DB_PASSWORD</code> to .env.local and run <code>npm run migrate</code>, or run the SQL in{' '}
                <a href="https://supabase.com/dashboard/project/ukhaafefmhadggcbgnew/sql/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ledger-crimson)' }}>Supabase SQL Editor</a>. See <code>docs/MIGRATE_QUICK.md</code>.
              </p>
            )}
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
              <button
                type="button"
                onClick={goToAssessment}
                className="btn-primary-brand"
              >
                Continue anyway
              </button>
            </div>
          </div>
        )}

        {!error && (
          <form id="add-form" onSubmit={handleSubmit}>
            <Card variant="default" className="p-5 sm:p-6 mt-6 add-form-card">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg font-semibold text-[var(--color-muted-text)]">01</span>
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-lighthouse-navy)' }}>
                  Evidence type
                </h2>
              </div>
              <div className="mb-5">
                <div className="ds-segmented ds-segmented-primary" role="group" aria-label="Evidence type">
                  {(['link', 'text', 'file'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={evidenceType === type ? 'active' : ''}
                      aria-pressed={evidenceType === type}
                      onClick={() => setEvidenceType(type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      {type === 'link' && <IconLink size={16} />}
                      {type === 'text' && <IconText size={16} />}
                      {type === 'file' && <IconFile size={16} />}
                      {type === 'link' ? 'Link' : type === 'text' ? 'Text' : 'File'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--color-muted-text)] mt-2">
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
                      style={{ background: 'var(--color-card-shell)', borderColor: 'var(--color-border-subtle)' }}
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
                    style={{ background: 'var(--color-card-shell)', borderColor: 'var(--color-border-subtle)' }}
                  />
                </div>
              )}

              {evidenceType === 'file' && (
                <div style={{ marginBottom: '1rem' }}>
                  {evidenceLoading ? (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted-text)' }}>Loading…</p>
                  ) : existingFile ? (
                    <div className="p-3 rounded-lg border" style={{ background: 'var(--color-app-bg)', borderColor: 'var(--color-border-subtle)' }}>
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
                      <span className="block text-xs text-[var(--color-muted-text)]">PDF, DOC, PPT, XLS, TXT, MD, PNG, JPG up to 10MB</span>
                      <span className="block text-xs text-[var(--color-muted-text)] mt-1">We use your evidence to ask relevant questions about what you learned.</span>
                      {file && <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-text)', marginTop: '0.5rem' }}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                    </label>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ marginBottom: '0.25rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                  What do you want this review to help with?
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginBottom: '0.75rem' }}>
                  This helps us understand how you plan to use the capability record.
                </p>
                <div role="group" aria-label="Intent category" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {INTENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9375rem',
                        color: 'var(--color-deep-slate)',
                      }}
                    >
                      <input
                        type="radio"
                        name="intent_category"
                        value={opt.value}
                        checked={intentCategory === opt.value}
                        onChange={() => {
                          setIntentCategory(opt.value)
                          setError(null)
                          setEligibilityWarning(null)
                        }}
                        disabled={loading}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label className="label" style={{ marginBottom: '0.25rem', display: 'block', color: 'var(--color-lighthouse-navy)', fontSize: '0.875rem' }}>
                    Other / extra context
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)', marginBottom: '0.5rem' }}>
                    Use your own words if you want to add more context.
                  </p>
                  <textarea
                    value={intentDetails}
                    onChange={(e) => { setIntentDetails(e.target.value); setError(null); setEligibilityWarning(null) }}
                    className="input"
                    rows={2}
                    style={{ minHeight: '60px', resize: 'vertical', background: 'var(--color-card-shell)', borderColor: 'var(--color-border-subtle)' }}
                    placeholder="Describe in your own words (optional)."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="pt-5 mt-5 flex flex-wrap items-center gap-3" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold border-2 transition-all disabled:opacity-60"
                  style={{
                    borderColor: 'var(--color-lighthouse-navy)',
                    color: 'var(--color-lighthouse-navy)',
                    background: 'transparent',
                  }}
                  disabled={loading || draftSaving}
                  onClick={handleSaveDraft}
                >
                  {draftSaving ? 'Saving…' : 'Save as draft'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-ledger-crimson)' }}
                  disabled={loading || !intentCategory}
                >
                  {loading ? 'Saving and analyzing…' : 'Save and continue'}
                </button>
                <span className="text-xs text-[var(--color-muted-text)] ml-auto">
                  You can edit this entry before it&apos;s sent for review.
                </span>
              </div>
            </Card>
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
