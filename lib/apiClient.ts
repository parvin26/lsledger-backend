import { getApiBaseUrl } from './config'

export interface ApiError {
  code: string
  message: string
  status: number
}

/**
 * Reusable request helper. Prefixes path with API base URL, attaches auth, JSON body/parse.
 * Throws on non-2xx with { code, message, status }. Server never returns raw auth phrases
 * (e.g. "Missing or invalid Authorization header"); 401 uses message "Unauthorized".
 * In guest mode with no session (token null), we send no Authorization header so the
 * server uses GUEST_USER_ID instead of validating a token.
 */
export async function request<T = unknown>(
  path: string,
  method: string,
  token: string | null,
  body?: unknown
): Promise<T> {
  const base = getApiBaseUrl().replace(/\/$/, '')
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`

  const effectiveToken = token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    const cause = err.cause instanceof Error ? err.cause.message : undefined
    throw {
      code: 'NETWORK_ERROR',
      message: cause || err.message || 'Network request failed. Check your connection or try again later.',
      status: 0,
    } as ApiError
  }

  let data: { error?: { code: string; message: string } }
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err: ApiError = {
      code: data?.error?.code ?? 'REQUEST_FAILED',
      message: data?.error?.message ?? (res.statusText || `Request failed (${res.status})`),
      status: res.status,
    }
    throw err
  }

  return data as T
}

/**
 * POST multipart/form-data. Do not set Content-Type so the browser sets boundary.
 * Throws on non-2xx with { code, message, status }.
 */
export async function requestMultipart<T = unknown>(
  path: string,
  method: 'POST',
  token: string | null,
  body: FormData
): Promise<T> {
  const base = getApiBaseUrl().replace(/\/$/, '')
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`

  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body,
    })
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    const cause = err.cause instanceof Error ? err.cause.message : undefined
    throw {
      code: 'NETWORK_ERROR',
      message: cause || err.message || 'Network request failed. Check your connection or try again later.',
      status: 0,
    } as ApiError
  }

  const text = await res.text()
  let data: { error?: { code: string; message: string } }
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = {}
  }

  if (!res.ok) {
    const err: ApiError = {
      code: data?.error?.code ?? 'REQUEST_FAILED',
      message: data?.error?.message ?? (res.statusText || `Request failed (${res.status})`),
      status: res.status,
    }
    throw err
  }

  return data as T
}
