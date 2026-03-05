-- Lighthouse Ledger Phase 1: explicit rubrics
-- Run in Supabase SQL Editor. Creates rubric and rubric_criteria tables.

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
