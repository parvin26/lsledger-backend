import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { VerificationRecord, ErrorResponse } from '@/types/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { public_id: string } }
) {
  try {
    const { public_id } = params

    const { data, error } = await supabaseServer
      .from('verifications')
      .select('public_id, domain, capability_summary, confidence_band, created_at, intent_prompt, evidence_summary, layer1_descriptor, layer2_descriptor, layer3_descriptor, layer4_descriptor')
      .eq('public_id', public_id)
      .single()

    if (error || !data) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Verification record not found' } },
        { status: 404 }
      )
    }

    // Return only safe public fields (no evidence content, no entry_id)
    return NextResponse.json<VerificationRecord>({
      public_id: data.public_id,
      domain: data.domain,
      capabilitySummary: data.capability_summary,
      confidenceBand: data.confidence_band,
      created_at: data.created_at,
      intent_prompt: data.intent_prompt ?? undefined,
      evidence_summary: data.evidence_summary ?? undefined,
      layer1_descriptor: data.layer1_descriptor ?? undefined,
      layer2_descriptor: data.layer2_descriptor ?? undefined,
      layer3_descriptor: data.layer3_descriptor ?? undefined,
      layer4_descriptor: data.layer4_descriptor ?? undefined
    })
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
