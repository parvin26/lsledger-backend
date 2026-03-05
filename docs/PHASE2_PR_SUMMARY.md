# Phase 2 PR Summary — Per-Question Explainability (WhyAsked Payload)

Implements Phase 2 of the Lighthouse Ledger Assessment Engine Implementation Plan: per-question explainability with WhyAskedPayload for audit trail and governance.

---

## Code Changes

### New Files

| File | Purpose |
|------|---------|
| `docs/migrations/phase2_assessment_questions_why_asked.sql` | Adds `layer_number`, `criterion_code`, `skill_tags`, `evidence_anchors`, `why_asked` to `assessment_questions` |
| `types/assessment.ts` | `WhyAskedPayload` and `QuestionWithWhyAsked` types |
| `docs/PHASE2_PR_SUMMARY.md` | This summary |

### Modified Files

| File | Changes |
|------|---------|
| `prompts/questionGenerator.txt` | Structured output: each question has `text`, `layer`, `criterion_code`, `skill_tags`, `evidence_anchors`, `why_asked` |
| `app/api/ai/questions/route.ts` | Fetches rubric; passes rubric to prompt; parses structured output; stores all fields; normalizes legacy string format |
| `types/api.ts` | `QuestionGenerationItem`, `QuestionGeneration` (structured) |
| `docs/MIGRATIONS.md` | Phase 2 migration steps |
| `docs/SCHEMA_NOTE.md` | assessment_questions Phase 2 columns |

---

## Behaviour Changes

1. **Structured question output** — AI returns objects with `text`, `layer`, `criterion_code`, `skill_tags`, `evidence_anchors`, `why_asked` per question.
2. **WhyAskedPayload** — Each question stores: `rubric`, `evidenceTrigger` (anchors, conceptsDetected, missingSignal), `purpose`, `decisionUse`, `scoringBasis`, optional `governanceHooks`.
3. **Backward compatibility** — If AI returns legacy format (q1: string), `normalizeQuestions()` wraps it with defaults.
4. **Client API unchanged** — Response still returns `q1`, `q2`, `q3`, `q4` as strings (question text only).

---

## Migration

Run in Supabase SQL Editor: `docs/migrations/phase2_assessment_questions_why_asked.sql`

---

## Spec Reference

- Phase 2 — Per-Question Explainability and "WhyAsked" Payload
- `docs/README_Lighthouse_Assessment.md`
