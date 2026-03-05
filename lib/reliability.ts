/**
 * Phase 5: Reliability metrics — Cohen's kappa for inter-rater agreement.
 * Target for pilots: kappa >= 0.8 on double-rated items.
 */

import { supabaseServer } from '@/lib/supabaseServer'

export interface ReliabilityResult {
  criterion_code: string
  kappa: number | null
  percentAgreement: number
  meetsThreshold: boolean
  raterA: string
  raterB: string
}

function cohenKappa(aScores: number[], bScores: number[]): number {
  if (aScores.length !== bScores.length || aScores.length === 0) return 0
  const n = aScores.length
  const categories = [...new Set([...aScores, ...bScores])]
  const pObs = aScores.filter((a, i) => a === bScores[i]).length / n
  const pExp =
    categories.reduce((sum, c) => {
      const pa = aScores.filter((a) => a === c).length / n
      const pb = bScores.filter((b) => b === c).length / n
      return sum + pa * pb
    }, 0) || 0
  if (pExp >= 1) return 0
  return (pObs - pExp) / (1 - pExp)
}

export async function computeCohensKappa(
  runId: string,
  criterionCode: string,
  raterA: string,
  raterB: string
): Promise<{ kappa: number | null; percentAgreement: number }> {
  const { data: records, error } = await supabaseServer
    .from('scoring_records')
    .select('rater_id, score')
    .eq('run_id', runId)
    .eq('criterion_code', criterionCode)
    .in('rater_id', [raterA, raterB])

  if (error || !records || records.length === 0) {
    return { kappa: null, percentAgreement: 0 }
  }

  const aScores = records.filter((r) => r.rater_id === raterA).map((r) => r.score)
  const bScores = records.filter((r) => r.rater_id === raterB).map((r) => r.score)

  if (aScores.length !== bScores.length || aScores.length === 0) {
    return { kappa: null, percentAgreement: 0 }
  }

  const agreement = aScores.filter((a, i) => a === bScores[i]).length
  const percentAgreement = (agreement / aScores.length) * 100
  const kappa = cohenKappa(aScores, bScores)

  return { kappa, percentAgreement }
}

export async function getReliabilityForRun(runId: string): Promise<ReliabilityResult[]> {
  const { data: run } = await supabaseServer
    .from('assessment_runs')
    .select('id')
    .eq('id', runId)
    .single()

  if (!run) return []

  const { data: records } = await supabaseServer
    .from('scoring_records')
    .select('rater_id, criterion_code')
    .eq('run_id', runId)

  if (!records || records.length === 0) return []

  const raters = [...new Set(records.map((r) => r.rater_id))]
  if (raters.length < 2) return []

  const criteria = [...new Set(records.map((r) => r.criterion_code))]
  const [raterA, raterB] = raters

  const results: ReliabilityResult[] = []
  for (const criterion of criteria) {
    const { kappa, percentAgreement } = await computeCohensKappa(
      runId,
      criterion,
      raterA,
      raterB
    )
    results.push({
      criterion_code: criterion,
      kappa: kappa ?? 0,
      percentAgreement,
      meetsThreshold: kappa !== null && kappa >= 0.8,
      raterA,
      raterB,
    })
  }
  return results
}
