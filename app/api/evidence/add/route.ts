import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuthToken } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { AddEvidenceRequest, AddEvidenceResponse, ErrorResponse } from '@/types/api'

const addEvidenceSchema = z.object({
  entry_id: z.string().uuid(),
  evidence_type: z.enum(['link', 'file', 'text']),
  content: z.string().min(1)
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
    const validated = addEvidenceSchema.parse(body) as AddEvidenceRequest

    // Verify ownership
    const ownsEntry = await verifyEntryOwnership(validated.entry_id, userId)
    if (!ownsEntry) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'FORBIDDEN', message: 'Entry not found or access denied' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabaseServer
      .from('evidence')
      .insert({
        entry_id: validated.entry_id,
        evidence_type: validated.evidence_type,
        content: validated.content
      })
      .select('id, created_at')
      .single()

    if (error) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<AddEvidenceResponse>({
      evidence_id: data.id,
      created_at: data.created_at
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
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
