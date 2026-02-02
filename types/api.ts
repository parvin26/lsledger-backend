// Request types
export interface CreateEntryRequest {
  title: string
  description?: string
}

export interface AddEvidenceRequest {
  entry_id: string
  evidence_type: 'link' | 'file' | 'text'
  content: string // URL for link, text content for text; for file use upload API
}

export interface AddEvidenceResponse {
  evidence_id: string
  created_at: string
}

/** File metadata stored in evidence when evidence_type = 'file' */
export interface EvidenceFileMetadata {
  storage_path: string
  original_filename: string
  mime_type: string
  size: number
}

/** Single evidence item (for GET /api/evidence?entry_id=) */
export interface EvidenceItem {
  id: string
  evidence_type: 'link' | 'file' | 'text'
  content: string | null
  storage_path?: string | null
  original_filename?: string | null
  mime_type?: string | null
  size?: number | null
  transcript?: string | null
  created_at: string
}

export interface GetEvidenceResponse {
  evidence: EvidenceItem[]
}

export interface SignedUrlResponse {
  url: string
  expires_at?: string
}

export interface SaveIntentRequest {
  entry_id: string
  intent_prompt: string
}

export interface AnalyzeEvidenceRequest {
  entry_id: string
}

export interface GenerateQuestionsRequest {
  entry_id: string
}

export interface EvaluateAnswersRequest {
  entry_id: string
  answers: Array<{
    questionNumber: number
    answer: string
  }>
}

// Response types
export interface CreateEntryResponse {
  entry_id: string
  created_at: string
}

export interface SaveIntentResponse {
  success: boolean
}

export interface AnalyzeEvidenceResponse {
  primary_domain: string
  secondary_domain: string | null
  complexity_level: 'Beginner' | 'Intermediate' | 'Advanced'
  eligible: boolean
  eligibility_reason: string
  key_topics: string[]
  evaluator_lens: string
}

export interface GenerateQuestionsResponse {
  q1: string
  q2: string
  q3: string
  q4: string
}

export type LayerDescriptor = 'Strong' | 'Adequate' | 'Needs work'

export interface EvaluateAnswersResponse {
  capability_summary: string
  confidence_band: 'Low' | 'Medium' | 'High'
  rationale: string
  verification_id?: string
  public_id?: string
  layer1_descriptor?: LayerDescriptor
  layer2_descriptor?: LayerDescriptor
  layer3_descriptor?: LayerDescriptor
  layer4_descriptor?: LayerDescriptor
}

export interface VerificationRecord {
  public_id: string
  entry_id?: string // Optional, not exposed in public API
  domain: string
  capabilitySummary: string
  confidenceBand: 'Low' | 'Medium' | 'High'
  created_at: string
  intent_prompt?: string
  evidence_summary?: string
  layer1_descriptor?: LayerDescriptor
  layer2_descriptor?: LayerDescriptor
  layer3_descriptor?: LayerDescriptor
  layer4_descriptor?: LayerDescriptor
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
}

export type EntryStatus = 'Recorded only' | 'Under review' | 'Reviewed' | 'Reviewed – link available'

export interface TimelineEntry {
  id: string
  created_at: string
  title: string
  evidence_summary: string
  status: EntryStatus
  public_id?: string
  /** When primary evidence is a file, set so the client can get a signed download URL */
  file_evidence_id?: string
}

export interface ListEntriesResponse {
  entries: TimelineEntry[]
}

// AI response types (match prompt outputs exactly)
export interface DomainClassification {
  primary_domain: 'Finance' | 'Technology' | 'Software_Product' | 'Business_Strategy'
  secondary_domain: string | null
  complexity_level: 'Beginner' | 'Intermediate' | 'Advanced'
  eligible: boolean
  eligibility_reason: string
  key_topics: string[]
  evaluator_lens: string
}

export interface QuestionGeneration {
  q1: string
  q2: string
  q3: string
  q4: string
}

export interface AnswerEvaluation {
  capability_summary: string
  confidence_band: 'Low' | 'Medium' | 'High'
  rationale: string
  layer1_descriptor: LayerDescriptor
  layer2_descriptor: LayerDescriptor
  layer3_descriptor: LayerDescriptor
  layer4_descriptor: LayerDescriptor
}
