'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getSupabaseBrowser(): SupabaseClient {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.warn('Supabase env in production', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
  })

  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for frontend auth')
  }

  _client = createClient(url, anonKey)
  return _client
}

/**
 * Browser Supabase client. Created lazily on first use so prerender (SSR) does not
 * require NEXT_PUBLIC_* env vars at build time. Env is checked when the client is
 * first used (e.g. in useEffect in the browser).
 */
export const supabaseBrowser = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseBrowser() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/** Get current session access token for API calls. Returns null if not signed in. */
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await getSupabaseBrowser().auth.getSession()
  return session?.access_token ?? null
}
