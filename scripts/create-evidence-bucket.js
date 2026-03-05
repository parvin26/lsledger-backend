/**
 * One-time script to create the evidence-files storage bucket in Supabase.
 * Run: node --env-file=.env.local scripts/create-evidence-bucket.js
 */

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with: node --env-file=.env.local scripts/create-evidence-bucket.js')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  const BUCKET = 'evidence-files'
  const { data, error } = await supabase.storage.createBucket(BUCKET, {
    public: false
  })

  if (error) {
    if (error.message?.includes('already exists') || error.message?.toLowerCase().includes('duplicate')) {
      console.log(`Bucket "${BUCKET}" already exists. Nothing to do.`)
      return
    }
    console.error('Failed to create bucket:', error.message)
    process.exit(1)
  }

  console.log(`Bucket "${BUCKET}" created successfully.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
