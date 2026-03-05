-- Lighthouse Ledger: Complete schema migration
-- Run this in Supabase SQL Editor if you see "table not found" or "column not found" errors.
-- Run in order; each block is idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

-- =============================================================================
-- 1. assessment_runs (Phase 1)
-- =============================================================================
CREATE TABLE IF NOT EXISTS assessment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  question_budget integer NOT NULL,
  questions_asked integer NOT NULL DEFAULT 0,
  stop_reason text,
  integrity_flags jsonb DEFAULT '[]'::jsonb,
  integrity_notes text,
  domain text,
  rubric_id text,
  confidence_category text,
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_entry_id ON assessment_runs(entry_id);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_user_id ON assessment_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_started_at ON assessment_runs(started_at);

-- =============================================================================
-- 2. rubrics and rubric_criteria (Phase 1)
-- =============================================================================
CREATE TABLE IF NOT EXISTS rubrics (
  id text PRIMARY KEY,
  name text NOT NULL,
  domain text NOT NULL,
  description text,
  version text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id text NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  level_descriptors jsonb NOT NULL,
  evidence_types text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}'
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_code ON rubric_criteria(rubric_id, code);
CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_id ON rubric_criteria(rubric_id);

-- =============================================================================
-- 3. Rubric seed (MBA-style generic)
-- =============================================================================
INSERT INTO rubrics (id, name, domain, description, version)
VALUES (
  'rubric_mba_generic_v1',
  'MBA-style Generic Rubric',
  'Generic',
  'Five-criterion analytic rubric for prior learning assessment. Maps to four assessment layers.',
  '1.0'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'UNDERSTANDING', 'Conceptual accuracy',
  'Demonstrates accurate understanding of core concepts, terminology, and relationships.',
  '{"excellent":"Clear, precise explanation with correct use of domain terms; identifies key relationships and nuances.","proficient":"Accurate explanation with minor gaps; generally correct terminology.","needs_improvement":"Vague or inaccurate explanation; confused terminology or missing key concepts."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'APPLICATION', 'Application in context',
  'Applies concepts appropriately to real or hypothetical scenarios.',
  '{"excellent":"Concrete, relevant application with specific examples; shows transfer to new context.","proficient":"Reasonable application with some specificity; transfer evident.","needs_improvement":"Generic or abstract application; little or no concrete transfer."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'REASONING', 'Logic and assumptions',
  'Identifies assumptions, trade-offs, and limitations; shows logical reasoning.',
  '{"excellent":"Explicitly addresses assumptions and trade-offs; shows critical thinking about limitations.","proficient":"Some awareness of trade-offs and assumptions; reasonable logic.","needs_improvement":"Little awareness of assumptions or limitations; weak or unclear reasoning."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'EVIDENCE', 'Use of evidence',
  'Uses specific evidence from the material to support claims.',
  '{"excellent":"Cites specific examples, quotes, or data points; evidence clearly supports claims.","proficient":"Some specific references; evidence generally supports claims.","needs_improvement":"Vague or unsupported claims; little reference to evidence."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

INSERT INTO rubric_criteria (rubric_id, code, name, description, level_descriptors, evidence_types)
SELECT 'rubric_mba_generic_v1', 'COMMUNICATION', 'Clarity and coherence',
  'Communicates clearly and coherently with appropriate structure.',
  '{"excellent":"Clear, well-structured response; easy to follow and precise.","proficient":"Generally clear; minor issues with structure or clarity.","needs_improvement":"Unclear or disorganised; difficult to follow."}'::jsonb,
  '{video,text,code,link}'::text[]
WHERE EXISTS (SELECT 1 FROM rubrics WHERE id = 'rubric_mba_generic_v1')
ON CONFLICT (rubric_id, code) DO NOTHING;

-- =============================================================================
-- 4. rubric_id on verifications and assessment_runs
-- =============================================================================
ALTER TABLE verifications ADD COLUMN IF NOT EXISTS rubric_id text;
ALTER TABLE assessment_runs ADD COLUMN IF NOT EXISTS rubric_id text;

-- =============================================================================
-- 5. verifications 4-layer columns
-- =============================================================================
ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS evidence_summary text,
  ADD COLUMN IF NOT EXISTS layer1_descriptor text,
  ADD COLUMN IF NOT EXISTS layer2_descriptor text,
  ADD COLUMN IF NOT EXISTS layer3_descriptor text,
  ADD COLUMN IF NOT EXISTS layer4_descriptor text;

-- =============================================================================
-- 6. assessment_questions (base table if missing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  layer text,
  PRIMARY KEY (entry_id, question_number)
);

-- =============================================================================
-- 7. assessment_questions Phase 2 columns
-- =============================================================================
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS layer_number integer,
  ADD COLUMN IF NOT EXISTS criterion_code text,
  ADD COLUMN IF NOT EXISTS skill_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence_anchors jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS why_asked jsonb DEFAULT '{}';

-- =============================================================================
-- 8. assessment_answers (base table if missing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS assessment_answers (
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  answer_text text NOT NULL,
  PRIMARY KEY (entry_id, question_number)
);

-- =============================================================================
-- 9. question_bias_events (Phase 3)
-- =============================================================================
CREATE TABLE IF NOT EXISTS question_bias_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL,
  question_number integer NOT NULL,
  model_version text,
  status text,
  issues jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_question_bias_events_entry ON question_bias_events(entry_id);

ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS bias_status text,
  ADD COLUMN IF NOT EXISTS bias_issues jsonb DEFAULT '[]';

ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS assessor_id uuid,
  ADD COLUMN IF NOT EXISTS assessor_role text,
  ADD COLUMN IF NOT EXISTS cael_standards text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equity_flags jsonb DEFAULT '[]';

-- =============================================================================
-- 10. scoring_records (Phase 5)
-- =============================================================================
CREATE TABLE IF NOT EXISTS scoring_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
  criterion_code text NOT NULL,
  rater_id text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scoring_records_run_id ON scoring_records(run_id);
CREATE INDEX IF NOT EXISTS idx_scoring_records_criterion ON scoring_records(run_id, criterion_code);

-- =============================================================================
-- 11. entries intent_category and intent_details (structured intent)
-- =============================================================================
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS intent_category text,
  ADD COLUMN IF NOT EXISTS intent_details text;

-- =============================================================================
-- 12. Phase 6: MCQ question format (assessment_questions, assessment_answers)
-- =============================================================================
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS format text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS options jsonb,
  ADD COLUMN IF NOT EXISTS correct_option_index integer;

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS selected_option_index integer,
  ADD COLUMN IF NOT EXISTS is_mcq_correct boolean;
