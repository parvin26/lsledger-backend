/**
 * Runs once when the Next.js server starts. Used for dev-only checks (e.g. guest mode config).
 * Requires experimental.instrumentationHook in next.config.js.
 */
export async function register() {
  if (process.env.NODE_ENV !== 'development') return
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { GUEST_MODE_ENABLED } = await import('./lib/featureFlags')
  if (GUEST_MODE_ENABLED && !process.env.GUEST_USER_ID) {
    console.warn(
      '[Lighthouse Ledger] Guest mode is ON but GUEST_USER_ID is not set. ' +
        'Protected API calls will return 503 until you set GUEST_USER_ID in .env.local.'
    )
  }
}
