# Lighthouse Ledger — Assessment Architecture Summary

This document maps the current codebase for evidence ingestion, domain/skill mapping, question generation, assessment runs, scoring, and audit logging. It serves as system context for implementing CAEL-aligned prior learning assessment, NIST AI RMF hooks, and reliability metrics.

---

## 1. Current Services and Modules

### 1.1 Evidence Ingestion

| Component | Location | Description |
|-----------|----------|-------------|
| **Link evidence** | `POST /api/evidence/add` | Accepts `evidence_type: 'link'`, `content` (URL). For YouTube URLs, optionally fetches transcript via `getYouTubeTranscript()` and stores in `evidence.transcript`. |
| **Text evidence** | `POST /api/evidence/add` | Accepts `evidence_type: 'text'`, `content` (raw text). Stored directly in `evidence.content`. |
| **File evidence** | `POST /api/evidence/upload` | FormData: `entry_id`, `file`. Uploads to Supabase Storage bucket `evidence-files`; path `{user_id}/{entry_id}/{uuid}.ext`. Stores metadata in `evidence` (storage_path, original_filename, mime_type, size). **Content is not extracted** — only filename is stored in `content`. |
| **File replace** | `POST /api/evidence/replace` | Replaces existing file evidence for an entry; same constraints as upload. |
| **YouTube transcript** | `lib/videoTranscript.ts`, `POST /api/youtube-transcript` | `getYouTubeTranscript()` calls `/api/youtube-transcript` (or `YOUTUBE_TRANSCRIPT_API_URL`). Uses `youtube-transcript` package. Max 15,000 chars. Stored in `evidence.transcript` for link-type evidence. |
| **Evidence retrieval** | `GET /api/evidence?entry_id=` | Returns all evidence for an entry (owner only). Includes transcript for links. |
| **Signed URL** | `GET /api/evidence/[evidenceId]/signed-url` | Returns temporary download URL for file evidence (owner only). |

**Supported file types:** PDF, Word, PowerPoint, Excel, plain text, markdown, PNG, JPEG, WebP. Max 25 MB.

**Limitation:** File evidence (PDF, Word, etc.) is **not** text-extracted. Question generation receives only `"File: filename"` — no document content.

---

### 1.2 Domain / Skill Mapping and Rubrics

| Component | Location | Description |
|-----------|----------|-------------|
| **Domain classifier** | `POST /api/ai/analyze`, `prompts/domainClassifier.txt` | AI classifies evidence. Returns: `primary_domain` (Finance, Technology, Software_Product, Business_Strategy), `secondary_domain`, `complexity_level` (Beginner/Intermediate/Advanced), `eligible`, `eligibility_reason`, `key_topics`, `evaluator_lens`. |
| **Persisted classification** | `entries` table | Only `domain` and `eligibility` are stored. `key_topics`, `evaluator_lens`, `complexity_level` are returned to client but **not persisted**. |
| **Rubrics** | Prompts only | No stored rubric tables. Criteria are embedded in `questionGenerator.txt` and `answerEvaluator.txt` (four layers: Explanation, Application, Trade-offs/limits, Reflection/next steps). Descriptors: Strong, Adequate, Needs work. No domain-specific or MBA-style analytic rubrics. |

---

### 1.3 Question Generation and Adaptive Logic

| Component | Location | Description |
|-----------|----------|-------------|
| **Question generator** | `POST /api/ai/questions`, `prompts/questionGenerator.txt` | Fetches evidence (transcript for YouTube, text for text type, `"File: name"` for files). Builds prompt with evidence summary, transcript/excerpt, domain, intent. Returns exactly 4 questions (q1–q4) mapped to layers. |
| **Adaptive logic** | None | Fixed 4 questions per session. No branching, difficulty adaptation, or item selection. |
| **Question storage** | `assessment_questions` | Upserts (entry_id, question_number, question_text). No `layer` column used in API; layer is implicit by question_number (1–4). |
| **Explainability** | None | No "why this question" rationale stored or exposed. |

---

### 1.4 Assessment Runs, Scoring, and Audit Logging

