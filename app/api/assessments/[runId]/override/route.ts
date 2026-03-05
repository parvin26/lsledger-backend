import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { ErrorResponse } from '@/types/api'

const overrideSchema = z.object({
  finalCapabilitySummary: z.string().min(1),
  finalConfidenceBand: z.enum(['Low', 'Medium', 'High']),
  overrideReason: z.string().optional(),
  caelStandards: z.array(z.string()).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const assessorId = await getUserIdForRequest(authHeader)

    const body = await request.json()
    const validated = overrideSchema.parse(body)

    const { data: run, error: runError } = await supabaseServer
      .from('assessment_runs')
      .select('id, entry_id')
      .eq('id', params.runId)
      .single()

    if (runError || !run) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment run not found' } },
        { status: 404 }
      )
    }

    const { data: verification, error: verError } = await supabaseServer
      .from('verifications')
      .select('id')
      .eq('entry_id', run.entry_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (verError || !verification) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'No verification record found for this run' } },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabaseServer
      .from('verifications')
      .update({
        capability_summary: validated.finalCapabilitySummary,
        confidence_band: validated.finalConfidenceBand,
        assessor_id: assessorId,
        assessor_role: 'domain_sme',
        cael_standards: validated.caelStandards ?? ['Standard 3', 'Standard 4', 'Standard 9'],
      })
      .eq('id', verification.id)

    if (updateError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    await supabaseServer
      .from('entries')
      .update({
        capability_summary: validated.finalCapabilitySummary,
        confidence_band: validated.finalConfidenceBand,
      })
      .eq('id', run.entry_id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      )
    }
    if (error instanceof GuestConfigError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'GUEST_CONFIG', message: 'Guest mode is not configured. Set GUEST_USER_ID in .env.local.' } },
        { status: 503 }
      )
    }
    if (error instanceof Error && error.message.includes('Authorization')) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      )
    }
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
