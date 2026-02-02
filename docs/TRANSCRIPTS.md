# YouTube transcript ingestion

When a user adds **link** evidence with a YouTube URL, the app can fetch the video transcript and store it so the 4-layer assessment questions are grounded in the actual video content.

## Built-in route

The app includes **POST /api/youtube-transcript**, which:

- Accepts JSON body: `{ "url": "https://www.youtube.com/watch?v=..." }`
- Validates that the URL is a YouTube video (youtube.com or youtu.be)
- Uses the `youtube-transcript` npm package to fetch the transcript
- Returns `{ "text": "..." }` (plain text, segments joined)

If **YOUTUBE_TRANSCRIPT_API_KEY** is set, the route requires **Authorization: Bearer &lt;YOUTUBE_TRANSCRIPT_API_KEY&gt;** on the request; otherwise the route is open (same-origin only in practice, since it’s called server-side from evidence/add).

## How the app uses it

- **lib/videoTranscript.ts** calls this API when saving link evidence:
  - If **YOUTUBE_TRANSCRIPT_API_URL** is set → uses that URL (e.g. an external transcript API).
  - If unset → uses the **built-in route**:
    - On **Vercel**: `https://${VERCEL_URL}/api/youtube-transcript`
    - **Local dev**: `http://localhost:3001/api/youtube-transcript`
- The response `text` is stored in **evidence.transcript** and passed into question generation.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| **YOUTUBE_TRANSCRIPT_API_URL** | No | Override the transcript endpoint. If unset, the app uses its own **/api/youtube-transcript** (see above). Set this only if you use an external transcript API. |
| **YOUTUBE_TRANSCRIPT_API_KEY** | No | If set, **POST /api/youtube-transcript** requires `Authorization: Bearer <this value>`. Use a long random secret so only your server can call the route. |

### Setting them

- **Local:** Add to `.env.local`:
  - To use the built-in route only: leave both unset (or set `YOUTUBE_TRANSCRIPT_API_URL=` to empty).
  - To protect the route: set `YOUTUBE_TRANSCRIPT_API_KEY=your-secret` (and the server will send it when calling the route; see lib/videoTranscript.ts).
- **Vercel:** Project → Settings → Environment Variables:
  - Optional: `YOUTUBE_TRANSCRIPT_API_KEY` (e.g. a random string) if you want to lock the route to Bearer auth.
  - Leave `YOUTUBE_TRANSCRIPT_API_URL` unset to use the built-in route at `https://<your-domain>/api/youtube-transcript`.

No env vars are required for transcript ingestion when using the built-in route; only install the app and (on Vercel) the built-in URL is used automatically.
