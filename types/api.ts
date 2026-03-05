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

/** Provenance payload for evidence (Phase 1 integrity) */
export interface ProvenancePayload {
  ownership_assertion?: string
  permissions_assertion?: string
  third_party_data?: boolean
  notes?: string
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
  /** Phase 1: admissibility and provenance */
  admissible?: boolean | null
  integrity_flags?: string[] | null
  provenance?: ProvenancePayload | null
}

export interface GetEvidenceResponse {
  evidence: EvidenceItem[]
}

export interface SignedUrlResponse {
  url: string
  expires_at?: string
}

/** Structured intent category for "What do you want this review to help with?" */
export type IntentCategory =
  | 'phd_application'
  | 'employer_review'
  | 'self_learning'
  | 'funding_application'
  | 'course_progress'
  | 'other'

export interface SaveIntentRequest {
  entry_id: string
  /** @deprecated Use intent_category + intent_details. Kept for backward compatibility. */
  intent_prompt?: string
  intent_category: IntentCategory
  intent_details?: string | null
}

/** Entry intent payload (for loading existing entry on Add page) */
export interface EntryIntentPayload {
  intent_category: IntentCategory | null
  intent_details: string | null
  intent_prompt: string | null
}

export interface GetEntryIntentResponse extends EntryIntentPayload {}

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
    /** Open question: text answer. MCQ: omit or empty; use selectedOptionIndex instead. */
    answer?: string
    /** MCQ only: 0-based index of selected option */
    selectedOptionIndex?: number
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

/** MCQ question returned to client (question_number 5+) */
export interface McqQuestionItem {
  questionNumber: number
  text: string
  options: string[]
}

export interface GenerateQuestionsResponse {
  q1: string
  q2: string
  q3: string
  q4: string
  /** Additional MCQ questions when question_budget > 4 */
  mcqs?: McqQuestionItem[]
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

/** Phase 6: question format (open vs MCQ) */
export type QuestionFormat = 'open' | 'mcq'

/** Phase 2 + Phase 6: structured question with WhyAsked metadata; supports MCQ */
export interface QuestionGenerationItem {
  format?: QuestionFormat
  text: string
  options?: string[]
  correctOptionIndex?: number
  layer?: number
  criterion_code?: string
  skill_tags?: string[]
  evidence_anchors?: string[]
  why_asked?: Record<string, unknown>
}

/** Phase 2 AI output: 4 open questions + optional MCQs */
export interface QuestionGeneration {
  q1: QuestionGenerationItem
  q2: QuestionGenerationItem
  q3: QuestionGenerationItem
  q4: QuestionGenerationItem
  mcqs?: QuestionGenerationItem[]
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
