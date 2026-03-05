import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { ErrorResponse } from '@/types/api'
import { DEMO_AMINA_ENTRY_ID, DEMO_AMINA_VERIFY_ID, type DemoAminaResponse, type DemoAminaCriterionScore } from '@/lib/demoAmina'

const SCORE_TO_DESCRIPTOR: Record<number, string> = {
  3: 'Strong',
  2: 'Adequate',
  1: 'Needs work',
}

/**
 * GET /api/demo/amina
 * Public endpoint — returns full demo data for the Amina product video.
 * No auth required.
 */
export async function GET() {
  try {
    const entryId = DEMO_AMINA_ENTRY_ID

    const [entryRes, evidenceRes, questionsRes, answersRes, verificationRes, scoringRes, rubricCriteriaRes] =
      await Promise.all([
        supabaseServer
          .from('entries')
          .select('id, title, domain, intent_prompt, capability_summary, confidence_band')
          .eq('id', entryId)
          .single(),
        supabaseServer
          .from('evidence')
          .select('id, evidence_type, content, transcript, created_at')
          .eq('entry_id', entryId)
          .order('created_at', { ascending: true }),
        supabaseServer
          .from('assessment_questions')
          .select('question_number, question_text, layer_number, criterion_code, skill_tags, evidence_anchors, why_asked')
          .eq('entry_id', entryId)
          .order('question_number', { ascending: true }),
        supabaseServer
          .from('assessment_answers')
          .select('question_number, answer_text')
          .eq('entry_id', entryId)
          .order('question_number', { ascending: true }),
        supabaseServer
          .from('verifications')
          .select('public_id, capability_summary, confidence_band, evidence_summary, layer1_descriptor, layer2_descriptor, layer3_descriptor, layer4_descriptor, rubric_id')
          .eq('public_id', DEMO_AMINA_VERIFY_ID)
          .single(),
        supabaseServer
          .from('scoring_records')
          .select('criterion_code, score')
          .eq('run_id', 'aaaaaaaa-0000-4000-8000-000000000002')
          .eq('rater_id', 'ai_v1'),
        supabaseServer
          .from('rubric_criteria')
          .select('code, name')
          .eq('rubric_id', 'rubric_msme_retail_demo_v1'),
      ])

    if (entryRes.error || !entryRes.data) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Demo data not found. Run the demo seed migration first.' } },
        { status: 404 }
      )
    }

    const entry = entryRes.data
    const evidence = (evidenceRes.data ?? []).map((e) => ({
      id: e.id,
      evidence_type: e.evidence_type as 'link' | 'file' | 'text',
      content: e.content ?? null,
      transcript: e.transcript ?? null,
      created_at: e.created_at,
    }))

    const questions = (questionsRes.data ?? []).map((q) => ({
      question_number: q.question_number,
      question_text: q.question_text,
      layer_number: q.layer_number ?? null,
      criterion_code: q.criterion_code ?? null,
      skill_tags: Array.isArray(q.skill_tags) ? q.skill_tags : [],
      evidence_anchors: Array.isArray(q.evidence_anchors) ? q.evidence_anchors : [],
      why_asked: (q.why_asked as Record<string, unknown>) ?? {},
    }))

    const answers = (answersRes.data ?? []).map((a) => ({
      question_number: a.question_number,
      answer_text: a.answer_text,
    }))

    const verification = verificationRes.data
    if (!verification) {
      return NextResponse.json<ErrorResponse>(
        { error: { code: 'NOT_FOUND', message: 'Demo verification not found. Run the demo seed migration first.' } },
        { status: 404 }
      )
    }

    const criteriaByName = new Map((rubricCriteriaRes.data ?? []).map((c) => [c.code, c.name]))
    const scoresByCode = new Map((scoringRes.data ?? []).map((s) => [s.criterion_code, s.score]))

    const rubric_breakdown: DemoAminaCriterionScore[] = criteriaByName.size
      ? Array.from(criteriaByName.entries()).map(([code, name]) => ({
          criterion_code: code,
          criterion_name: name,
          score: scoresByCode.get(code) ?? 2,
          descriptor: SCORE_TO_DESCRIPTOR[scoresByCode.get(code) ?? 2] ?? 'Adequate',
        }))
      : [
          { criterion_code: 'Understanding', criterion_name: 'Understanding', score: 2, descriptor: 'Adequate' },
          { criterion_code: 'Application', criterion_name: 'Application', score: 3, descriptor: 'Strong' },
          { criterion_code: 'Reasoning', criterion_name: 'Reasoning', score: 2, descriptor: 'Adequate' },
          { criterion_code: 'EvidenceUse', criterion_name: 'Evidence use', score: 3, descriptor: 'Strong' },
          { criterion_code: 'Communication', criterion_name: 'Communication', score: 1, descriptor: 'Needs work' },
        ]

    const response: DemoAminaResponse = {
      entry: {
        id: entry.id,
        title: entry.title ?? 'Amina – Grocery Shop Operations',
        domain: entry.domain ?? 'MSME_Retail',
        intent_prompt: entry.intent_prompt ?? null,
        capability_summary: entry.capability_summary ?? null,
        confidence_band: entry.confidence_band ?? null,
      },
      evidence,
      questions,
      answers,
      verification: {
        public_id: verification.public_id,
        capability_summary: verification.capability_summary ?? '',
        confidence_band: verification.confidence_band ?? 'Medium',
        evidence_summary: verification.evidence_summary ?? null,
        layer1_descriptor: verification.layer1_descriptor ?? null,
        layer2_descriptor: verification.layer2_descriptor ?? null,
        layer3_descriptor: verification.layer3_descriptor ?? null,
        layer4_descriptor: verification.layer4_descriptor ?? null,
        rubric_id: verification.rubric_id ?? null,
      },
      rubric_breakdown,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('DEMO_AMINA_API_ERROR', error)
    return NextResponse.json<ErrorResponse>(
      { error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unknown error' } },
      { status: 500 }
    )
  }
}
