/**
 * Shared Supabase env helpers. Used by server (URL only) and by browser client (URL + anon key).
 * Only lib/supabaseClient.ts throws the "frontend auth" error; this file throws server-oriented messages.
 */
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  return url
}
