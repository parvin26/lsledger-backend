# Phase A & B — Tone, Inclusiveness, Variable Budget, MCQ Support

## Phase A — Tone and Inclusiveness

### Changes

1. **Structured context passed to question generator** (`app/api/ai/questions/route.ts`):
   - `domain`, `intentCategory`, `intentPrompt`, `question_budget` are now passed in a documented block at the top of the user prompt.

2. **Updated `prompts/questionGenerator.txt`**:
   - **Default tone:** Use simple, everyday language; avoid academic jargon unless explicitly asked.
   - **Condition on intentCategory:**
     - `phd_application` / `academic_research`: May use more technical language; at least one question probes theory, methods, or research logic.
     - `self_learning`, `funding_application`, `employer_review`: Prefer story-based, practical questions; invite real situations and experience-based answers.
   - **Condition on domain:**
     - MSME / bookkeeping / retail: Ask about daily practice (cash, sales, expenses, stock, profit, habits); avoid abstract MBA frameworks.
     - Digital marketing: Ask about campaigns, budget, audience, and “what worked”.
     - Corporate / strategy / tech: Clear language; projects, decisions, trade-offs, improvements.
   - **Rule:** In all cases, experience-based answers using concrete examples are encouraged.
   - **Examples added:** 3 example contexts with matching 4-layer questions:
     1. MSME bookkeeping (African shop owner, self_learning)
     2. Digital marketing freelancer (employer_review)
     3. Mid-level manager learning coding from YouTube (self_learning)

---

## Phase B — Variable Question Budget + MCQ (Backend Only)

### Changes

1. **`computeQuestionBudget()`** — Already used when creating `assessment_runs`; now passed into the prompt so the AI knows how many total questions to generate.

2. **Extended `QuestionGenerationItem`** (`types/api.ts`):
   - `format`: `"open"` | `"mcq"`
   - `options`: string[] (required when format === `"mcq"`)
   - `correctOptionIndex`: number (required when format === `"mcq"`)
   - `layer`, `criterion_code`, etc. optional for MCQs

3. **`QuestionGeneration`** — Added `mcqs?: QuestionGenerationItem[]` for optional MCQ array.

4. **Prompt updates** — `questionGenerator.txt` instructs:
   - Always generate 4 open questions (layers 1–4).
   - When `question_budget > 4`, use the remaining budget for MCQs.
   - MCQs: `text`, `options` (3–4 choices), `correctOptionIndex` (0-based).
   - MCQs must be answerable from evidence; no trick questions.

5. **Persistence** — All questions (open + MCQ) are stored in `assessment_questions`:
   - Open questions: `question_number` 1–4, `format` = `'open'`.
   - MCQs: `question_number` 5, 6, 7, …; `format` = `'mcq'`; `options` (jsonb); `correct_option_index` (integer).

6. **Evaluate route** — Fetches only open questions (1–4) for evaluation; MCQs are stored but not evaluated yet.

7. **Frontend** — Unchanged: still returns `q1`–`q4` only; assessment UI shows the same 4 open questions.

---

## Migration

**File:** `docs/migrations/phase6_mcq_question_format.sql`

**Run in Supabase SQL Editor:**

```sql
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS format text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS options jsonb,
  ADD COLUMN IF NOT EXISTS correct_option_index integer;

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS selected_option_index integer,
  ADD COLUMN IF NOT EXISTS is_mcq_correct boolean;
```

---

## Example Payloads

### MSME bookkeeping (self_learning)

```json
{
  "q1": {
    "format": "open",
    "text": "In your own words, what does 'profit' mean for your shop? How would you know if you made a profit this month?",
    "layer": 1,
    "criterion_code": "UNDERSTANDING",
    "skill_tags": ["Financial_Literacy"],
    "evidence_anchors": [],
    "why_asked": { ... }
  },
  "q2": { ... },
  "q3": { ... },
  "q4": { ... },
  "mcqs": [
    {
      "format": "mcq",
      "text": "Which of the following best describes profit for this shop?",
      "options": ["Money left after paying expenses", "Total sales", "Stock value", "Cash in hand"],
      "correctOptionIndex": 0
    }
  ]
}
```

### PhD / academic (phd_application)

```json
{
  "q1": {
    "format": "open",
    "text": "What theoretical framework or methodology underpins your approach? How does it relate to existing literature?",
    "layer": 1,
    "criterion_code": "UNDERSTANDING",
    ...
  },
  ...
  "mcqs": [
    {
      "format": "mcq",
      "text": "Which research design best fits your study?",
      "options": ["Case study", "Survey", "Experiment", "Mixed methods"],
      "correctOptionIndex": 0
    }
  ]
}
```
