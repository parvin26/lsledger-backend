import { NextRequest, NextResponse } from 'next/server'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { ListEntriesResponse, ErrorResponse, EntryStatus } from '@/types/api'

/**
 * GET /api/entries
 * Returns learning timeline entries for the current user (or guest via GUEST_USER_ID).
 * Each entry includes id, created_at, title, evidence_summary (truncated), status, and public_id when reviewed with link.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const userId = await getUserIdForRequest(authHeader)

    const { data: entries, error: entriesError } = await supabaseServer
      .from('entries')
      .select('id, created_at, title, confidence_band')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (entriesError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: entriesError.message } },
        { status: 500 }
      )
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json<ListEntriesResponse>({ entries: [] })
    }

    const entryIds = entries.map((e) => e.id)

    const [verificationsResult, questionsResult, evidenceResult] = await Promise.all([
      supabaseServer
        .from('verifications')
        .select('entry_id, public_id')
        .in('entry_id', entryIds),
      supabaseServer
        .from('assessment_questions')
        .select('entry_id')
        .in('entry_id', entryIds),
      supabaseServer
        .from('evidence')
        .select('entry_id, id, evidence_type, content, original_filename')
        .in('entry_id', entryIds)
    ])

    const verificationsByEntry = new Map<string, string>()
    if (verificationsResult.data) {
      for (const v of verificationsResult.data) {
        verificationsByEntry.set(v.entry_id, v.public_id)
      }
    }

    const entryIdsWithQuestions = new Set<string>()
    if (questionsResult.data) {
      for (const q of questionsResult.data) {
        entryIdsWithQuestions.add(q.entry_id)
      }
    }

    const evidenceByEntry = new Map<
      string,
      { content?: string; evidence_type?: string; original_filename?: string; evidence_id?: string }
    >()
    if (evidenceResult.data) {
      for (const e of evidenceResult.data) {
        if (!evidenceByEntry.has(e.entry_id)) {
          evidenceByEntry.set(e.entry_id, {
            content: e.content ?? undefined,
            evidence_type: e.evidence_type ?? undefined,
            original_filename: e.original_filename ?? undefined,
            evidence_id: e.id ?? undefined,
          })
        }
      }
    }

    const timeline: ListEntriesResponse['entries'] = entries.map((entry) => {
      const publicId = verificationsByEntry.get(entry.id)
      const hasQuestions = entryIdsWithQuestions.has(entry.id)
      let status: EntryStatus
      if (publicId) {
        status = 'Reviewed – link available'
      } else if (entry.confidence_band) {
        status = 'Reviewed'
      } else if (hasQuestions) {
        status = 'Under review'
      } else {
        status = 'Recorded only'
      }

      const ev = evidenceByEntry.get(entry.id)
      const rawEvidence =
        ev?.evidence_type === 'file' && ev?.original_filename
          ? `File: ${ev.original_filename}`
          : (ev?.content ?? entry.title ?? '')
      const evidence_summary = rawEvidence.length > 80 ? rawEvidence.slice(0, 80) + '…' : rawEvidence

      const fileEvidenceId =
        ev?.evidence_type === 'file' && ev?.evidence_id ? ev.evidence_id : undefined

      return {
        id: entry.id,
        created_at: entry.created_at,
        title: entry.title ?? 'Untitled',
        evidence_summary: evidence_summary || 'No evidence yet',
        status,
        ...(publicId && { public_id: publicId }),
        ...(fileEvidenceId && { file_evidence_id: fileEvidenceId }),
      }
    })

    return NextResponse.json<ListEntriesResponse>({ entries: timeline })
  } catch (error) {
    console.error('ENTRIES_API_ERROR', {
      error: error instanceof Error ? error.message : String(error),
    })
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
