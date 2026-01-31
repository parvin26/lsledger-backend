import { GUEST_MODE_ENABLED } from './featureFlags'
import { supabaseServer } from './supabaseServer'

/**
 * Guest mode config error: thrown when GUEST_MODE_ENABLED is true but GUEST_USER_ID
 * is not set. API routes catch this and return 503 with a safe message (never raw error text).
 * Check via: error instanceof GuestConfigError.
 */
export class GuestConfigError extends Error {
  readonly code = 'GUEST_CONFIG' as const
  constructor() {
    super('Guest mode is on but GUEST_USER_ID is not set.')
    this.name = 'GuestConfigError'
    Object.setPrototypeOf(this, GuestConfigError.prototype)
  }
}

/**
 * Validates the Authorization header and returns the Supabase user id.
 * Only used internally by getUserIdForRequest when guest mode is off or when a Bearer token is present.
 *
 * IMPORTANT: This function is the only place that throws "Missing or invalid Authorization header".
 * That message is for internal/log use only and must NEVER be included in a JSON API response.
 * Protected routes use getUserIdForRequest and return { code: 'UNAUTHORIZED', message: 'Unauthorized' } on 401.
 *
 * Expected behavior:
 * - Guest mode + no header: caller uses getUserIdForRequest (returns GUEST_USER_ID); validateAuthToken is not called.
 * - Authenticated: valid Bearer token required.
 * - Unauthenticated, non-guest: throws → API returns 401 with generic message → client redirects to /login.
 */
export async function validateAuthToken(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseServer.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid or expired token')
  }

  return user.id
}

/**
 * Returns the user id to use for this request. Use this in all protected API routes
 * instead of validateAuthToken so that guest mode is supported.
 *
 * Guest mode ON:
 * - No or invalid Authorization header: does NOT call validateAuthToken; returns GUEST_USER_ID if set,
 *   otherwise throws GuestConfigError (API returns 503 with safe message).
 * - Valid Bearer header: validates token and returns that user id (e.g. test token).
 *
 * Guest mode OFF:
 * - Enforces validateAuthToken(authHeader); throws if missing/invalid (API returns 401 with message "Unauthorized").
 */
export async function getUserIdForRequest(authHeader: string | null): Promise<string> {
  if (GUEST_MODE_ENABLED && (!authHeader || !authHeader.startsWith('Bearer '))) {
    const guestId = process.env.GUEST_USER_ID
    if (!guestId) {
      throw new GuestConfigError()
    }
    return guestId
  }
  return validateAuthToken(authHeader)
}
