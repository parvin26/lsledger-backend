/**
 * Frontend API base URL. All API calls use this base.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local (e.g. http://localhost:3001).
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'
}
