-- Lighthouse Ledger: Remaining Supabase setup
-- Run in Supabase SQL Editor. Idempotent (IF NOT EXISTS / DROP IF EXISTS + CREATE).
-- Run this if you get storage upload errors or "relation does not exist" for base tables.

-- =============================================================================
-- 1. Storage policies for evidence-files bucket
-- =============================================================================
-- Allow service role full access (app uses service role for upload/signed URLs)
DROP POLICY IF EXISTS "Service role full access evidence-files" ON storage.objects;
CREATE POLICY "Service role full access evidence-files" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'evidence-files')
WITH CHECK (bucket_id = 'evidence-files');

-- Allow authenticated users to upload (fallback if using anon key)
DROP POLICY IF EXISTS "Authenticated upload evidence-files" ON storage.objects;
CREATE POLICY "Authenticated upload evidence-files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence-files');

-- Allow authenticated users to read (for signed URLs - server creates them)
DROP POLICY IF EXISTS "Authenticated read evidence-files" ON storage.objects;
CREATE POLICY "Authenticated read evidence-files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'evidence-files');

-- =============================================================================
-- 2. Base tables (only if missing - e.g. fresh Supabase project)
-- =============================================================================
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  intent_prompt text,
  domain text,
  eligibility text,
  capability_summary text,
  confidence_band text
);

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  storage_path text,
  original_filename text,
  mime_type text,
  size bigint,
  transcript text,
  admissible boolean,
  integrity_flags jsonb DEFAULT '[]'::jsonb,
  provenance jsonb DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_evidence_entry_id ON evidence(entry_id);

CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  public_id text NOT NULL UNIQUE,
  domain text NOT NULL,
  capability_summary text NOT NULL,
  confidence_band text NOT NULL,
  intent_prompt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  evidence_summary text,
  layer1_descriptor text,
  layer2_descriptor text,
  layer3_descriptor text,
  layer4_descriptor text,
  rubric_id text,
  assessor_id uuid,
  assessor_role text,
  cael_standards text[] DEFAULT '{}',
  equity_flags jsonb DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_verifications_entry_id ON verifications(entry_id);
CREATE INDEX IF NOT EXISTS idx_verifications_public_id ON verifications(public_id);
