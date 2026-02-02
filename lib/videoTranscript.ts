/**
 * Fetches YouTube video transcript. Uses the built-in /api/youtube-transcript route when
 * YOUTUBE_TRANSCRIPT_API_URL is unset (defaults to same-origin in production and localhost in dev).
 * Set YOUTUBE_TRANSCRIPT_API_URL to override (e.g. external transcript API).
 * Optionally set YOUTUBE_TRANSCRIPT_API_KEY; if set, requests must send Authorization: Bearer <key>.
 * On error, logs server-side once and returns null; does not break the assessment flow.
 */

const MAX_TRANSCRIPT_LENGTH = 15000 // chars to avoid token limits

function normaliseYouTubeUrl(url: string): string | null {
  const u = url.trim()
  const youtubeMatch = u.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) return `https://www.youtube.com/watch?v=${youtubeMatch[1]}`
  const shortMatch = u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return `https://www.youtube.com/watch?v=${shortMatch[1]}`
  return null
}

function getTranscriptApiUrl(): string | null {
  if (process.env.YOUTUBE_TRANSCRIPT_API_URL) {
    return process.env.YOUTUBE_TRANSCRIPT_API_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/youtube-transcript`
  }
  return 'http://localhost:3001/api/youtube-transcript'
}

export function isYouTubeUrl(url: string): boolean {
  return normaliseYouTubeUrl(url) !== null
}

export async function getYouTubeTranscript(url: string): Promise<string | null> {
  const apiUrl = getTranscriptApiUrl()
  const apiKey = process.env.YOUTUBE_TRANSCRIPT_API_KEY
  if (!apiUrl) {
    return null
  }

  const normalised = normaliseYouTubeUrl(url)
  if (!normalised) return null

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url: normalised }),
    })

    if (!res.ok) {
      console.warn('[videoTranscript] API returned', res.status, await res.text().catch(() => ''))
      return null
    }

    const data = (await res.json()) as { text?: string; transcript?: string }
    const text = data?.text ?? data?.transcript ?? ''
    if (typeof text !== 'string' || !text.trim()) return null

    return text.length > MAX_TRANSCRIPT_LENGTH ? text.slice(0, MAX_TRANSCRIPT_LENGTH) + '…' : text
  } catch (err) {
    console.warn('[videoTranscript] Error fetching transcript:', err instanceof Error ? err.message : String(err))
    return null
  }
}
