# PR: Structured intent (category + optional details)

## Summary

Replaces the free-text "Intent (why you want this reviewed)" textarea on the Add Evidence page with a structured design: a required multiple-choice question plus an optional "Other / extra context" text field.

## New intent categories

| Value | Label |
|-------|-------|
| `phd_application` | Apply for a programme or scholarship (e.g. PhD, fellowship). |
| `employer_review` | Show capability to an employer or client. |
| `self_learning` | Get feedback for my own learning. |
| `funding_application` | Support a funding or grant application. |
| `course_progress` | Progress inside an existing course or training. |
| `other` | Other (something else). |

## Backward compatibility with `intent_prompt`

- **Database:** `intent_prompt` remains untouched. New columns `intent_category` and `intent_details` are added.
- **API:** The intent save endpoint now accepts `intent_category` (required) and `intent_details` (optional). It continues to populate `intent_prompt` as: `intent_details` if provided, otherwise a human-readable label for the selected category. This ensures existing evaluator prompts, question generator, and domain classifier still receive a usable `intent_prompt` string.
- **Existing entries:** Records created before this change have `intent_category` and `intent_details` as NULL. On the Add page, when loading such an entry, we infer `intent_category = "other"` and `intent_details = intent_prompt` for display only (no automatic DB overwrite).
- **AI prompts:** Domain classifier, question generator, and evaluator continue to use `intent_prompt` as before. The question generator now also receives `intent_category` as an optional hint when available.
