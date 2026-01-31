import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuthToken } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { AnalyzeEvidenceRequest, AnalyzeEvidenceResponse, ErrorResponse, DomainClassification } from '@/types/api'

const analyzeEvidenceSchema = z.object({
  entry_id: z.string().uuid()
})

async function verifyEntryOwnership(entryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()

  if (error || !data) {
    return false
  }

  return data.user_id === userId
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await validateAuthToken(authHeader)

    const body = await request.json()
    const validated = analyzeEvidenceSchema.parse(body) as AnalyzeEvidenceRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    // Fetch evidence for this entry
    const { data: evidenceData, error: evidenceError } = await supabaseServer
      .from('evidence')
      .select('evidence_type, content')
      .eq('entry_id', validated.entry_id)

    if (evidenceError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: evidenceError.message } },
        { status: 500 }
      )
    }

    if (!evidenceData || evidenceData.length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'No evidence found for this entry' } },
        { status: 404 }
      )
    }

    // Build evidence summary for AI
    const evidenceSummary = evidenceData
      .map(e => `${e.evidence_type}: ${e.content.substring(0, 500)}`)
      .join('\n\n')

    const userPrompt = `Evidence to analyze:\n\n${evidenceSummary}`

    // Call AI with strict JSON parsing
    const classification = await callAIWithStrictJSON<DomainClassification>(
      'domainClassifier.txt',
      userPrompt
    )

    // Update entry with classification
    const { error: updateError } = await supabaseServer
      .from('entries')
      .update({
        domain: classification.primary_domain,
        eligibility: classification.eligible ? 'eligible' : 'ineligible'
      })
      .eq('id', validated.entry_id)

    if (updateError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<AnalyzeEvidenceResponse>({
      primary_domain: classification.primary_domain,
      secondary_domain: classification.secondary_domain,
      complexity_level: classification.complexity_level,
      eligible: classification.eligible,
      eligibility_reason: classification.eligibility_reason,
      key_topics: classification.key_topics,
      evaluator_lens: classification.evaluator_lens
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.message.includes('Authorization')) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      )
    }
    if (error instanceof Error && error.message.includes('invalid JSON')) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'AI_PARSING_ERROR', message: error.message } },
        { status: 500 }
      )
    }
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
