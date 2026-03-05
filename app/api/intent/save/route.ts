import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { SaveIntentRequest, SaveIntentResponse, ErrorResponse } from '@/types/api'
import type { IntentCategory } from '@/types/api'

const INTENT_CATEGORY_LABELS: Record<IntentCategory, string> = {
  phd_application: 'Apply for a programme or scholarship (e.g. PhD, fellowship).',
  employer_review: 'Show capability to an employer or client.',
  self_learning: 'Get feedback for my own learning.',
  funding_application: 'Support a funding or grant application.',
  course_progress: 'Progress inside an existing course or training.',
  other: 'Other (something else).',
}

const intentCategorySchema = z.enum([
  'phd_application',
  'employer_review',
  'self_learning',
  'funding_application',
  'course_progress',
  'other',
])

const saveIntentSchema = z.object({
  entry_id: z.string().uuid(),
  intent_category: intentCategorySchema,
  intent_details: z.string().optional().nullable(),
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
    const validated = saveIntentSchema.parse(body) as SaveIntentRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    // For backward compatibility: intent_prompt is used by evaluator prompts.
    // Populate from intent_details if provided, else use human-readable label.
    const intentPrompt =
      (validated.intent_details?.trim() && validated.intent_details.trim()) ||
      INTENT_CATEGORY_LABELS[validated.intent_category]

    const { error } = await supabaseServer
      .from('entries')
      .update({
        intent_category: validated.intent_category,
        intent_details: validated.intent_details?.trim() || null,
        intent_prompt: intentPrompt,
      })
      .eq('id', validated.entry_id)

    if (error) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<SaveIntentResponse>({
      success: true
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
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