| Component | Location | Description |
|-----------|----------|-------------|
| **Assessment flow** | Client: `app/assessment/page.tsx` | 1) `generateQuestions(entryId)` → 2) User answers 4 questions → 3) `evaluateAnswers(entry_id, answers)`. |
| **Answer storage** | `POST /api/ai/evaluate` | Upserts into `assessment_answers` (entry_id, question_number, answer_text) **before** AI evaluation — for auditability. |
| **Scoring** | `prompts/answerEvaluator.txt`, `lib/ai.ts` | AI returns per-layer descriptors (Strong/Adequate/Needs work), capability_summary, confidence_band (Low/Medium/High), rationale. |
| **Verification record** | `verifications` table | Created only when confidence is Medium or High. Stores domain, capability_summary, confidence_band, intent_prompt, evidence_summary, layer1–4_descriptor. |
| **Audit logging** | Minimal | `assessment_answers` stores answers. No dedicated audit log table. No logging of AI inputs/outputs, timestamps of AI calls, or assessment run metadata. `entries` table has `created_at`; `verifications` has `created_at`. |
| **Double-rating / kappa** | None | Single AI evaluation only. No second rater, no Cohen's kappa calculation. |

---

## 2. Data Models / Tables / Types

### 2.1 EvidenceObject / Submissions

| Table/Type | Fields | Notes |
|------------|--------|-------|
| **entries** | id, user_id, title, description, created_at, intent_prompt, domain, eligibility, capability_summary, confidence_band | Top-level submission container. |
| **evidence** | id, entry_id, evidence_type ('link'\|'file'\|'text'), content, created_at, storage_path?, original_filename?, mime_type?, size?, transcript? | One-to-many per entry. `content` = URL for link, text for text, filename for file. |
| **EvidenceItem** (types/api.ts) | id, evidence_type, content, storage_path?, original_filename?, mime_type?, size?, transcript?, created_at | API response shape. |
| **AddEvidenceRequest** | entry_id, evidence_type, content | For link/text. File uses upload FormData. |

---

### 2.2 Rubrics and Criteria

| Table/Type | Fields | Notes |
|------------|--------|-------|
| **Rubrics** | None | No rubric table. Criteria live in prompts only. |
| **DomainClassification** | primary_domain, secondary_domain, complexity_level, eligible, eligibility_reason, key_topics, evaluator_lens | AI output; only domain + eligibility persisted. |

---

### 2.3 Questions and Responses

| Table/Type | Fields | Notes |
|------------|--------|-------|
| **assessment_questions** | entry_id, question_number (1–4), question_text, layer? (optional, not used in API) | One set per entry. |
| **assessment_answers** | entry_id, question_number, answer_text | Stored on evaluate. |
| **QuestionGeneration** | q1, q2, q3, q4 | AI output. |
| **EvaluateAnswersRequest** | entry_id, answers: [{ questionNumber, answer }] | Must have exactly 4 answers. |

---

### 2.4 AssessmentRun / Capability Records

| Table/Type | Fields | Notes |
|------------|--------|-------|
| **verifications** | id, entry_id, public_id, domain, capability_summary, confidence_band, intent_prompt, created_at, evidence_summary?, layer1–4_descriptor? | Capability record. Created only for Medium/High confidence. |
| **VerificationRecord** | public_id, domain, capabilitySummary, confidenceBand, created_at, intent_prompt?, evidence_summary?, layer1–4_descriptor? | API response (no entry_id in public API). |
| **entries** | capability_summary, confidence_band | Updated by evaluate for all outcomes. |
| **AssessmentRun** | No dedicated table | No explicit "run" entity. Flow is: entry → questions → answers → evaluation → entry + optional verification. |

---

## 3. Human Assessors, Bias/Fairness, Logging, Telemetry

### 3.1 Human Assessor Interaction

| Feature | Status |
|---------|--------|
| **Override / QA screens** | **Missing.** No UI or API for human assessors to review, override, or QA AI evaluations. |
| **Review screens** | **Missing.** "Under review" / "Reviewed" are status labels derived from data (has questions, has confidence_band, has verification). No human review workflow. |
| **Expert assessor role** | **Missing.** No concept of expert assessors in auth or data model. |

---

### 3.2 Bias / Fairness / Logging / Telemetry

| Feature | Status |
|---------|--------|
| **Bias monitoring** | **Missing.** No hooks for bias detection in question generation or scoring. |
| **Fairness metrics** | **Missing.** No equity monitoring, demographic parity, or disparate impact tracking. |
| **Structured logging** | **Partial.** `console.warn` for transcript failures, `console.error` for entries API errors. No structured audit log. |
| **Telemetry** | **Missing.** `instrumentation.ts` only checks guest config in dev. No OpenTelemetry, metrics, or tracing. |
| **AI call logging** | **Missing.** No logging of prompt/response for domain classifier, question generator, or evaluator. |

---

## 4. Gaps vs. Target Design

