import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserIdForRequest, GuestConfigError } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { callAIWithStrictJSON } from '@/lib/ai'
import { getRubricForDomain } from '@/lib/rubric'
import { runIntegrityPrecheck } from '@/lib/integrityPrecheck'
import { computeQuestionBudget } from '@/lib/questionBudget'
import { checkQuestionBias } from '@/lib/biasMonitor'
import { GenerateQuestionsRequest, GenerateQuestionsResponse, ErrorResponse, QuestionGeneration, QuestionGenerationItem, McqQuestionItem } from '@/types/api'

const generateQuestionsSchema = z.object({
  entry_id: z.string().uuid()
})

function normalizeQuestions(raw: QuestionGeneration): {
  q1: QuestionGenerationItem
  q2: QuestionGenerationItem
  q3: QuestionGenerationItem
  q4: QuestionGenerationItem
  mcqs: QuestionGenerationItem[]
} {
  const toOpenItem = (q: unknown, layer: number): QuestionGenerationItem => {
    if (typeof q === 'string') {
      return {
        format: 'open',
        text: q,
        layer,
        criterion_code: layerToCriterion(layer),
        skill_tags: [],
        evidence_anchors: [],
        why_asked: { rubric: { rubricId: 'rubric_mba_generic_v1' }, evidenceTrigger: { anchors: [], conceptsDetected: [], missingSignal: [] }, purpose: { type: 'application_check' }, decisionUse: { type: 'screening' }, scoringBasis: { featuresExpected: [], commonFailureModes: [] } },
      }
    }
    const o = q as Record<string, unknown>
    return {
      format: (o.format as 'open' | 'mcq') ?? 'open',
      text: (o.text as string) ?? '',
      options: Array.isArray(o.options) ? (o.options as string[]) : undefined,
      correctOptionIndex: typeof o.correctOptionIndex === 'number' ? o.correctOptionIndex : undefined,
      layer: (o.layer as number) ?? layer,
      criterion_code: (o.criterion_code as string) ?? layerToCriterion(layer),
      skill_tags: Array.isArray(o.skill_tags) ? (o.skill_tags as string[]) : [],
      evidence_anchors: Array.isArray(o.evidence_anchors) ? (o.evidence_anchors as string[]) : [],
      why_asked: (o.why_asked as Record<string, unknown>) ?? {},
    }
  }
  const toMcqItem = (q: unknown): QuestionGenerationItem | null => {
    const o = q as Record<string, unknown>
    const text = (o.text as string)?.trim()
    const options = Array.isArray(o.options) ? (o.options as string[]) : []
    const correctOptionIndex = typeof o.correctOptionIndex === 'number' ? o.correctOptionIndex : undefined
    if (!text || options.length < 2 || correctOptionIndex == null || correctOptionIndex < 0 || correctOptionIndex >= options.length) return null
    return {
      format: 'mcq',
      text,
      options,
      correctOptionIndex,
      layer: undefined,
      criterion_code: (o.criterion_code as string) ?? 'UNDERSTANDING',
      skill_tags: Array.isArray(o.skill_tags) ? (o.skill_tags as string[]) : [],
      evidence_anchors: Array.isArray(o.evidence_anchors) ? (o.evidence_anchors as string[]) : [],
      why_asked: (o.why_asked as Record<string, unknown>) ?? {},
    }
  }
  const mcqsRaw = Array.isArray(raw.mcqs) ? raw.mcqs : []
  const mcqs = mcqsRaw.map(toMcqItem).filter((q): q is QuestionGenerationItem => q != null)
  return {
    q1: toOpenItem(raw.q1, 1),
    q2: toOpenItem(raw.q2, 2),
    q3: toOpenItem(raw.q3, 3),
    q4: toOpenItem(raw.q4, 4),
    mcqs,
  }
}

function layerToCriterion(layer: number): string {
  const map: Record<number, string> = { 1: 'UNDERSTANDING', 2: 'APPLICATION', 3: 'REASONING', 4: 'EVIDENCE' }
  return map[layer] ?? 'UNDERSTANDING'
}

