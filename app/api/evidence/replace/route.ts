import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { AddEvidenceResponse, ErrorResponse } from '@/types/api'

const BUCKET = 'evidence-files'
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

async function verifyEntryOwnership(entryId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()
  if (error || !data) return false
  return data.user_id === userId
}

function getExt(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i >= 0 ? filename.slice(i) : ''
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await getUserIdForRequest(authHeader)

    const formData = await request.formData()
    const entryId = formData.get('entry_id') as string | null
    const file = formData.get('file') as File | null

    if (!entryId || typeof entryId !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'entry_id is required' } },
        { status: 400 }
      )
    }
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'file is required' } },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'File too large (max 25 MB)' } },
        { status: 400 }
      )
    }
    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'VALIDATION_ERROR', message: 'File type not allowed' } },
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

    const { data: existing } = await supabaseServer
      .from('evidence')
      .select('id, storage_path')
      .eq('entry_id', entryId)
      .eq('evidence_type', 'file')
      .limit(1)
      .single()

    if (!existing) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'No file evidence found for this entry' } },
        { status: 404 }
      )
    }

    const ext = getExt(file.name)
    const path = `${userId}/${entryId}/${crypto.randomUUID()}${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'STORAGE_ERROR', message: uploadError.message } },
        { status: 500 }
      )
    }

    const { data: row, error: updateError } = await supabaseServer
      .from('evidence')
      .update({
        content: file.name,
        storage_path: path,
        original_filename: file.name,
        mime_type: mimeType,
        size: file.size,
      })
      .eq('id', existing.id)
      .select('id, created_at')
      .single()

    if (updateError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: updateError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<AddEvidenceResponse>({
      evidence_id: row.id,
      created_at: row.created_at,
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