Target design includes:
- **CAEL-aligned prior learning assessment:** expert assessors, equity monitoring, clear criteria
- **NIST AI RMF hooks:** bias monitoring and explainability in question generation
- **Reliability metrics:** Cohen's kappa ≥ 0.8 on pilot double-rating; 15-question/session cap in V1

---

### 4.1 What Is Already Present

| Element | Current State |
|---------|---------------|
| **Evidence-first flow** | Evidence (link, text, file) is primary input. Questions generated from evidence content (where available). |
| **Four-layer structure** | Explanation, Application, Trade-offs/limits, Reflection/next steps. Per-layer descriptors (Strong/Adequate/Needs work). |
| **Domain classification** | Primary domain, eligibility, complexity, key_topics, evaluator_lens (latter two not persisted). |
| **Answer persistence** | `assessment_answers` stores answers before evaluation for auditability. |
| **Verification record** | Public record with capability summary, confidence band, layer breakdown. |
| **Question cap** | 4 questions per session — **under** 15-question V1 cap. |
| **YouTube transcript** | Transcript ingested and used for grounded questions. |

---

### 4.2 What Is Partial

| Element | Current State | Gap |
|---------|---------------|----------------|
| **Rubrics** | Criteria in prompts only | No stored, domain-specific rubrics; no MBA-style analytic dimensions (understanding, application, reasoning, evidence use, communication). |
| **Domain/skill mapping** | Fixed 4 domains; key_topics returned but not stored | key_topics, evaluator_lens, complexity_level not persisted; no extensible skill taxonomy. |
| **File evidence** | Upload + metadata stored | No text extraction for PDF/Word; question generator sees only filename. |
| **Audit trail** | Answers stored; timestamps on entries/verifications | No dedicated audit log; no AI input/output logging; no assessment run metadata. |
| **Explainability** | Evaluator returns `rationale` | No "why this question" per item; no stored rationale for question generation. |

---

### 4.3 What Is Missing

| Element | Target | Current State |
|---------|--------|---------------|
| **CAEL: Expert assessors** | Human expert assessors in the loop | No human assessor role, override, or QA workflow. |
| **CAEL: Equity monitoring** | Monitor fairness across groups | No equity metrics, demographic tracking, or disparate impact analysis. |
| **CAEL: Clear criteria** | Explicit, defensible criteria | Criteria embedded in prompts; not stored or versioned. |
| **NIST AI RMF: Bias monitoring** | Govern–Map–Measure–Manage for AI risk | No bias monitoring in question generation or scoring. |
| **NIST AI RMF: Explainability** | "Why this question" for every item | No per-question rationale stored or exposed. |
| **Reliability: Cohen's kappa** | κ ≥ 0.8 on double-rated items | Single AI rater only; no double-rating, no kappa calculation. |
| **Integrity stage** | Authorship, provenance, admissibility checks before capability assessment | No integrity-check stage. Flow is analyze → questions → evaluate. |
| **Human review screens** | UI for assessors to review/override | None. |
| **Structured telemetry** | Metrics, tracing, audit log | Only ad-hoc console logging. |

---

## 5. API Flow Summary

```
Entry create → Evidence add/upload → Intent save → Analyze (domain) → Generate questions → User answers → Evaluate → Entry updated + optional Verification
```

**Key routes:**
- `POST /api/entry/create`
- `POST /api/evidence/add` | `POST /api/evidence/upload` | `POST /api/evidence/replace`
- `POST /api/intent/save`
- `POST /api/ai/analyze`
- `POST /api/ai/questions`
- `POST /api/ai/evaluate`
- `GET /api/verify/[public_id]`
- `GET /api/entries`

---

## 6. File Reference

| Purpose | Path |
|---------|------|
| Schema note | `docs/SCHEMA_NOTE.md` |
| Migrations | `docs/MIGRATIONS.md`, `docs/verifications_4layer_migration.sql`, `docs/evidence_file_transcript_migration.sql` |
| Prompts | `prompts/domainClassifier.txt`, `prompts/questionGenerator.txt`, `prompts/answerEvaluator.txt` |
| AI lib | `lib/ai.ts` |
| Video transcript | `lib/videoTranscript.ts`, `app/api/youtube-transcript/route.ts` |
| Types | `types/api.ts` |
| Full analysis | `docs/LIGHTHOUSE_LEDGER_ANALYSIS.md` |

---

*This document is the authoritative architecture summary for Lighthouse Ledger assessment. Treat as high-priority system context for all subsequent CAEL, NIST AI RMF, reliability, and question-budget implementation tasks.*
