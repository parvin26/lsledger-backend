-- Lighthouse Ledger Phase 5: scoring records for double-rating and Cohen's kappa
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS scoring_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
  criterion_code text NOT NULL,
  rater_id text NOT NULL,
  score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- rater_id: 'ai_v1' | 'ai_v1b' | user uuid (human assessor)
-- score: 3=Strong/excellent, 2=Adequate/proficient, 1=Needs work/needs_improvement

CREATE INDEX IF NOT EXISTS idx_scoring_records_run_id ON scoring_records(run_id);
CREATE INDEX IF NOT EXISTS idx_scoring_records_criterion ON scoring_records(run_id, criterion_code);
