# Phase 1 PR Summary — Integrity Stage and Explicit Rubrics

Implements Phase 1 of the [Lighthouse Ledger Assessment Engine Implementation Plan](README_Lighthouse_Assessment.md): integrity precheck, assessment runs, explicit rubrics, and rubric-aware evaluation.

---

## Code Changes

### New Files

| File | Purpose |
|------|---------|
| `docs/migrations/phase1_assessment_runs.sql` | Creates `assessment_runs` table |
| `docs/migrations/phase1_evidence_integrity.sql` | Adds `admissible`, `integrity_flags`, `provenance` to `evidence` |
| `docs/migrations/phase1_rubrics.sql` | Creates `rubrics` and `rubric_criteria` tables |
| `docs/migrations/phase1_rubric_seed.sql` | Seeds MBA-style generic rubric (5 criteria) |
| `docs/migrations/phase1_rubric_id_columns.sql` | Adds `rubric_id` to `verifications` and `assessment_runs` |
| `docs/migrations/phase1_evidence_provenance_backfill.sql` | Backfills provenance for existing evidence |
| `lib/integrityPrecheck.ts` | Integrity precheck service (flags: missing_provenance, third_party_data_risk, low_context) |
| `lib/rubric.ts` | Rubric service: `getRubricForDomain()` |
| `lib/questionBudget.ts` | Question budget utility (Phase 4 stub; hard cap 15 for V1) |

### Modified Files

| File | Changes |
|------|---------|
| `types/api.ts` | Added `ProvenancePayload`; extended `EvidenceItem` with `admissible`, `integrity_flags`, `provenance` |
| `app/api/ai/questions/route.ts` | Runs integrity precheck before questions; creates `assessment_runs`; returns `INTEGRITY_HOLD` (400) if not admissible |
| `app/api/ai/evaluate/route.ts` | Fetches rubric; passes rubric to evaluator prompt; stores `rubric_id` on verification; updates `assessment_runs` on completion |
| `app/api/evidence/add/route.ts` | Sets `provenance: { ownership_assertion: 'user_submitted' }` on insert |
| `app/api/evidence/upload/route.ts` | Same provenance default |
| `prompts/answerEvaluator.txt` | Rubric-aware: layer→criteria mapping, level descriptors |
| `docs/MIGRATIONS.md` | Phase 1 migration steps |
| `docs/SCHEMA_NOTE.md` | New tables and columns |

---

## Behaviour Changes

1. **Integrity precheck** — Before generating questions, the system runs `runIntegrityPrecheck()` on evidence. If `admissible === false` (e.g. `third_party_data_risk`), it returns 400 with `INTEGRITY_HOLD` and does not generate questions.
2. **Assessment runs** — Each question-generation request creates an `assessment_runs` row. On evaluation completion, the run is updated with `completed_at`, `rubric_id`, `confidence_category`, `questions_asked`, `stop_reason`.
3. **Rubric-aware evaluation** — The evaluator prompt receives the rubric JSON and maps layers to criteria (UNDERSTANDING, APPLICATION, REASONING, EVIDENCE, COMMUNICATION).
4. **Provenance** — New evidence gets `ownership_assertion: 'user_submitted'` by default. Existing evidence is backfilled via migration.

---

## Migration Order

Run in Supabase SQL Editor:

1. `phase1_assessment_runs.sql`
2. `phase1_evidence_integrity.sql`
3. `phase1_rubrics.sql`
4. `phase1_rubric_seed.sql`
5. `phase1_rubric_id_columns.sql`
6. `phase1_evidence_provenance_backfill.sql`

---

## Spec Reference

- Phase 1 — Integrity Stage and Explicit Rubrics (Assessment Engine Implementation Plan)
- `docs/README_Lighthouse_Assessment.md` — Architecture summary and gaps
