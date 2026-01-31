import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { GenerateQuestionsRequest, GenerateQuestionsResponse, ErrorResponse, QuestionGeneration } from '@/types/api'

const generateQuestionsSchema = z.object({
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
    const userId = await getUserIdForRequest(authHeader)

    const body = await request.json()
    const validated = generateQuestionsSchema.parse(body) as GenerateQuestionsRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    // Fetch entry and evidence with classification data
    const { data: entryData, error: entryError } = await supabaseServer
      .from('entries')
      .select('intent_prompt, domain, eligibility')
      .eq('id', validated.entry_id)
      .single()

    if (entryError || !entryData) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Entry not found' } },
        { status: 404 }
      )
    }

    // Check if entry has been analyzed
    if (!entryData.domain || entryData.eligibility === null) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'PRECONDITION_FAILED', message: 'Entry must be analyzed before generating questions' } },
        { status: 400 }
      )
    }

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

    // Build prompt with all required context
    const userPrompt = `Learning evidence:\n${evidenceSummary}\n\nPrimary domain: ${entryData.domain}\nIntent: ${entryData.intent_prompt || 'Not provided'}`

    // Call AI with strict JSON parsing
    const questions = await callAIWithStrictJSON<QuestionGeneration>(
      'questionGenerator.txt',
      userPrompt
    )

    // Validate we got all 4 questions
    if (!questions.q1 || !questions.q2 || !questions.q3 || !questions.q4) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'AI_VALIDATION_ERROR', message: 'AI did not return all 4 required questions' } },
        { status: 500 }
      )
    }

    // Store questions in database
    const { error: storeError } = await supabaseServer
      .from('assessment_questions')
      .upsert(
        [
          { entry_id: validated.entry_id, question_number: 1, question_text: questions.q1 },
          { entry_id: validated.entry_id, question_number: 2, question_text: questions.q2 },
          { entry_id: validated.entry_id, question_number: 3, question_text: questions.q3 },
          { entry_id: validated.entry_id, question_number: 4, question_text: questions.q4 }
        ],
        { onConflict: 'entry_id,question_number' }
      )

    if (storeError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: storeError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<GenerateQuestionsResponse>({
      q1: questions.q1,
      q2: questions.q2,
      q3: questions.q3,
      q4: questions.q4
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
