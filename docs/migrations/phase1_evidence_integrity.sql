-- Lighthouse Ledger Phase 1: integrity flags on evidence
-- Run in Supabase SQL Editor. Adds admissibility and provenance per concept note.

ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS admissible boolean,
  ADD COLUMN IF NOT EXISTS integrity_flags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS provenance jsonb DEFAULT '{}'::jsonb;

-- provenance shape: { ownership_assertion, permissions_assertion, third_party_data, notes }
