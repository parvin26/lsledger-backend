-- Lighthouse Ledger Phase 1: add rubric_id to verifications and assessment_runs
-- Run after phase1_assessment_runs.sql and phase1_rubrics.sql.

ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS rubric_id text;

ALTER TABLE assessment_runs
  ADD COLUMN IF NOT EXISTS rubric_id text;
