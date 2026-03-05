import { request } from './apiClient'
import { GUEST_MODE_ENABLED } from './featureFlags'
import { requestMultipart } from './apiClient'
import type {
  CreateEntryRequest,
  CreateEntryResponse,
  AddEvidenceRequest,
  AddEvidenceResponse,
  SaveIntentRequest,
  SaveIntentResponse,
  GetEntryIntentResponse,
  AnalyzeEvidenceResponse,
  GenerateQuestionsResponse,
  EvaluateAnswersRequest,
  EvaluateAnswersResponse,
  VerificationRecord,
  ListEntriesResponse,
  GetEvidenceResponse,
  SignedUrlResponse,
} from '@/types/api'

function tokenOrThrow(token: string | null): string | null {
  if (!GUEST_MODE_ENABLED && !token) throw { code: 'UNAUTHORIZED', message: 'Please sign in to continue.', status: 401 } as const
  return token
}

export async function createEntry(token: string | null, body: CreateEntryRequest): Promise<CreateEntryResponse> {
  return request<CreateEntryResponse>('/api/entry/create', 'POST', tokenOrThrow(token), body)
}

export async function addEvidence(token: string | null, body: AddEvidenceRequest): Promise<AddEvidenceResponse> {
  return request<AddEvidenceResponse>('/api/evidence/add', 'POST', tokenOrThrow(token), body)
}

export async function uploadEvidence(token: string | null, formData: FormData): Promise<AddEvidenceResponse> {
  return requestMultipart<AddEvidenceResponse>('/api/evidence/upload', 'POST', tokenOrThrow(token), formData)
}

export async function replaceEvidence(token: string | null, formData: FormData): Promise<AddEvidenceResponse> {
  return requestMultipart<AddEvidenceResponse>('/api/evidence/replace', 'POST', tokenOrThrow(token), formData)
}

export async function getEvidence(token: string | null, entryId: string): Promise<GetEvidenceResponse> {
  return request<GetEvidenceResponse>(`/api/evidence?entry_id=${encodeURIComponent(entryId)}`, 'GET', tokenOrThrow(token))
}

export async function getEvidenceSignedUrl(token: string | null, evidenceId: string): Promise<SignedUrlResponse> {
  return request<SignedUrlResponse>(`/api/evidence/${evidenceId}/signed-url`, 'GET', tokenOrThrow(token))
}

export async function saveIntent(token: string | null, body: SaveIntentRequest): Promise<SaveIntentResponse> {
  return request<SaveIntentResponse>('/api/intent/save', 'POST', tokenOrThrow(token), body)
}

export async function getEntryIntent(token: string | null, entryId: string): Promise<GetEntryIntentResponse> {
  return request<GetEntryIntentResponse>(`/api/entry/intent?entry_id=${encodeURIComponent(entryId)}`, 'GET', tokenOrThrow(token))
}

export async function analyzeEntry(token: string | null, entryId: string): Promise<AnalyzeEvidenceResponse> {
  return request<AnalyzeEvidenceResponse>('/api/ai/analyze', 'POST', tokenOrThrow(token), { entry_id: entryId })
}

export async function generateQuestions(token: string | null, entryId: string): Promise<GenerateQuestionsResponse> {
  return request<GenerateQuestionsResponse>('/api/ai/questions', 'POST', tokenOrThrow(token), { entry_id: entryId })
}

export async function evaluateAnswers(
  token: string | null,
  body: EvaluateAnswersRequest
): Promise<EvaluateAnswersResponse> {
  return request<EvaluateAnswersResponse>('/api/ai/evaluate', 'POST', tokenOrThrow(token), body)
}

/** Public endpoint — no token. */
export async function getVerification(publicId: string): Promise<VerificationRecord> {
  return request<VerificationRecord>(`/api/verify/${publicId}`, 'GET', null)
}

export async function listEntries(token: string | null): Promise<ListEntriesResponse> {
  return request<ListEntriesResponse>('/api/entries', 'GET', tokenOrThrow(token))
}

/** Admin: list assessment runs for an entry */
export async function getAssessmentRuns(
  token: string | null,
  entryId: string
): Promise<{ entryId: string; runs: Array<{ runId: string; startedAt: string; completedAt: string | null; questionBudget: number; questionsAsked: number; stopReason: string | null; integrityFlags: string[]; rubricId: string | null; confidenceCategory: string | null }> }> {
  return request(`/api/admin/assessment-runs?entryId=${encodeURIComponent(entryId)}`, 'GET', tokenOrThrow(token))
}

/** Admin: override verification for a run */
export async function overrideAssessmentRun(
  token: string | null,
  runId: string,
  body: { finalCapabilitySummary: string; finalConfidenceBand: 'Low' | 'Medium' | 'High'; overrideReason?: string; caelStandards?: string[] }
): Promise<{ ok: boolean }> {
  return request(`/api/assessments/${runId}/override`, 'POST', tokenOrThrow(token), body)
}

/** Admin: get reliability (kappa) for a run */
export async function getReliability(
  token: string | null,
  runId: string
): Promise<{ run_id: string; entry_id: string; criteria: Array<{ criterion_code: string; kappa: number; percentAgreement: number; meetsThreshold: boolean; raterA: string; raterB: string }> }> {
  return request(`/api/reliability/run/${runId}`, 'GET', tokenOrThrow(token))
}
