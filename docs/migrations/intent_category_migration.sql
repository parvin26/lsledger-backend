-- Lighthouse Ledger: add structured intent columns to entries
-- Run when adding intent category + optional details (replaces free-text-only intent).
-- Keeps intent_prompt for backward compatibility with existing evaluator prompts.

ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS intent_category text,
  ADD COLUMN IF NOT EXISTS intent_details text;
