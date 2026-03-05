# Lighthouse Ledger — Full Implementation Report

**Date:** Post Phases 1–6  
**Scope:** Assessment Engine Implementation Plan (all phases)

---

## 1. What Was Done

### Phase 1 — Integrity Stage and Explicit Rubrics

| Deliverable | Status | Notes |
|-------------|--------|------|
| `assessment_runs` table | ✅ | One row per assessment session; tracks question_budget, questions_asked, stop_reason, integrity_flags |
| Evidence integrity columns | ✅ | `admissible`, `integrity_flags`, `provenance` on evidence |
| `lib/integrityPrecheck.ts` | ✅ | Flags: missing_provenance, third_party_data_risk, low_context. Blocks only on third_party_data_risk |
| Rubrics + rubric_criteria tables | ✅ | MBA-style 5 criteria: UNDERSTANDING, APPLICATION, REASONING, EVIDENCE, COMMUNICATION |
| Rubric seed | ✅ | `rubric_mba_generic_v1` with level descriptors (excellent, proficient, needs_improvement) |
| Rubric-aware evaluator | ✅ | Prompt maps layers to criteria; passes rubric JSON |
| Provenance on new evidence | ✅ | `ownership_assertion: 'user_submitted'` for add/upload |
| Provenance backfill | ✅ | Migration sets default for existing evidence |

### Phase 2 — Per-Question Explainability (WhyAsked)

| Deliverable | Status | Notes |
|-------------|--------|------|
| assessment_questions extensions | ✅ | layer_number, criterion_code, skill_tags, evidence_anchors, why_asked |
| WhyAskedPayload type | ✅ | rubric, evidenceTrigger, purpose, decisionUse, scoringBasis, governanceHooks |
| Structured question generator | ✅ | AI returns objects with text, layer, criterion_code, skill_tags, evidence_anchors, why_asked |
| Legacy fallback | ✅ | If AI returns strings, normalizeQuestions() wraps with defaults |

### Phase 3 — CAEL and NIST AI RMF

| Deliverable | Status | Notes |
|-------------|--------|------|
| verifications extensions | ✅ | assessor_id, assessor_role, cael_standards, equity_flags |
| user_equity_profiles table | ✅ | Schema only; no UI or data collection |
| assessment_questions bias columns | ✅ | bias_status, bias_issues |
| question_bias_events table | ✅ | Telemetry for bias checks |
| lib/biasMonitor.ts | ✅ | Banned-term heuristic (stupid, lazy, crazy, dumb, incompetent) |
| POST /api/assessments/[runId]/override | ✅ | Human assessor override; updates verification + entry |
| NIST hooks in why_asked | ✅ | governanceHooks.nistFunctions = ['MEASURE','MANAGE'] |

### Phase 4 — Question Budget and Stop Rules

| Deliverable | Status | Notes |
|-------------|--------|------|
| computeQuestionBudget() | ✅ | Token-based; hard cap 15 |
| shouldStop() helper | ✅ | Ready for adaptive flow; not wired into fixed 4-question V1 |
| question_budget on run | ✅ | Stored when run created |

### Phase 5 — Reliability (Double Rating, Cohen's Kappa)

| Deliverable | Status | Notes |
|-------------|--------|------|
| scoring_records table | ✅ | run_id, criterion_code, rater_id, score (1–3) |
| scoring_records on evaluate | ✅ | Writes ai_v1 for each layer |
| POST /api/ai/evaluate-secondary | ✅ | Second rater (ai_v1b); same body as evaluate |
| lib/reliability.ts | ✅ | computeCohensKappa(), getReliabilityForRun() |
| GET /api/reliability/run/[runId] | ✅ | Returns kappa, percentAgreement, meetsThreshold per criterion |

### Phase 6 — Adaptive/Re-Ask

| Deliverable | Status | Notes |
|-------------|--------|------|
| Re-ask logic | ⏸️ Deferred | assessment_runs.metadata can store re_ask_step; no UI or flow |

---

## 2. Constraints and Gaps

### 2.1 Migration Dependency

**Constraint:** All phases assume migrations are run in order. If Phase 1 migrations are skipped, the app will fail (e.g. `assessment_runs` does not exist, `evidence.provenance` missing).

**Gap:** No migration runner or version check. Manual Supabase SQL Editor execution required.

### 2.2 Integrity Precheck

**Constraint:** `admissible === false` only when `third_party_data_risk` is present. `missing_provenance` alone does not block. All new evidence gets `ownership_assertion: 'user_submitted'`, so precheck effectively never blocks for normal flows.

**Gap:** No UI to set provenance (e.g. third_party_data, permissions_assertion). Users cannot correct integrity flags. `obvious_mismatch` (domain vs intent) is TODO.

### 2.3 File Evidence

**Gap:** File evidence (PDF, Word, etc.) is not text-extracted. Question generator receives only `"File: filename"`. Questions for file-based evidence are generic, not grounded in content.

### 2.4 Assessor Override

**Gap:** No UI for assessors. Override API exists but requires runId; no dashboard or list of runs to override. No role-based access—any authenticated user can override.

### 2.5 Equity Monitoring

**Gap:** `user_equity_profiles` table exists but is never populated. No data collection, no equity metrics, no disparate impact analysis.

### 2.6 Bias Monitor

**Constraint:** Heuristic only—banned word list. No semantic bias detection. Flagged questions are still stored and used; no blocking.

