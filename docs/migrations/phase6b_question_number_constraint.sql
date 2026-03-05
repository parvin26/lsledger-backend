-- Lighthouse Ledger Phase 6b: Allow question_number 5+ for MCQ questions
-- Run in Supabase SQL Editor. The original constraint limited question_number to 1-4.
-- Phase 6 adds MCQs with question_number 5, 6, 7, etc. This migration updates the check.

-- Drop the old constraint if it exists (allows only 1-4)
ALTER TABLE assessment_questions
  DROP CONSTRAINT IF EXISTS assessment_questions_question_number_check;

-- Add new constraint: question_number 1-20 (4 open + up to 16 MCQs)
-- Safe to run once; if "already exists" on ADD, the constraint was already updated.
ALTER TABLE assessment_questions
  ADD CONSTRAINT assessment_questions_question_number_check
  CHECK (question_number >= 1 AND question_number <= 20);
