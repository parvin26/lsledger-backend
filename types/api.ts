// Request types
export interface CreateEntryRequest {
  title: string
  description?: string
}

export interface AddEvidenceRequest {
  entry_id: string
  evidence_type: 'link' | 'file' | 'text'
  content: string // URL for link, file path/ID for file, text content for text
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

export interface AddEvidenceResponse {
  evidence_id: string
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

export interface EvaluateAnswersResponse {
  capability_summary: string
  confidence_band: 'Low' | 'Medium' | 'High'
  rationale: string
  verification_id?: string
  public_id?: string
}

export interface VerificationRecord {
  public_id: string
  entry_id?: string // Optional, not exposed in public API
  domain: string
  capabilitySummary: string
  confidenceBand: 'Low' | 'Medium' | 'High'
  created_at: string
  intent_prompt?: string
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
  }
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
}
