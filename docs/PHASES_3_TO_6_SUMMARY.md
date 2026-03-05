# Phases 3–6 Implementation Summary

## Phase 3 — CAEL Standards and NIST AI RMF Hooks

### New Files
- `docs/migrations/phase3_cael_nist.sql` — verifications (assessor_id, assessor_role, cael_standards, equity_flags), user_equity_profiles, assessment_questions (bias_status, bias_issues), question_bias_events
- `lib/biasMonitor.ts` — `checkQuestionBias()` for banned terms
- `app/api/assessments/[runId]/override/route.ts` — POST assessor override

### Modified
- `app/api/ai/questions/route.ts` — bias check per question, question_bias_events logging, NIST hooks in why_asked

### API
- **POST /api/assessments/[runId]/override** — Body: `{ finalCapabilitySummary, finalConfidenceBand, overrideReason?, caelStandards? }`. Updates verification and entry.

---

## Phase 4 — Question Budget and Stop Rules

### Modified
- `lib/questionBudget.ts` — `shouldStop(run, allCriteriaSatisfied, hasMajorContradictions)` helper

### Behaviour
- V1: fixed 4 questions; `question_budget` stored (cap 15); `stop_reason` set on completion.
- `shouldStop` ready for future adaptive flow.

---

## Phase 5 — Reliability: Double Rating and Cohen's Kappa

### New Files
- `docs/migrations/phase5_scoring_records.sql` — scoring_records table
- `lib/reliability.ts` — `computeCohensKappa()`, `getReliabilityForRun()`
- `app/api/reliability/run/[runId]/route.ts` — GET reliability metrics
- `app/api/ai/evaluate-secondary/route.ts` — POST second AI rater (ai_v1b)

### Modified
- `app/api/ai/evaluate/route.ts` — writes scoring_records (rater_id: ai_v1) for each layer

### API
- **GET /api/reliability/run/[runId]** — Returns `{ run_id, entry_id, criteria: [{ criterion_code, kappa, percentAgreement, meetsThreshold, raterA, raterB }] }`
- **POST /api/ai/evaluate-secondary** — Same body as evaluate; writes scoring_records with rater_id ai_v1b. Use for pilot double-rating.

### Kappa
- Target: κ ≥ 0.8 per criterion for pilots.
- Score mapping: Strong=3, Adequate=2, Needs work=1.

---

## Phase 6 — Minimal Adaptive/Re-Ask (Optional V1.5)

- **Deferred.** `assessment_runs.metadata` (jsonb) can store `{ re_ask_step: 1|2|3 }` when implemented.
- Full re-ask flow (client + server) left for future iteration.

---

## Migration Order

1. phase1_* (already run)
2. phase2_*
3. phase3_cael_nist.sql
4. phase5_scoring_records.sql
