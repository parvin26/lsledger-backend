/**
 * Dev-only: run evidence table migrations. Requires DATABASE_URL in .env.local.
 * GET /api/migrate - runs migrations (only when NODE_ENV=development)
 */
import { NextResponse } from 'next/server'
import { Client } from 'pg'

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
]

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 404 })
  }

  let url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if (!url && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_DB_PASSWORD) {
    const match = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)
    const projectRef = match ? match[1] : 'unknown'
    url = `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`
  }
  if (!url) {
    return NextResponse.json(
      {
        error: 'DATABASE_URL not set',
        hint: 'Add DATABASE_URL to .env.local from Supabase Dashboard → Settings → Database → Connection string (URI)',
        sql: MIGRATIONS.map((m) => `-- ${m.name}\n${m.sql.trim()}`).join('\n\n'),
      },
      { status: 500 }
    )
  }

  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    const applied: string[] = []
    for (const m of MIGRATIONS) {
      await client.query(m.sql)
      applied.push(m.name)
    }
    return NextResponse.json({ ok: true, applied })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Migration failed' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
