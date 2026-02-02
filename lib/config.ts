/**
 * Frontend API base URL. All API calls use this base.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local (e.g. http://localhost:3001).
 * In the browser, when unset we use the current origin so production works without extra config.
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL
  if (env) return env
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:3001'
}
