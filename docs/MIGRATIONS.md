# Lighthouse Ledger — Database migrations

Run these in the **Supabase SQL Editor** for the project used by your deployment (e.g. lhledger.com).

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Paste the SQL from the migration file below (or from the referenced file in the repo).
4. Click **Run**.

---

## 1. Verifications 4-layer columns (required for 4-layer assessment and verification record)

**File:** `docs/verifications_4layer_migration.sql`

**When to run:** If your `verifications` table was created before the 4-layer feature, or if you see errors when creating a verification record (e.g. column "evidence_summary" or "layer1_descriptor" does not exist).

**Steps:**

1. In Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the following (or the contents of `docs/verifications_4layer_migration.sql`):

```sql
-- Lighthouse Ledger: add 4-layer and evidence summary to verifications
ALTER TABLE verifications
  ADD COLUMN IF NOT EXISTS evidence_summary text,
  ADD COLUMN IF NOT EXISTS layer1_descriptor text,
  ADD COLUMN IF NOT EXISTS layer2_descriptor text,
  ADD COLUMN IF NOT EXISTS layer3_descriptor text,
  ADD COLUMN IF NOT EXISTS layer4_descriptor text;
```

3. Click **Run**.
4. Confirm the table `verifications` now has columns: `evidence_summary`, `layer1_descriptor`, `layer2_descriptor`, `layer3_descriptor`, `layer4_descriptor` (Table Editor or run `SELECT column_name FROM information_schema.columns WHERE table_name = 'verifications';`).

**Verifying the migration:** In Supabase → Table Editor → `verifications`, check that the columns above exist. New verification records created after running the migration will populate these fields.

---

## 2. Evidence table — file metadata and transcript (file upload + YouTube transcript)

**File:** `docs/evidence_file_transcript_migration.sql`

**When to run:** Before using file evidence or YouTube transcript ingestion.

**Steps:**

1. In Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the contents of `docs/evidence_file_transcript_migration.sql` (adds `storage_path`, `original_filename`, `mime_type`, `size`, `transcript` to `evidence`).
3. Click **Run**.
4. Create the Storage bucket: Supabase Dashboard → **Storage** → **New bucket** → name: `evidence-files`, **Private** (not public). This bucket stores uploaded evidence files; access is via signed URLs for the entry owner only.

**Verifying:** Table Editor → `evidence` should have the new columns. Public verification pages do not expose raw evidence files; they show only the evidence summary text (e.g. "File: report.pdf").

---

## 3. YouTube transcript (env vars only)

Transcript ingestion uses the built-in **POST /api/youtube-transcript** route. No database migration is required. For environment variables (optional), see **docs/TRANSCRIPTS.md**.

---

## 4. Phase 1 — Integrity stage and explicit rubrics (Assessment Engine)

**When to run:** Before using the Phase 1 assessment engine (integrity precheck, rubrics, assessment_runs).

**Order:** Run migrations in this sequence:

1. **phase1_assessment_runs.sql** — Creates `assessment_runs` table.
2. **phase1_evidence_integrity.sql** — Adds `admissible`, `integrity_flags`, `provenance` to `evidence`.
3. **phase1_rubrics.sql** — Creates `rubrics` and `rubric_criteria` tables.
4. **phase1_rubric_seed.sql** — Seeds MBA-style generic rubric (`rubric_mba_generic_v1`).
5. **phase1_rubric_id_columns.sql** — Adds `rubric_id` to `verifications` and `assessment_runs`.
6. **phase1_evidence_provenance_backfill.sql** — Backfills provenance for existing evidence.

**Files:** All in `docs/migrations/`.

**Verifying:** Table Editor → `assessment_runs`, `rubrics`, `rubric_criteria` exist; `evidence` has `provenance`, `integrity_flags`, `admissible`; `verifications` has `rubric_id`.

---

## 5. Phase 2 — Per-question explainability (WhyAsked payload)

**When to run:** Before using Phase 2 question generation (structured output with why_asked).

**File:** `docs/migrations/phase2_assessment_questions_why_asked.sql`

**Adds to `assessment_questions`:** `layer_number` (integer 1–4), `criterion_code`, `skill_tags`, `evidence_anchors`, `why_asked` (jsonb).

**Verifying:** Table Editor → `assessment_questions` has the new columns.

---

## 6. Phase 3 — CAEL standards and NIST AI RMF hooks

**File:** `docs/migrations/phase3_cael_nist.sql`

**Adds:** verifications: `assessor_id`, `assessor_role`, `cael_standards`, `equity_flags`; user_equity_profiles table; assessment_questions: `bias_status`, `bias_issues`; question_bias_events table.

---

## 7. Phase 5 — Scoring records (reliability / Cohen's kappa)

**File:** `docs/migrations/phase5_scoring_records.sql`

**Creates:** `scoring_records` table (run_id, criterion_code, rater_id, score).

---

## 8. Intent category and details (structured intent)

**File:** `docs/migrations/intent_category_migration.sql`

**When to run:** Before using the structured intent UX on the Add Evidence page (replaces free-text-only intent with MCQ + optional details).

**Adds to `entries`:** `intent_category` (text), `intent_details` (text). Keeps `intent_prompt` for backward compatibility with evaluator prompts.

**Verifying:** Table Editor → `entries` has columns `intent_category` and `intent_details`. New entries will populate these; existing entries remain NULL until edited.

---

## 9. Phase 6 — MCQ question format (variable question budget)

**File:** `docs/migrations/phase6_mcq_question_format.sql`

**When to run:** Before using variable question budget and MCQ generation (Phase A/B).

**Adds to `assessment_questions`:** `format` (text, default 'open'), `options` (jsonb), `correct_option_index` (integer).

**Adds to `assessment_answers`:** `selected_option_index` (integer), `is_mcq_correct` (boolean).

**Verifying:** Table Editor → `assessment_questions` has `format`, `options`, `correct_option_index`; `assessment_answers` has `selected_option_index`, `is_mcq_correct`.