**Gap:** No UI to review flagged questions. question_bias_events is write-only telemetry.

### 2.7 Double Rating / Kappa

**Gap:** evaluate-secondary must be called manually (e.g. script or second API call). No automatic second rating. No UI to trigger or view reliability. GET /api/reliability/run/[runId] requires runId—user/learner does not have it; only internal/assessor would.

### 2.8 Run ID Visibility

**Gap:** assessment_runs.id is never returned to the client. User flow does not expose runId. Override and reliability APIs need runId—no way for a typical user to obtain it.

---

## 3. Recommendations: What to Stop or Defer

| Area | Recommendation | Rationale |
|------|----------------|-----------|
| **user_equity_profiles** | Defer until governance requires it | No data collection UI; schema is speculative. |
| **Assessor override UI** | Build when assessors are onboarded | API is ready; needs a simple admin screen and runId lookup. |
| **evaluate-secondary automation** | Defer to pilot design | Manual second call is acceptable for pilot; automate only if needed. |
| **Bias blocking** | Do not block on bias flags in V1 | Flagging is sufficient for audit; blocking could frustrate users. |
| **Phase 6 re-ask** | Keep deferred | Adaptive flow needs UX and client changes; governance first. |
| **obvious_mismatch integrity** | Implement if domain/intent mismatch is common | Low priority; can add when patterns emerge. |

### What to Prioritise Next

1. **Migration automation** — Script or Supabase migration runner so deploys are reproducible.
2. **INTEGRITY_HOLD UX** — If precheck ever blocks, ensure the assessment page shows a clear, actionable message (e.g. “Add more context or confirm ownership”).
3. **Assessor run lookup** — Endpoint or UI to list runs by entry_id or user_id so assessors can find runId for override.
4. **File content extraction** — For PDF/Word, add text extraction (e.g. pdf-parse, mammoth) so questions are evidence-grounded.

---

## 4. User Flow Analysis (As If I Were the User)

### 4.1 Happy Path

1. **Home** → Start Recording → Dashboard  
2. **Dashboard** → Create entry → Add evidence page  
3. **Add** → Choose link/text/file, add evidence + intent → Submit  
4. **Add** → Analyze runs → If eligible, redirect to Assessment  
5. **Assessment** → Questions load (generateQuestions) → Answer 4 questions → Submit  
6. **Result** → See capability summary, confidence, layer breakdown → Copy verification link  
7. **Verify** → Share link; public page shows record  

**Feels:** Straightforward. Steps are clear. No obvious dead ends.

### 4.2 Potential Breaks and Friction

| Step | Risk | User Experience |
|------|------|-----------------|
| **Add → Submit** | Evidence type file with no transcript | For files, analysis uses filename only. Eligibility may be odd. |
| **Add → Submit** | Ineligible evidence | Warning shown; user can “Continue anyway” → goes to Assessment. OK. |
| **Assessment load** | INTEGRITY_HOLD (rare) | Error: “Evidence did not pass integrity checks. Cannot generate questions. Flags: …” User sees generic error area; may not understand “missing_provenance” or “third_party_data_risk”. |
| **Assessment load** | Migrations not run | 500 or “relation does not exist”. User sees “Something went wrong” or “Failed to load questions.” No guidance. |
| **Assessment load** | AI timeout or parse error | “Failed to load questions.” or “AI did not return all 4 required questions.” Retry not obvious. |
| **Result** | Low confidence | No verification link. User sees result but cannot share. May wonder what to do next. |
| **Dashboard** | Entry with “Under review” | User can click → detail modal → “Continue assessment”. If they already answered and are waiting for evaluation, this is correct. If they left mid-flow, “Continue assessment” re-triggers generateQuestions → new run, new questions. Previous answers may be overwritten. |

### 4.3 Flow Gaps (As User)

1. **No “why was I blocked?”** — If integrity blocks, the message lists flags but does not explain how to fix them (e.g. “Add an ownership statement”).
2. **No retry on question load failure** — User must refresh or re-enter from dashboard. No explicit “Try again” button.
3. **Low confidence result** — No next step (e.g. “Add stronger evidence and try again” or “Request human review”).
4. **Run/verification not linked in UI** — User never sees runId. Override and reliability are invisible to them.
5. **File evidence feels shallow** — For a PDF, questions may feel generic. User may expect questions about the document content.

---

## 5. Summary

| Dimension | Status |
|-----------|--------|
| **Backend / API** | Phases 1–5 implemented; Phase 6 deferred. All new APIs and tables in place. |
| **Migrations** | 6 migration files; must be run manually in order. |
| **User-facing flow** | Unchanged. Add → Assessment → Result works. INTEGRITY_HOLD and migration failures can cause opaque errors. |
| **Assessor / admin** | Override and reliability APIs exist; no UI. runId not exposed to users. |
| **Governance readiness** | Rubrics, integrity, bias logging, scoring records, kappa—all present. Equity and re-ask deferred. |

**Bottom line:** The assessment engine is implemented end-to-end with governance hooks. The main user flow is intact. Gaps are mostly in UX (error handling, retry, low-confidence guidance), assessor tooling (run lookup, override UI), and file evidence depth. Recommend: run migrations, smoke-test the flow, then prioritise migration automation and INTEGRITY_HOLD UX before adding equity or re-ask.
