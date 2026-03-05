import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { GetEntryIntentResponse, ErrorResponse } from '@/types/api'
import type { IntentCategory } from '@/types/api'

async function verifyEntryOwnership(entryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()
  if (error || !data) return false
  return data.user_id === userId
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await getUserIdForRequest(authHeader)

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entry_id')
    if (!entryId) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'entry_id is required' } },
        { status: 400 }
      )
    }

    const ownsEntry = await verifyEntryOwnership(entryId, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabaseServer
      .from('entries')
      .select('intent_category, intent_details, intent_prompt')
      .eq('id', entryId)
      .single()

    if (error || !data) {
      return NextResponse.json<GetEntryIntentResponse>({
        intent_category: null,
        intent_details: null,
        intent_prompt: null,
      })
    }

    return NextResponse.json<GetEntryIntentResponse>({
      intent_category: (data.intent_category as IntentCategory) ?? null,
      intent_details: data.intent_details ?? null,
      intent_prompt: data.intent_prompt ?? null,
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
