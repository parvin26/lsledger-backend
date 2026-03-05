# Lighthouse Ledger — Schema note

This document describes the Supabase tables used by the app. Run migrations in your Supabase SQL editor to match. The repo does not contain a full `schema.sql`; this note is the source of truth for what the API expects.

## Tables (inferred from API usage)

### entries
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users or guest user id)
- `title` (text)
- `description` (text, nullable)
- `created_at` (timestamptz)
- `intent_prompt` (text, nullable) — set by intent/save
- `domain` (text, nullable) — set by ai/analyze
- `eligibility` (text, nullable) — set by ai/analyze
- `capability_summary` (text, nullable) — set by ai/evaluate
- `confidence_band` (text, nullable) — 'Low' | 'Medium' | 'High', set by ai/evaluate

### evidence
- `id` (uuid, PK)
- `entry_id` (uuid, FK to entries)
- `evidence_type` (text) — 'link' | 'file' | 'text'
- `content` (text) — URL for link, text for text, display name (e.g. filename) for file
- `created_at` (timestamptz)
- `storage_path` (text, nullable) — for file type: path in Supabase Storage bucket `evidence-files`
- `original_filename` (text, nullable)
- `mime_type` (text, nullable)
- `size` (bigint, nullable)
- `transcript` (text, nullable) — for YouTube links: ingested transcript; used by question generator

For file evidence, content stores the display name; raw file is in Storage. Run `docs/evidence_file_transcript_migration.sql` if these columns are missing. Create Storage bucket `evidence-files` (private) in Supabase Dashboard → Storage if not present.

Phase 1 (integrity): `admissible` (boolean, nullable), `integrity_flags` (jsonb, default `[]`), `provenance` (jsonb, default `{}`). Run `docs/migrations/phase1_evidence_integrity.sql`.

### assessment_questions
- `entry_id` (uuid, FK)
- `question_number` (int, 1–4)
- `question_text` (text)
- `layer` (text, nullable) — optional: 'Explanation' | 'Application' | 'Trade-offs/limits' | 'Reflection/next steps'
- Unique on (entry_id, question_number)

Phase 2 (WhyAsked): `layer_number` (integer 1–4), `criterion_code` (text), `skill_tags` (text[]), `evidence_anchors` (jsonb), `why_asked` (jsonb). Run `docs/migrations/phase2_assessment_questions_why_asked.sql`.

### assessment_answers
- `entry_id` (uuid, FK)
- `question_number` (int, 1–4)
- `answer_text` (text)
- Unique on (entry_id, question_number)

### verifications
- `id` (uuid, PK)
- `entry_id` (uuid, FK to entries)
- `public_id` (text, unique)
- `domain` (text)
- `capability_summary` (text)
- `confidence_band` (text)
- `intent_prompt` (text, nullable)
- `created_at` (timestamptz)
- `evidence_summary` (text, nullable) — short description of what was reviewed (e.g. first 200 chars)
- `layer1_descriptor`, `layer2_descriptor`, `layer3_descriptor`, `layer4_descriptor` (text, nullable) — 'Strong' | 'Adequate' | 'Needs work'

If your `verifications` table was created before these columns existed, run the migration in the Supabase SQL editor. See **docs/MIGRATIONS.md** for step-by-step instructions (Supabase Dashboard → SQL Editor → paste and run the SQL from `docs/verifications_4layer_migration.sql`).

Phase 1: `rubric_id` (text, nullable). Run `docs/migrations/phase1_rubric_id_columns.sql`.

### assessment_runs (Phase 1)

- `id` (uuid, PK)
- `entry_id` (uuid, FK to entries)
- `user_id` (uuid)
- `started_at`, `completed_at` (timestamptz)
- `question_budget`, `questions_asked` (integer)
- `stop_reason` (text): 'sufficient_evidence' | 'max_questions' | 'integrity_hold' | etc.
- `integrity_flags` (jsonb), `integrity_notes` (text)
- `domain`, `rubric_id`, `confidence_category` (text)
- `metadata` (jsonb)

Run `docs/migrations/phase1_assessment_runs.sql`.

### rubrics (Phase 1)

- `id` (text, PK), `name`, `domain`, `description`, `version`, `created_at`

### rubric_criteria (Phase 1)

- `id` (uuid, PK), `rubric_id` (FK to rubrics), `code`, `name`, `description`
- `level_descriptors` (jsonb), `evidence_types` (text[]), `exclusions` (text[])

Run `docs/migrations/phase1_rubrics.sql` and `phase1_rubric_seed.sql`.

### Phase 3 (CAEL / NIST)

- **verifications:** `assessor_id`, `assessor_role`, `cael_standards`, `equity_flags`
- **user_equity_profiles:** user_id, gender, region, first_language, disability_status
- **assessment_questions:** `bias_status`, `bias_issues`
- **question_bias_events:** entry_id, question_number, model_version, status, issues

Run `docs/migrations/phase3_cael_nist.sql`.

### scoring_records (Phase 5)

- run_id, criterion_code, rater_id, score (3=Strong, 2=Adequate, 1=Needs work)

Run `docs/migrations/phase5_scoring_records.sql`.

## Learning timeline (GET /api/entries)

Uses `entries` (filtered by `user_id`), `verifications` (for `public_id` per entry), `assessment_questions` (to detect “Under review”), and `evidence` (for truncated summary). Guest users are identified by `GUEST_USER_ID`; their entries share the same `user_id` in `entries`.

## Public verification pages

Raw evidence files are **not** included in public verification records. The `/verify/[public_id]` page and API return only the evidence summary text (e.g. "File: report.pdf") and capability review details. File download is available only to the entry owner via signed URLs.
