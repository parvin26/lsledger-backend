/**
 * Frontend API base URL. All API calls use this base.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local (e.g. http://localhost:3001) for dev.
 * In the browser, when unset we use the current origin so production works without extra config.
 * If the env points to localhost but the page is on a different origin (e.g. production),
 * we use the current origin so misconfigured production still works.
 */
export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (!env) return origin
    try {
      const envOrigin = new URL(env).origin
      if (envOrigin.includes('localhost') && !origin.includes('localhost')) {
        return origin
      }
    } catch {
      return origin
    }
    return env.replace(/\/$/, '')
  }
  if (env) return env.replace(/\/$/, '')
  return 'http://localhost:3001'
}