function buildQuestionRow(
  entryId: string,
  questionNumber: number,
  q: QuestionGenerationItem,
  rubricId: string,
  bias: { status: string; issues: string[] }
): Record<string, unknown> {
  const baseWhyAsked = typeof q.why_asked === 'object' && q.why_asked !== null ? (q.why_asked as Record<string, unknown>) : {}
  const govHooks = (baseWhyAsked.governanceHooks as Record<string, unknown>) ?? {}
  const rubricObj = (baseWhyAsked.rubric as Record<string, unknown>) ?? {}
  const whyAsked = {
    ...baseWhyAsked,
    rubric: { ...rubricObj, rubricId },
    governanceHooks: { ...govHooks, nistFunctions: ['MEASURE', 'MANAGE'] },
  }
  const format = q.format ?? 'open'
  return {
    entry_id: entryId,
    question_number: questionNumber,
    question_text: q.text,
    format,
    options: format === 'mcq' && Array.isArray(q.options) ? q.options : null,
    correct_option_index: format === 'mcq' && typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : null,
    layer_number: q.layer ?? null,
    criterion_code: q.criterion_code ?? null,
    skill_tags: q.skill_tags ?? [],
    evidence_anchors: q.evidence_anchors ?? [],
    why_asked: whyAsked,
    bias_status: bias.status,
    bias_issues: bias.issues,
  }
}

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
      .select('intent_prompt, intent_category, domain, eligibility')
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
      .select('id, evidence_type, content, transcript, provenance, integrity_flags')
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

    // Phase 1: Integrity precheck
    const evidenceForPrecheck = evidenceData.map((e) => ({
      id: e.id,
      evidence_type: e.evidence_type,
      content: e.content,
      provenance: e.provenance as Record<string, unknown> | null,
      integrity_flags: e.integrity_flags as string[] | null,
    }))
    const integrityResult = runIntegrityPrecheck(evidenceForPrecheck)

    const questionBudget = computeQuestionBudget(evidenceForPrecheck)

    const { data: runData, error: runInsertError } = await supabaseServer
      .from('assessment_runs')
      .insert({
        entry_id: validated.entry_id,
        user_id: userId,
        question_budget: questionBudget,
        questions_asked: 0,
        domain: entryData.domain,
        integrity_flags: integrityResult.flags,
        integrity_notes: integrityResult.notes,
        ...(integrityResult.admissible ? {} : { stop_reason: 'integrity_hold', completed_at: new Date().toISOString() }),
      })
      .select('id')
      .single()

    if (runInsertError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: runInsertError.message } },
        { status: 500 }
      )
    }

    for (const e of evidenceData) {
      await supabaseServer
        .from('evidence')
        .update({ integrity_flags: integrityResult.flags, admissible: integrityResult.admissible })
        .eq('id', e.id)
    }

    if (!integrityResult.admissible) {
      return NextResponse.json(
        {
          status: 'INTEGRITY_HOLD',
          integrityFlags: integrityResult.flags,
          notes: integrityResult.notes,
        },
        { status: 400 }
      )
    }

    // evidence_text: transcript if available (e.g. YouTube), else text content, else short description
    const evidenceTextParts: string[] = []
    for (const e of evidenceData) {
      const transcript = (e as { transcript?: string | null }).transcript
      if (transcript && transcript.trim()) {
        evidenceTextParts.push(transcript)
      } else if (e.evidence_type === 'text' && e.content) {
        evidenceTextParts.push(e.content.substring(0, 5000))
      } else if (e.evidence_type === 'link' && e.content) {
        evidenceTextParts.push(`Link: ${e.content}`)
      } else if (e.evidence_type === 'file' && e.content) {
        evidenceTextParts.push(`File: ${e.content}`)
      }
    }
    const evidenceText = evidenceTextParts.join('\n\n').trim() || 'No transcript or text provided.'
    const evidenceSummary = evidenceData
      .map(e => `${e.evidence_type}: ${(e.content ?? '').substring(0, 500)}`)
      .join('\n\n')

    const rubric = await getRubricForDomain(entryData.domain)
    const rubricJson = rubric ? JSON.stringify({ id: rubric.id, criteria: rubric.criteria }, null, 2) : '{}'

    const context = {
      domain: entryData.domain ?? 'Generic',
      intentCategory: entryData.intent_category ?? 'unspecified',
      intentPrompt: entryData.intent_prompt ?? null,
      questionBudget: questionBudget,
    }
    const userPrompt = `CONTEXT (use for tone and inclusiveness):
- domain: ${context.domain}
- intentCategory: ${context.intentCategory}
- intentPrompt: ${context.intentPrompt ?? 'Not provided'}
- question_budget: ${context.questionBudget} (generate 4 open questions; if > 4, add ${context.questionBudget - 4} mcq questions)

Learning evidence summary:
${evidenceSummary}

Transcript or excerpt from the learner's evidence (read carefully for grounded questions):
${evidenceText}

Rubric (use for criterion_code and why_asked):
${rubricJson}`

    const rawQuestions = await callAIWithStrictJSON<QuestionGeneration>(
      'questionGenerator.txt',
      userPrompt
    )

    const questions = normalizeQuestions(rawQuestions)

    if (!questions.q1?.text || !questions.q2?.text || !questions.q3?.text || !questions.q4?.text) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'AI_VALIDATION_ERROR', message: 'AI did not return all 4 required questions' } },
        { status: 500 }
      )
    }

    const rubricId = rubric?.id ?? 'rubric_mba_generic_v1'
    const modelVersion = process.env.AI_MODEL_NAME ?? 'gpt-4'

    const rows: Record<string, unknown>[] = [
      buildQuestionRow(validated.entry_id, 1, questions.q1, rubricId, checkQuestionBias(questions.q1.text)),
      buildQuestionRow(validated.entry_id, 2, questions.q2, rubricId, checkQuestionBias(questions.q2.text)),
      buildQuestionRow(validated.entry_id, 3, questions.q3, rubricId, checkQuestionBias(questions.q3.text)),
      buildQuestionRow(validated.entry_id, 4, questions.q4, rubricId, checkQuestionBias(questions.q4.text)),
    ]
    let questionNumber = 5
    for (const mcq of questions.mcqs) {
      rows.push(buildQuestionRow(validated.entry_id, questionNumber, mcq, rubricId, checkQuestionBias(mcq.text)))
      questionNumber++
    }

    const { error: storeError } = await supabaseServer
      .from('assessment_questions')
      .upsert(rows, { onConflict: 'entry_id,question_number' })

    if (storeError) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'DATABASE_ERROR', message: storeError.message } },
        { status: 500 }
      )
    }

    for (let i = 0; i < Math.min(rows.length, 4); i++) {
      const r = rows[i] as Record<string, unknown>
      await supabaseServer.from('question_bias_events').insert({
        entry_id: validated.entry_id,
        question_number: i + 1,
        model_version: modelVersion,
        status: r.bias_status ?? 'passed',
        issues: r.bias_issues ?? [],
      })
    }

    const mcqs: McqQuestionItem[] = questions.mcqs.map((m, i) => ({
      questionNumber: 5 + i,
      text: m.text,
      options: m.options ?? [],
    }))

    return NextResponse.json<GenerateQuestionsResponse>({
      q1: questions.q1.text,
      q2: questions.q2.text,
      q3: questions.q3.text,
      q4: questions.q4.text,
      ...(mcqs.length > 0 ? { mcqs } : {}),
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
