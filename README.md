# Lighthouse Ledger Backend

Backend API and public verification pages for Lighthouse Ledger - a learning record and review system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (e.g. `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
AI_API_KEY=your_ai_api_key
AI_MODEL_NAME=gpt-4
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
   `NEXT_PUBLIC_API_BASE_URL` is used by the frontend for all API calls; it defaults to `http://localhost:3001` if unset.

   **Guest mode (V1 testing):** When `GUEST_MODE_ENABLED` is `true` in `lib/featureFlags.ts`, the app treats all visitors as signed in. No Authorization header is required for API calls; the server uses a single guest user for all guest traffic.
   - **`GUEST_USER_ID`** (server, required for guest mode): A valid Supabase user UUID. All guest requests are attributed to this user (e.g. create entry, add evidence). Create a dedicated user in Supabase Auth or use an existing test user and set its UUID here. Without this, protected API calls in guest mode return 503 with "Guest mode is not configured."
   - **`NEXT_PUBLIC_TEST_ACCESS_TOKEN`** (optional): If set, the frontend sends this as the Bearer token when the user has no session (e.g. guest). The server still accepts requests with no header in guest mode and uses `GUEST_USER_ID`. Sign-in is still available at `/login` but not required in guest mode.

3. Run database migrations:
   - Execute `supabase/schema.sql` in your Supabase SQL editor

4. Run the development server:
```bash
npm run dev
```
   The server uses port **3001** by default. To run on a different port (e.g. 3002), set `PORT`:
   - **Windows (PowerShell):** `$env:PORT=3002; npm run dev`
   - **Windows (CMD):** `set PORT=3002 && npm run dev`
   - **macOS/Linux:** `PORT=3002 npm run dev`

## API Endpoints

All POST endpoints require `Authorization: Bearer <token>` header with a valid Supabase auth token.

### Entry Management
- `POST /api/entry/create` - Create a new learning entry
- `POST /api/evidence/add` - Add evidence to an entry
- `POST /api/intent/save` - Save intent prompt for an entry

### AI Processing
- `POST /api/ai/analyze` - Analyze evidence and classify domain/eligibility
- `POST /api/ai/questions` - Generate four assessment questions
- `POST /api/ai/evaluate` - Evaluate answers and create verification (if Medium/High confidence)

### Health
- `GET /api/health` - Returns `{ ok: true, service: "lhledger-backend" }` for sanity checks

### Public Verification
- `GET /api/verify/[public_id]` - Get verification record as JSON
- `GET /verify/[public_id]` - View verification record page

## Local development + test flow

**Prerequisites:** Node, npm, Supabase project with anon key and service role key in `.env.local`.

1. **Start dev server on port 3001:**
   - `npm install`
   - `npm run dev` (Next.js at http://localhost:3001).

2. **Obtain a Supabase user access token:**
   - Either via frontend login, or by running the PowerShell snippet that calls `/auth/v1/token?grant_type=password` with the anon key.

3. **Run the local happy-path test script:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/test_local_flow.ps1
   ```
   - When prompted, base URL: `http://localhost:3001`
   - Paste the user `access_token` (JWT starting with `eyJ...`).
   - **Expected result:** all steps A–G report `[OK]` and the script ends with *All tests completed successfully.*

## Security

- All write operations verify user authentication
- All operations check entry ownership
- Evidence files are never exposed in public verification
- Service role key only used in server-side code

## Deployment

Code is deployed via Vercel. Any push to `main` triggers a new deployment on Vercel. Environment variables are managed in Vercel, not committed to git.
