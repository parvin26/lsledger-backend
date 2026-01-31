import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuthToken } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { sha256 } from '@/lib/hash'
import { EvaluateAnswersRequest, EvaluateAnswersResponse, ErrorResponse, AnswerEvaluation } from '@/types/api'

const evaluateAnswersSchema = z.object({
  entry_id: z.string().uuid(),
  answers: z.array(z.object({
    questionNumber: z.number().int().min(1).max(4),
    answer: z.string().min(1)
  })).length(4)
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
    const validated = evaluateAnswersSchema.parse(body) as EvaluateAnswersRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    // Fetch questions
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

    // Store answers in database for auditability
    const { error: answersError } = await supabaseServer
      .from('assessment_answers')
      .upsert(
        validated.answers.map(answer => ({
          entry_id: validated.entry_id,
          question_number: answer.questionNumber,
          answer_text: answer.answer
        })),
        { onConflict: 'entry_id,question_number' }
      )

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

    const evidenceSummary = evidenceData
      ?.map(e => `${e.evidence_type}: ${e.content.substring(0, 300)}`)
      .join('\n') || 'No evidence'

    // Build evaluation prompt with all required context
    const qaPairs = validated.answers.map((answer) => {
      const question = questionsData.find(q => q.question_number === answer.questionNumber)
      return `Question ${answer.questionNumber}: ${question?.question_text || 'Unknown'}\nAnswer: ${answer.answer}`
    }).join('\n\n')

    const userPrompt = `Original evidence:\n${evidenceSummary}\n\nDomain: ${entryData.domain || 'Unknown'}\n\nQuestions and answers:\n${qaPairs}`

    // Call AI with strict JSON parsing
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

      const { data: verificationData, error: verificationError } = await supabaseServer
        .from('verifications')
        .insert({
          entry_id: validated.entry_id,
          public_id: publicId,
          domain: entryForVerification?.domain || 'Unknown',
          capability_summary: evaluation.capability_summary,
          confidence_band: evaluation.confidence_band,
          intent_prompt: entryForVerification?.intent_prompt || null
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

    return NextResponse.json<EvaluateAnswersResponse>({
      capability_summary: evaluation.capability_summary,
      confidence_band: evaluation.confidence_band,
      rationale: evaluation.rationale,
      verification_id: verificationId,
      public_id: publicId
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
