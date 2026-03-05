/** Fixed demo entry ID for Amina – Grocery Shop Operations */
export const DEMO_AMINA_ENTRY_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
export const DEMO_AMINA_VERIFY_ID = 'demo-amina-verify-v1'

export interface DemoAminaEvidence {
  id: string
  evidence_type: 'link' | 'file' | 'text'
  content: string | null
  transcript?: string | null
  created_at: string
}

export interface DemoAminaQuestion {
  question_number: number
  question_text: string
  layer_number: number | null
  criterion_code: string | null
  skill_tags: string[]
  evidence_anchors: unknown[]
  why_asked: Record<string, unknown>
}

export interface DemoAminaAnswer {
  question_number: number
  answer_text: string
}

export interface DemoAminaCriterionScore {
  criterion_code: string
  criterion_name: string
  score: number // 3=Strong, 2=Adequate, 1=Needs work
  descriptor: string
}

export interface DemoAminaResponse {
  entry: {
    id: string
    title: string
    domain: string
    intent_prompt: string | null
    capability_summary: string | null
    confidence_band: string | null
  }
  evidence: DemoAminaEvidence[]
  questions: DemoAminaQuestion[]
  answers: DemoAminaAnswer[]
  verification: {
    public_id: string
    capability_summary: string
    confidence_band: string
    evidence_summary: string | null
    layer1_descriptor: string | null
    layer2_descriptor: string | null
    layer3_descriptor: string | null
    layer4_descriptor: string | null
    rubric_id: string | null
  }
  rubric_breakdown: DemoAminaCriterionScore[]
}
