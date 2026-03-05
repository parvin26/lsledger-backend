/**
 * Integrity precheck service for Lighthouse Ledger.
 * Runs before question generation to validate evidence admissibility.
 * Per concept note: authorship, provenance, admissibility checks.
 */

export type IntegrityFlag =
  | 'missing_provenance'
  | 'third_party_data_risk'
  | 'low_context'
  | 'obvious_mismatch'

export interface ProvenancePayload {
  ownership_assertion?: string
  permissions_assertion?: string
  third_party_data?: boolean
  notes?: string
}

export interface EvidenceForPrecheck {
  id: string
  evidence_type: string
  content: string | null
  provenance?: ProvenancePayload | null
  integrity_flags?: string[] | null
}

export interface IntegrityResult {
  admissible: boolean
  flags: IntegrityFlag[]
  notes?: string
}

export function runIntegrityPrecheck(evidenceItems: EvidenceForPrecheck[]): IntegrityResult {
  const flags: IntegrityFlag[] = []

  if (!evidenceItems.length) {
    flags.push('low_context')
  }

  evidenceItems.forEach((e) => {
    const prov = (e.provenance ?? {}) as ProvenancePayload
    if (!prov.ownership_assertion) {
      flags.push('missing_provenance')
    }
    if (prov.third_party_data === true && !prov.permissions_assertion) {
      flags.push('third_party_data_risk')
    }
  })

  // TODO: simple mismatch rule in V1: if domain classifier sees "Technology"
  // but evidence intent mentions "tax" only → flag "obvious_mismatch".

  const admissible = flags.length === 0 || !flags.includes('third_party_data_risk')

  return {
    admissible,
    flags: Array.from(new Set(flags)),
  }
}
