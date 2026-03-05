/**
 * NIST AI RMF: bias monitoring for question generation.
 * Phase 3: initial heuristic check for banned terms.
 */

const BANNED_TERMS = ['stupid', 'lazy', 'crazy', 'dumb', 'incompetent']

export interface BiasCheckResult {
  status: 'passed' | 'flagged'
  issues: string[]
}

export function checkQuestionBias(
  text: string,
  options?: string[]
): BiasCheckResult {
  const issues: string[] = []
  const blob = [text, ...(options ?? [])].join(' ').toLowerCase()

  for (const term of BANNED_TERMS) {
    if (blob.includes(term)) {
      issues.push(`contains_banned_term:${term}`)
    }
  }

  return {
    status: issues.length > 0 ? 'flagged' : 'passed',
    issues,
  }
}
