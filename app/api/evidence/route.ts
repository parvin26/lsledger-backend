import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { GetEvidenceResponse, ErrorResponse } from '@/types/api'

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
      .from('evidence')
      .select('id, evidence_type, content, storage_path, original_filename, mime_type, size, transcript, created_at')
      .eq('entry_id', entryId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    const evidence = (data ?? []).map((e) => ({
      id: e.id,
      evidence_type: e.evidence_type,
      content: e.content ?? null,
      storage_path: e.storage_path ?? null,
      original_filename: e.original_filename ?? null,
      mime_type: e.mime_type ?? null,
      size: e.size ?? null,
      transcript: e.transcript ?? null,
      created_at: e.created_at,
    }))

    return NextResponse.json<GetEvidenceResponse>({ evidence })
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
