-- Lighthouse Ledger: evidence table — file metadata and transcript
-- Run in Supabase SQL Editor. Creates bucket and adds columns for file evidence and YouTube transcript.

-- 1. Evidence table: file metadata (nullable for non-file evidence)
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS size bigint,
  ADD COLUMN IF NOT EXISTS transcript text;

-- 2. Make content nullable (file evidence uses storage_path; content can store display name or URL)
-- Optional: ALTER TABLE evidence ALTER COLUMN content DROP NOT NULL;
-- Skip if your app expects content NOT NULL; for file type we will set content = original_filename.

-- 3. Create storage bucket (run in Supabase Dashboard → Storage → New bucket, or via SQL if supported)
-- Bucket name: evidence-files
-- Public: false (access via signed URLs or RLS)
-- If your project uses Storage API, create the bucket via Dashboard → Storage → New bucket named "evidence-files".
