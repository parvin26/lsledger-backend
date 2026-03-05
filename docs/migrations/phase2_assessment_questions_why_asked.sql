-- Lighthouse Ledger Phase 2: per-question explainability (WhyAsked payload)
-- Run in Supabase SQL Editor. Extends assessment_questions with layer, criterion, anchors, why_asked.

ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS layer_number integer,
  ADD COLUMN IF NOT EXISTS criterion_code text,
  ADD COLUMN IF NOT EXISTS skill_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence_anchors jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS why_asked jsonb DEFAULT '{}';

-- layer_number: 1–4 (Explanation, Application, Trade-offs, Reflection)
-- criterion_code: e.g. 'UNDERSTANDING', 'APPLICATION'
-- evidence_anchors: e.g. ["transcript:100-140"]
-- why_asked: WhyAskedPayload (rubric, evidenceTrigger, purpose, decisionUse, scoringBasis, governanceHooks)
