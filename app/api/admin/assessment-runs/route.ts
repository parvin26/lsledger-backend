import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { ErrorResponse } from '@/types/api'

export interface AssessmentRunItem {
  runId: string
  startedAt: string
  completedAt: string | null
  questionBudget: number
  questionsAsked: number
  stopReason: 'sufficient_evidence' | 'max_questions' | 'integrity_hold' | null
  integrityFlags: string[]
  rubricId: string | null
  confidenceCategory: 'low' | 'medium' | 'high' | null
}

export interface AssessmentRunsResponse {
  entryId: string
  runs: AssessmentRunItem[]
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    await getUserIdForRequest(authHeader)

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')
    if (!entryId) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'entryId is required' } },
        { status: 400 }
      )
    }

    const { data: runs, error } = await supabaseServer
      .from('assessment_runs')
      .select('id, started_at, completed_at, question_budget, questions_asked, stop_reason, integrity_flags, rubric_id, confidence_category')
      .eq('entry_id', entryId)
      .order('started_at', { ascending: false })

    if (error) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    const items: AssessmentRunItem[] = (runs ?? []).map((r) => ({
      runId: r.id,
      startedAt: r.started_at,
      completedAt: r.completed_at ?? null,
      questionBudget: r.question_budget,
      questionsAsked: r.questions_asked,
      stopReason: r.stop_reason as AssessmentRunItem['stopReason'],
      integrityFlags: Array.isArray(r.integrity_flags) ? r.integrity_flags : [],
      rubricId: r.rubric_id ?? null,
      confidenceCategory: r.confidence_category as AssessmentRunItem['confidenceCategory'],
    }))

    return NextResponse.json<AssessmentRunsResponse>({
      entryId,
      runs: items,
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
