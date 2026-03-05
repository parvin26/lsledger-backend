/**
 * Run Lighthouse Ledger database migrations.
 * Requires DATABASE_URL in .env.local (Supabase Dashboard → Settings → Database → Connection string).
 * Run: node --env-file=.env.local scripts/run-migrations.js
 */

const { Client } = require('pg')

const MIGRATIONS = [
  {
    name: 'evidence_file_transcript',
    sql: `
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS size bigint,
  ADD COLUMN IF NOT EXISTS transcript text;
`,
  },
  {
    name: 'phase1_evidence_integrity',
    sql: `
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS admissible boolean,
  ADD COLUMN IF NOT EXISTS integrity_flags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS provenance jsonb DEFAULT '{}'::jsonb;
`,
  },
  {
    name: 'phase6_mcq_question_format',
    sql: `
ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS format text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS options jsonb,
  ADD COLUMN IF NOT EXISTS correct_option_index integer;

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS selected_option_index integer,
  ADD COLUMN IF NOT EXISTS is_mcq_correct boolean;
`,
  },
  {
    name: 'phase6b_question_number_constraint',
    sql: `
ALTER TABLE assessment_questions
  DROP CONSTRAINT IF EXISTS assessment_questions_question_number_check;

ALTER TABLE assessment_questions
  ADD CONSTRAINT assessment_questions_question_number_check
  CHECK (question_number >= 1 AND question_number <= 20);
`,
  },
  {
    name: 'newsletter_subscribers',
    sql: `
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  consented_at timestamptz NOT NULL DEFAULT now(),
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'footer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed_at)
  WHERE unsubscribed_at IS NULL;
`,
  },
]

function getConnectionUrls() {
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
    return [process.env.DATABASE_URL || process.env.SUPABASE_DB_URL]
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const password = process.env.SUPABASE_DB_PASSWORD
  if (!supabaseUrl || !password) return []
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
  const projectRef = match ? match[1] : 'unknown'
  const encoded = encodeURIComponent(password)
  return [
    `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres`,
  ]
}

async function main() {
  const urls = getConnectionUrls()
  if (urls.length === 0) {
    console.error(`
Missing database connection. Add ONE of these to .env.local:

Option A (recommended) - Copy the full connection string from Supabase Dashboard:
  Project Settings → Database → Connection string → URI
  DATABASE_URL="postgresql://postgres:[PASSWORD]@db....supabase.co:5432/postgres"
  (Use "Session pooler" or "Transaction pooler" if direct connection fails with ENOTFOUND)

Option B - Direct connection only (may fail on networks without IPv6):
  SUPABASE_DB_PASSWORD="your-database-password"

Or run this SQL manually in Supabase SQL Editor (Dashboard → SQL Editor):
`)
    console.log('-- evidence_file_transcript')
    console.log(MIGRATIONS[0].sql.trim())
    console.log('\n-- phase1_evidence_integrity')
    console.log(MIGRATIONS[1].sql.trim())
    process.exit(1)
  }

  let lastErr = null
  for (const url of urls) {
    const client = new Client({ connectionString: url })
    try {
      await client.connect()
      for (const m of MIGRATIONS) {
        await client.query(m.sql)
        console.log(`✓ ${m.name}`)
      }
      console.log('Migrations complete.')
      await client.end()
      return
    } catch (err) {
      lastErr = err
      await client.end().catch(() => {})
    }
  }
  console.error('Migration failed:', lastErr?.message ?? 'Could not connect')
  process.exit(1)
}

main()
