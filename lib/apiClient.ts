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

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

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

  const res = await fetch(url, {
    method,
    headers,
    body,
  })

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
