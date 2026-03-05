import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { getRubricForDomain } from '@/lib/rubric'
import { EvaluateAnswersRequest, AnswerEvaluation, ErrorResponse } from '@/types/api'

const evaluateAnswersSchema = z.object({
  entry_id: z.string().uuid(),
  answers: z.array(z.object({
    questionNumber: z.number().int().min(1).max(4),
    answer: z.string().min(1)
  })).length(4)
})

const RATER_ID = 'ai_v1b'

const LAYER_TO_CRITERION: Record<number, string> = {
  1: 'UNDERSTANDING',
  2: 'APPLICATION',
  3: 'REASONING',
  4: 'EVIDENCE',
}

function descriptorToScore(d: string): number {
  return d === 'Strong' ? 3 : d === 'Adequate' ? 2 : 1
}

async function verifyEntryOwnership(entryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()
  return !error && !!data && data.user_id === userId
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    await getUserIdForRequest(authHeader)

    const body = await request.json()
    const validated = evaluateAnswersSchema.parse(body) as EvaluateAnswersRequest

    const userId = await getUserIdForRequest(authHeader)
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    const { data: questionsData, error: questionsError } = await supabaseServer
      .from('assessment_questions')
      .select('question_number, question_text')
      .eq('entry_id', validated.entry_id)
      .order('question_number')

    if (questionsError || !questionsData || questionsData.length !== 4) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment questions not found' } },
        { status: 404 }
      )
    }

    const { data: entryData } = await supabaseServer
      .from('entries')
      .select('domain')
      .eq('id', validated.entry_id)
      .single()

    const { data: evidenceData } = await supabaseServer
      .from('evidence')
      .select('evidence_type, content')
      .eq('entry_id', validated.entry_id)

    const evidenceSummaryFull = evidenceData
      ?.map(e => `${e.evidence_type}: ${(e.content ?? '').substring(0, 300)}`)
      .join('\n') || 'No evidence'

    const rubric = await getRubricForDomain(entryData?.domain)
    const rubricJson = rubric ? JSON.stringify({ id: rubric.id, criteria: rubric.criteria }, null, 2) : '{}'

    const qaPairs = validated.answers.map((answer) => {
      const q = questionsData.find(qq => qq.question_number === answer.questionNumber)
      return `Question ${answer.questionNumber}: ${q?.question_text || 'Unknown'}\nAnswer: ${answer.answer}`
    }).join('\n\n')

    const userPrompt = `Original evidence:\n${evidenceSummaryFull}\n\nDomain: ${entryData?.domain || 'Unknown'}\n\nRubric:\n${rubricJson}\n\nQuestions and answers:\n${qaPairs}`

    const evaluation = await callAIWithStrictJSON<AnswerEvaluation>(
      'answerEvaluator.txt',
      userPrompt
    )

    const { data: runData } = await supabaseServer
      .from('assessment_runs')
      .select('id')
      .eq('entry_id', validated.entry_id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!runData) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment run not found' } },
        { status: 404 }
      )
    }

    const descriptors = [
      evaluation.layer1_descriptor,
      evaluation.layer2_descriptor,
      evaluation.layer3_descriptor,
      evaluation.layer4_descriptor,
    ]

    for (let i = 0; i < descriptors.length; i++) {
      await supabaseServer.from('scoring_records').insert({
        run_id: runData.id,
        criterion_code: LAYER_TO_CRITERION[i + 1] ?? 'UNDERSTANDING',
        rater_id: RATER_ID,
        score: descriptorToScore(descriptors[i] ?? 'Needs work'),
      })
    }

    return NextResponse.json({
      ok: true,
      rater_id: RATER_ID,
      run_id: runData.id,
      layer1_descriptor: evaluation.layer1_descriptor,
      layer2_descriptor: evaluation.layer2_descriptor,
      layer3_descriptor: evaluation.layer3_descriptor,
      layer4_descriptor: evaluation.layer4_descriptor,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } },
        { status: 400 }
      )
    }
    if (error instanceof GuestConfigError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'GUEST_CONFIG', message: 'Guest mode is not configured.' } },
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
