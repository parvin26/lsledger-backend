/**
 * Rubric service for Lighthouse Ledger.
 * Fetches rubric and criteria for a domain; falls back to generic MBA rubric.
 */

import { supabaseServer } from '@/lib/supabaseServer'

export interface RubricCriterion {
  id: string
  code: string
  name: string
  description: string
  level_descriptors: {
    excellent?: string
    proficient?: string
    needs_improvement?: string
  }
  evidence_types?: string[]
}

export interface RubricWithCriteria {
  id: string
  name: string
  domain: string
  description: string | null
  version: string
  criteria: RubricCriterion[]
}

const GENERIC_RUBRIC_ID = 'rubric_mba_generic_v1'

export async function getRubricForDomain(domain: string | null): Promise<RubricWithCriteria | null> {
  try {
    const domainKey = domain?.trim() || 'Generic'

    const { data: rubricRow, error: rubricError } = await supabaseServer
      .from('rubrics')
      .select('id, name, domain, description, version')
      .in('domain', [domainKey, 'Generic'])
      .order('domain', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (rubricError || !rubricRow) {
      return getGenericRubric()
    }

    const { data: criteriaRows, error: criteriaError } = await supabaseServer
      .from('rubric_criteria')
      .select('id, code, name, description, level_descriptors, evidence_types')
      .eq('rubric_id', rubricRow.id)
      .order('code')

    if (criteriaError) {
      return getGenericRubric()
    }

    const criteria: RubricCriterion[] = (criteriaRows ?? []).map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      level_descriptors: (r.level_descriptors as RubricCriterion['level_descriptors']) ?? {},
      evidence_types: r.evidence_types ?? [],
    }))

    return {
      id: rubricRow.id,
      name: rubricRow.name,
      domain: rubricRow.domain,
      description: rubricRow.description,
      version: rubricRow.version,
      criteria,
    }
  } catch {
    return null
  }
}

async function getGenericRubric(): Promise<RubricWithCriteria | null> {
  const { data: rubricRow } = await supabaseServer
    .from('rubrics')
    .select('id, name, domain, description, version')
    .eq('id', GENERIC_RUBRIC_ID)
    .single()

  if (!rubricRow) return null

  const { data: criteriaRows } = await supabaseServer
    .from('rubric_criteria')
    .select('id, code, name, description, level_descriptors, evidence_types')
    .eq('rubric_id', GENERIC_RUBRIC_ID)
    .order('code')

  const criteria: RubricCriterion[] = (criteriaRows ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    level_descriptors: (r.level_descriptors as RubricCriterion['level_descriptors']) ?? {},
    evidence_types: r.evidence_types ?? [],
  }))

  return {
    id: rubricRow.id,
    name: rubricRow.name,
    domain: rubricRow.domain,
    description: rubricRow.description,
    version: rubricRow.version,
    criteria,
  }
}
