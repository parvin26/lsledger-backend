import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuthToken } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { CreateEntryRequest, CreateEntryResponse, ErrorResponse } from '@/types/api'

const createEntrySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await validateAuthToken(authHeader)

    const body = await request.json()
    const validated = createEntrySchema.parse(body) as CreateEntryRequest

    const { data, error } = await supabaseServer
      .from('entries')
      .insert({
        user_id: userId,
        title: validated.title,
        description: validated.description || null
      })
      .select('id, created_at')
      .single()

    if (error) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<CreateEntryResponse>({
      entry_id: data.id,
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
