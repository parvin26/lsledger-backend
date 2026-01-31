import { request } from './apiClient'
import { GUEST_MODE_ENABLED } from './featureFlags'
import type {
  CreateEntryRequest,
  CreateEntryResponse,
  AddEvidenceRequest,
  AddEvidenceResponse,
  SaveIntentRequest,
  SaveIntentResponse,
  AnalyzeEvidenceResponse,
  GenerateQuestionsResponse,
  EvaluateAnswersRequest,
  EvaluateAnswersResponse,
  VerificationRecord,
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

export async function saveIntent(token: string | null, body: SaveIntentRequest): Promise<SaveIntentResponse> {
  return request<SaveIntentResponse>('/api/intent/save', 'POST', tokenOrThrow(token), body)
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
