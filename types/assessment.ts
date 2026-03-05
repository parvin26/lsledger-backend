/**
 * Phase 2: Per-question explainability types.
 * WhyAskedPayload provides audit trail for "why this question" per item.
 */

export interface WhyAskedPayload {
  rubric: { rubricId: string; levelHint?: string }
  evidenceTrigger: {
    anchors: string[]
    conceptsDetected: string[]
    missingSignal: string[]
  }
  purpose: {
    type: 'authorship_check' | 'application_check' | 'reasoning_check' | 'limitation_check'
  }
  decisionUse: {
    type: 'screening' | 'triage' | 'supplement'
  }
  scoringBasis: {
    featuresExpected: string[]
    commonFailureModes: string[]
  }
  governanceHooks?: {
    caelStandards?: string[]
    nistFunctions?: ('MAP' | 'MEASURE' | 'MANAGE')[]
  }
}

export interface QuestionWithWhyAsked {
  text: string
  layer: number
  criterion_code: string
  skill_tags: string[]
  evidence_anchors: string[]
  why_asked: WhyAskedPayload
}
