-- Lighthouse Ledger Phase 6: MCQ question format and answer support
-- Run in Supabase SQL Editor. Adds format/options for MCQs; answer columns for MCQ responses.

-- assessment_questions: support MCQ format
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS format text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS options jsonb,
  ADD COLUMN IF NOT EXISTS correct_option_index integer;

-- assessment_answers: support MCQ response (selected_option_index, is_mcq_correct)
ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS selected_option_index integer,
  ADD COLUMN IF NOT EXISTS is_mcq_correct boolean;
