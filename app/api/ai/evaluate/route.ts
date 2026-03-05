import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { getRubricForDomain } from '@/lib/rubric'
import { sha256 } from '@/lib/hash'
import { EvaluateAnswersRequest, EvaluateAnswersResponse, ErrorResponse, AnswerEvaluation } from '@/types/api'

const answerItemSchema = z.object({
  questionNumber: z.number().int().min(1).max(20),
  answer: z.string().optional(),
  selectedOptionIndex: z.number().int().min(0).optional(),
}).refine(
  (a) => (a.questionNumber <= 4 ? (typeof a.answer === 'string' && a.answer.trim().length > 0) : typeof a.selectedOptionIndex === 'number'),
  { message: 'Open questions (1-4) need answer; MCQs (5+) need selectedOptionIndex' }
)
const evaluateAnswersSchema = z.object({
  entry_id: z.string().uuid(),
  answers: z.array(answerItemSchema).min(4),
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
    const userId = await getUserIdForRequest(authHeader)

    const body = await request.json()
    const validated = evaluateAnswersSchema.parse(body) as EvaluateAnswersRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    // Fetch open questions (1-4) for evaluation; MCQs are stored but not evaluated yet
    const { data: questionsData, error: questionsError } = await supabaseServer
      .from('assessment_questions')
      .select('question_number, question_text')
      .eq('entry_id', validated.entry_id)
      .order('question_number')

    if (questionsError || !questionsData) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment questions not found' } },
        { status: 404 }
      )
    }
    const openQuestions = questionsData.filter((q) => q.question_number >= 1 && q.question_number <= 4)
    if (openQuestions.length !== 4) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Assessment questions not found' } },
        { status: 404 }
      )
    }

    // Fetch MCQ questions to compute is_mcq_correct
    const { data: allQuestionsData } = await supabaseServer
      .from('assessment_questions')
      .select('question_number, format, correct_option_index')
      .eq('entry_id', validated.entry_id)

    const mcqQuestions = new Map(
      (allQuestionsData ?? [])
        .filter((q) => (q as { format?: string }).format === 'mcq')
        .map((q) => [q.question_number, q])
    )

    // Store answers in database for auditability
    const answerRows = validated.answers.map((answer) => {
      const isMcq = answer.questionNumber >= 5 && typeof answer.selectedOptionIndex === 'number'
      const mcqQ = mcqQuestions.get(answer.questionNumber) as { correct_option_index?: number } | undefined
      const isMcqCorrect = isMcq && mcqQ && typeof mcqQ.correct_option_index === 'number'
        ? answer.selectedOptionIndex === mcqQ.correct_option_index
        : null
      return {
        entry_id: validated.entry_id,
        question_number: answer.questionNumber,
        answer_text: isMcq ? String(answer.selectedOptionIndex) : (answer.answer ?? ''),
        ...(isMcq ? { selected_option_index: answer.selectedOptionIndex, is_mcq_correct: isMcqCorrect } : {}),
      }
    })

    const { error: answersError } = await supabaseServer
      .from('assessment_answers')
      .upsert(answerRows, { onConflict: 'entry_id,question_number' })

    if (answersError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: answersError.message } },
        { status: 500 }
      )
    }

    // Fetch entry data for context
    const { data: entryData, error: entryDataError } = await supabaseServer
      .from('entries')
      .select('domain')
      .eq('id', validated.entry_id)
      .single()

    if (entryDataError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: entryDataError.message } },
        { status: 500 }
      )
    }

    // Fetch evidence for context
    const { data: evidenceData } = await supabaseServer
      .from('evidence')
      .select('evidence_type, content')
      .eq('entry_id', validated.entry_id)

    const evidenceSummaryFull = evidenceData
      ?.map(e => `${e.evidence_type}: ${(e.content ?? '').substring(0, 300)}`)
      .join('\n') || 'No evidence'
    const evidenceSummaryShort = (evidenceData?.[0]?.content ?? '').substring(0, 200).trim() || 'No evidence'

    const rubric = await getRubricForDomain(entryData.domain)
    const rubricJson = rubric ? JSON.stringify({ id: rubric.id, criteria: rubric.criteria }, null, 2) : '{}'

    const openAnswers = validated.answers.filter((a) => a.questionNumber >= 1 && a.questionNumber <= 4 && typeof a.answer === 'string')
    const qaPairs = openAnswers.map((answer) => {
      const question = openQuestions.find(q => q.question_number === answer.questionNumber)
      return `Question ${answer.questionNumber}: ${question?.question_text || 'Unknown'}\nAnswer: ${answer.answer}`
    }).join('\n\n')

    const userPrompt = `Original evidence:\n${evidenceSummaryFull}\n\nDomain: ${entryData.domain || 'Unknown'}\n\nRubric (use for scoring):\n${rubricJson}\n\nQuestions and answers:\n${qaPairs}`

    const evaluation = await callAIWithStrictJSON<AnswerEvaluation>(
      'answerEvaluator.txt',
      userPrompt
    )

    // Update entry with evaluation
    const { error: updateError } = await supabaseServer
      .from('entries')
      .update({
        capability_summary: evaluation.capability_summary,
        confidence_band: evaluation.confidence_band
      })
      .eq('id', validated.entry_id)

    if (updateError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    // If confidence is Medium or High, create verification record
    let verificationId: string | undefined
    let publicId: string | undefined

    if (evaluation.confidence_band === 'Medium' || evaluation.confidence_band === 'High') {
      // Generate public_id (hash of entry_id + timestamp)
      const timestamp = new Date().toISOString()
      publicId = sha256(`${validated.entry_id}-${timestamp}`).substring(0, 16)

      // Fetch entry data for verification record
      const { data: entryForVerification } = await supabaseServer
        .from('entries')
        .select('domain, intent_prompt')
        .eq('id', validated.entry_id)
        .single()

      const rubricId = rubric?.id ?? null

      const { data: verificationData, error: verificationError } = await supabaseServer
        .from('verifications')
        .insert({
          entry_id: validated.entry_id,
          public_id: publicId,
          domain: entryForVerification?.domain || 'Unknown',
          capability_summary: evaluation.capability_summary,
          confidence_band: evaluation.confidence_band,
          intent_prompt: entryForVerification?.intent_prompt || null,
          evidence_summary: evidenceSummaryShort,
          layer1_descriptor: evaluation.layer1_descriptor,
          layer2_descriptor: evaluation.layer2_descriptor,
          layer3_descriptor: evaluation.layer3_descriptor,
          layer4_descriptor: evaluation.layer4_descriptor,
          rubric_id: rubricId
        })
        .select('id')
        .single()

      if (verificationError) {
        return NextResponse.json<ErrorResponse>(
          { error: { code: 'DATABASE_ERROR', message: verificationError.message } },
          { status: 500 }
        )
      }

      verificationId = verificationData.id
    }

    const rubricId = rubric?.id ?? null
    const confidenceCategory = evaluation.confidence_band.toLowerCase() as 'low' | 'medium' | 'high'

    const { data: runData } = await supabaseServer
      .from('assessment_runs')
      .select('id')
      .eq('entry_id', validated.entry_id)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const LAYER_TO_CRITERION: Record<number, string> = {
      1: 'UNDERSTANDING',
      2: 'APPLICATION',
      3: 'REASONING',
      4: 'EVIDENCE',
    }
    const descriptorToScore = (d: string) => (d === 'Strong' ? 3 : d === 'Adequate' ? 2 : 1)
    const descriptors = [
      evaluation.layer1_descriptor,
      evaluation.layer2_descriptor,
      evaluation.layer3_descriptor,
      evaluation.layer4_descriptor,
    ]

    if (runData) {
      await supabaseServer
        .from('assessment_runs')
        .update({
          completed_at: new Date().toISOString(),
          questions_asked: 4,
          rubric_id: rubricId,
          confidence_category: confidenceCategory,
          stop_reason: 'sufficient_evidence'
        })
        .eq('id', runData.id)

      for (let i = 0; i < descriptors.length; i++) {
        await supabaseServer.from('scoring_records').insert({
          run_id: runData.id,
          criterion_code: LAYER_TO_CRITERION[i + 1] ?? 'UNDERSTANDING',
          rater_id: 'ai_v1',
          score: descriptorToScore(descriptors[i] ?? 'Needs work'),
        })
      }
    }

    return NextResponse.json<EvaluateAnswersResponse>({
      capability_summary: evaluation.capability_summary,
      confidence_band: evaluation.confidence_band,
      rationale: evaluation.rationale,
      verification_id: verificationId,
      public_id: publicId,
      layer1_descriptor: evaluation.layer1_descriptor,
      layer2_descriptor: evaluation.layer2_descriptor,
      layer3_descriptor: evaluation.layer3_descriptor,
      layer4_descriptor: evaluation.layer4_descriptor
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
