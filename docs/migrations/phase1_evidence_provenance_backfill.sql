-- Lighthouse Ledger Phase 1: backfill provenance for existing evidence
-- Run after phase1_evidence_integrity.sql. Sets default ownership for evidence without provenance.

UPDATE evidence
SET provenance = '{"ownership_assertion": "user_submitted"}'::jsonb
WHERE provenance IS NULL OR provenance = '{}'::jsonb;
