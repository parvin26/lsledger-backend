-- Lighthouse Ledger Phase 3: CAEL standards and NIST AI RMF hooks
-- Run in Supabase SQL Editor.

-- 3.1 CAEL: assessor and equity on verifications
ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS assessor_id uuid,
  ADD COLUMN IF NOT EXISTS assessor_role text,
  ADD COLUMN IF NOT EXISTS cael_standards text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equity_flags jsonb DEFAULT '[]';

-- assessor_role: 'domain_sme' | 'integrity_reviewer' | 'qa_reviewer'

-- 3.2 User equity profiles (optional, for equity monitoring)
CREATE TABLE IF NOT EXISTS user_equity_profiles (
  user_id uuid PRIMARY KEY,
  gender text,
  region text,
  first_language text,
  disability_status text
);

-- 3.3 NIST: bias metadata on assessment_questions
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS bias_status text,
  ADD COLUMN IF NOT EXISTS bias_issues jsonb DEFAULT '[]';

-- bias_status: 'pending' | 'passed' | 'flagged'

-- 3.4 Question bias events (telemetry)
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
