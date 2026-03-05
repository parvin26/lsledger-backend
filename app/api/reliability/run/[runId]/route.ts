import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { getReliabilityForRun } from '@/lib/reliability'
import { ErrorResponse } from '@/types/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    await getUserIdForRequest(authHeader)

    const { data: run } = await supabaseServer
      .from('assessment_runs')
      .select('id, entry_id, user_id')
      .eq('id', params.runId)
      .single()

    if (!run) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment run not found' } },
        { status: 404 }
      )
    }

    const results = await getReliabilityForRun(params.runId)

    return NextResponse.json({
      run_id: params.runId,
      entry_id: run.entry_id,
      criteria: results,
    })
  } catch (error) {
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
