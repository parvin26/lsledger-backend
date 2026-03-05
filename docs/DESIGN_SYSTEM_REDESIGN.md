# Lighthouse Ledger Design System Redesign

## Overview

Internal app pages have been redesigned to align with the landing page concept: clean editorial SaaS, deep navy sections, confident crimson CTAs, minimal icons, numbered steps. The updated UI uses a cool off-white background instead of beige and standardizes components across all pages.

---

## 1. Mini Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| app-bg | #F6F7FB | Primary page background (cool off-white, not beige) |
| lighthouse-navy | #1A2740 | Trust/institution color, header bands, secondary buttons |
| ledger-crimson | #B71C2A | Primary actions only (buttons, key highlights) |
| info-tint | #E8EEF7 | Muted blue for guidance/info panels |
| border-subtle | #E5E7EB | Card borders, dividers |
| deep-slate | #2E3A4D | Body text |
| muted-text | #717478 | Labels, helper text |
| signal-blue | #205B9F | Links, accents |
| success | #179E6A | Verified badge, High confidence |

### Type Scale

- H1: 1.875rem, 600 weight, tight tracking
- H2: 1.25rem, 600 weight
- Body: 1rem, 1.6 line-height
- Label: 0.75rem, uppercase, 0.05em letter-spacing

### Spacing

- 8pt system: 4, 8, 12, 16, 20, 24, 32, 40, 48px
- Mobile edge padding: 16-20px
- Tap targets: minimum 44px height

### Components

1. TopHeader: Back link + page H1 + optional step pill; optional navy band
2. Button: Primary (crimson), Secondary (navy outline), Tertiary (text link)
3. Card: Default (white, subtle border), Info (blue tint), Verification (emphasis)
4. Badge: Confidence (High/Medium/Low), Status (Draft/Submitted/Verified)
5. CopyLinkRow: URL + copy button + success toast
6. StickyActionBar: Back (left), Primary (right, crimson), helper text

---

## 2. Page-by-Page Changes

### A) Practitioner Questions (Step 2 of 3)

- Cool off-white background
- TopHeader with step pill
- Guidance card with muted blue tint
- Accordion questions: numbered 01-04, expand/collapse
- Sticky bottom bar: Back to evidence, Submit for review (crimson)
- Copy: "2 to 3 sentences" (no em dash)

### B) Assessment Result

- Navy header band
- Confidence band as badge + short explanation
- Capability summary in bordered block
- Breakdown as grid of cards (not bullets)
- Verification card: Verified badge, crimson View verification record
- CopyLinkRow with copy button
- Secondary Back to dashboard (navy outline)

### C) Public Verification Record

- Navy header band
- Labels: small caps
- Confidence + Verified as badges
- CopyLinkRow for record link
- Disclaimer: readable but secondary

### D) Dashboard

- Cool off-white background
- Create record (crimson) as primary CTA
- White cards with subtle border
- Copy: "3 to 5 minutes" (no em dash)

### E) Evidence Upload (Step 1 of 3)

- Cool off-white background
- Numbered 01 for Evidence type section
- Accepted formats + size guidance
- Why we ask microcopy
- Crimson Save and continue

---

## 3. Copy Rule: No Em Dashes

All UI copy uses commas, periods, or colons. Replaced:
- "2-3 sentences" to "2 to 3 sentences"
- "3-5 minutes" to "3 to 5 minutes"

---

## 4. File Structure

- app/globals.css: Design tokens
- app/components/ui/: TopHeader, Button, Card, Badge, CopyLinkRow, StickyActionBar
- Pages: assessment, result, verify, dashboard, add
