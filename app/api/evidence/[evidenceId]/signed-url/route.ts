import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { SignedUrlResponse, ErrorResponse } from '@/types/api'

const BUCKET = 'evidence-files'
const EXPIRES_IN = 60 // seconds

export async function GET(
  request: NextRequest,
  { params }: { params: { evidenceId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await getUserIdForRequest(authHeader)
    const evidenceId = params.evidenceId

    const { data: row, error: fetchError } = await supabaseServer
      .from('evidence')
      .select('entry_id, storage_path, evidence_type')
      .eq('id', evidenceId)
      .single()

    if (fetchError || !row || row.evidence_type !== 'file' || !row.storage_path) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Evidence not found or not a file' } },
        { status: 404 }
      )
    }

    const { data: entry } = await supabaseServer
      .from('entries')
      .select('user_id')
      .eq('id', row.entry_id)
      .single()

    if (!entry || entry.user_id !== userId) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    const { data: signed, error: signError } = await supabaseServer.storage
      .from(BUCKET)
      .createSignedUrl(row.storage_path, EXPIRES_IN)

    if (signError || !signed?.signedUrl) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'STORAGE_ERROR', message: signError?.message ?? 'Failed to create signed URL' } },
        { status: 500 }
      )
    }

    return NextResponse.json<SignedUrlResponse>({
      url: signed.signedUrl,
      expires_at: new Date(Date.now() + EXPIRES_IN * 1000).toISOString(),
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
