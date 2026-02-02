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
