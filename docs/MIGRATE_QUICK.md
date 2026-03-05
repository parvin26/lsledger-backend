# Quick fix: Database schema errors

If you see **"mime_type column"**, **"assessment_runs"**, or other table/column errors, run these in order:

## 1. Full schema (required)

Run **`docs/FULL_SCHEMA_MIGRATION.sql`** in Supabase SQL Editor. It creates all missing tables and columns.

## 2. Remaining setup (storage policies + base tables)

Run **`docs/SUPABASE_REMAINING_SETUP.sql`** in Supabase SQL Editor. It adds:
- Storage policies for the `evidence-files` bucket (fixes upload errors)
- Base tables `entries`, `evidence`, `verifications` (only if missing, e.g. fresh project)

---

## Previous: mime_type only

If you see **"Could not find the 'mime_type' column of 'evidence'"** only:

## Option 1: Add database password and run script

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/ukhaafefmhadggcbgnew) → **Project Settings** → **Database**
2. Copy your **Database password** (or reset it if you don't have it)
3. Add to `.env.local`:
   ```
   SUPABASE_DB_PASSWORD=your-database-password
   ```
4. Run:
   ```bash
   npm run migrate
   ```

## Option 2: Run SQL manually

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/ukhaafefmhadggcbgnew/sql/new)
2. Paste and run:

```sql
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS size bigint,
  ADD COLUMN IF NOT EXISTS transcript text;

ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS admissible boolean,
  ADD COLUMN IF NOT EXISTS integrity_flags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS provenance jsonb DEFAULT '{}'::jsonb;
```

## Option 3: Dev endpoint

With dev server running, if `SUPABASE_DB_PASSWORD` or `DATABASE_URL` is in `.env.local`:

```
GET http://localhost:3001/api/migrate
```
