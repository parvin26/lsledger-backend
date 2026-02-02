import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import { z } from 'zod'

const bodySchema = z.object({ url: z.string().url().min(1) })

function isYouTubeUrl(url: string): boolean {
  const u = url.trim().toLowerCase()
  return u.includes('youtube.com/watch') || u.includes('youtu.be/')
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_TRANSCRIPT_API_KEY
    if (apiKey) {
      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (token !== apiKey) {
        return NextResponse.json(
          { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
          { status: 401 }
        )
      }
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'url is required and must be a valid URL' } },
        { status: 400 }
      )
    }

    const { url } = parsed.data
    if (!isYouTubeUrl(url)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'URL must be a YouTube video (youtube.com or youtu.be)' } },
        { status: 400 }
      )
    }

    const segments = await YoutubeTranscript.fetchTranscript(url)
    const text = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim()

    return NextResponse.json({ text })
  } catch (err) {
    console.warn('[youtube-transcript] Error:', err instanceof Error ? err.message : String(err))
    return NextResponse.json(
      { error: { code: 'TRANSCRIPT_ERROR', message: 'Failed to fetch transcript' } },
      { status: 500 }
    )
  }
}
