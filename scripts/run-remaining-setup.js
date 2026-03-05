/**
 * Run remaining Supabase setup (storage policies + base tables).
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local.
 * Run: node --env-file=.env.local scripts/run-remaining-setup.js
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

function getConnectionUrl() {
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
    return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const password = process.env.SUPABASE_DB_PASSWORD
  if (supabaseUrl && password) {
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
    const projectRef = match ? match[1] : 'unknown'
    return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`
  }
  return null
}

async function main() {
  const url = getConnectionUrl()
  const sqlPath = path.join(__dirname, '../docs/SUPABASE_REMAINING_SETUP.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  if (!url) {
    console.log('No DATABASE_URL. Run this SQL manually in Supabase SQL Editor:\n')
    console.log('File: docs/SUPABASE_REMAINING_SETUP.sql')
    console.log('\nOr add DATABASE_URL or SUPABASE_DB_PASSWORD to .env.local and run again.')
    process.exit(1)
  }

  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    await client.query(sql)
    console.log('Remaining setup complete (storage policies + base tables).')
  } catch (err) {
    console.error('Setup failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
