-- Lighthouse Ledger Phase 1: assessment_runs table
-- Run in Supabase SQL Editor. Creates dedicated run entity for each assessment session.
-- user_id stores the learner; no FK to auth.users to avoid schema coupling.

CREATE TABLE IF NOT EXISTS assessment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  question_budget integer NOT NULL,
  questions_asked integer NOT NULL DEFAULT 0,
  stop_reason text,  -- 'sufficient_evidence' | 'max_questions' | 'inconsistent_answers' | 'integrity_hold'

  integrity_flags jsonb DEFAULT '[]'::jsonb,
  integrity_notes text,

  domain text,
  rubric_id text,
  confidence_category text,  -- 'low' | 'medium' | 'high'
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_assessment_runs_entry_id ON assessment_runs(entry_id);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_user_id ON assessment_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_runs_started_at ON assessment_runs(started_at);
