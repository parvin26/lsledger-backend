/**
 * Question budget for Lighthouse Ledger assessment runs.
 * Phase 4: hard cap of 15 for V1; stop rules for adaptive flow.
 */

import type { EvidenceForPrecheck } from './integrityPrecheck'

const HARD_CAP = 15

function estimateTokens(evidenceItems: EvidenceForPrecheck[]): number {
  let total = 0
  for (const e of evidenceItems) {
    total += (e.content?.length ?? 0) * 0.25 // rough chars-to-tokens
  }
  return Math.floor(total)
}

export function computeQuestionBudget(evidenceItems: EvidenceForPrecheck[]): number {
  const totalTokens = estimateTokens(evidenceItems)

  let budget: number
  if (totalTokens < 800) budget = 10
  else if (totalTokens < 4000) budget = 15
  else budget = 15

  return Math.min(budget, HARD_CAP)
}

export interface AssessmentRunForStop {
  questions_asked: number
  question_budget: number
  stop_reason?: string | null
}

export function shouldStop(
  run: AssessmentRunForStop,
  allCriteriaSatisfied: boolean,
  hasMajorContradictions: boolean
): boolean {
  if (run.questions_asked >= run.question_budget) {
    return true
  }
  if (allCriteriaSatisfied && !hasMajorContradictions) {
    return true
  }
  return false
}
