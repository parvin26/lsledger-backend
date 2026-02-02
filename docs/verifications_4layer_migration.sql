-- Lighthouse Ledger: add 4-layer and evidence summary to verifications
-- Run this in the Supabase SQL editor if your verifications table was created before these columns existed.

ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS evidence_summary text,
  ADD COLUMN IF NOT EXISTS layer1_descriptor text,
  ADD COLUMN IF NOT EXISTS layer2_descriptor text,
  ADD COLUMN IF NOT EXISTS layer3_descriptor text,
  ADD COLUMN IF NOT EXISTS layer4_descriptor text;

-- layer*_descriptor values: 'Strong' | 'Adequate' | 'Needs work'
-- evidence_summary: short (e.g. first 200 chars) description of what was reviewed
