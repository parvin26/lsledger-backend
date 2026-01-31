# Lighthouse Ledger Backend End-to-End Test Script
# Tests the full happy path: create entry -> add evidence -> save intent -> AI analyze -> generate questions -> AI evaluate -> verify
# Fails hard with exit 1 if any step fails. Prints status code and response body on HTTP errors.

$ErrorActionPreference = 'Stop'

# Get base URL (should be your local Next.js server, NOT Supabase)
Write-Host "`nNOTE: Enter your LOCAL Next.js server URL (e.g., http://localhost:3001)" -ForegroundColor Yellow
Write-Host "      This should NOT be your Supabase URL!" -ForegroundColor Yellow
Write-Host "      Make sure you type the FULL port number (3001, not 300)" -ForegroundColor Yellow
$baseUrlInput = Read-Host "`nEnter base URL (default: http://localhost:3001)"
$BASE_URL = if ([string]::IsNullOrWhiteSpace($baseUrlInput)) { "http://localhost:3001" } else { $baseUrlInput.Trim() }

# Validate URL format
if (-not $BASE_URL -match '^https?://') {
    Write-Host "`nERROR: URL must start with http:// or https://. You entered: $BASE_URL" -ForegroundColor Red
    exit 1
}

# Get Supabase access token
Write-Host "`nNOTE: You need a valid Supabase AUTH token (not the service role key)" -ForegroundColor Yellow
Write-Host "      Get it from: Supabase Dashboard > Authentication > Users > [Your User] > Access Token" -ForegroundColor Yellow
Write-Host "      OR from your frontend app after user login" -ForegroundColor Yellow
$TOKEN = Read-Host "`nEnter Supabase access token" -AsSecureString
$TOKEN_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($TOKEN)
)

# Sanitize token: strip all whitespace and any character that is not valid in a JWT (A-Za-z0-9_-.)
$TOKEN_PLAIN = ($TOKEN_PLAIN -replace '\s+', '') -replace '[^A-Za-z0-9_\-.]', ''

if ([string]::IsNullOrWhiteSpace($TOKEN_PLAIN)) {
    Write-Host "`nERROR: Token is empty after sanitization" -ForegroundColor Red
    exit 1
}

# Validate token starts with eyJ (JWT header)
if (-not $TOKEN_PLAIN.StartsWith('eyJ')) {
    Write-Host "`nERROR: Token must be a JWT and start with 'eyJ'. Got start: $($TOKEN_PLAIN.Substring(0, [Math]::Min(10, $TOKEN_PLAIN.Length)))..." -ForegroundColor Red
    exit 1
}

# Headers for all requests
$headers = @{
    "Authorization" = "Bearer $TOKEN_PLAIN"
    "Content-Type"  = "application/json"
}

# Helper: run HTTP request and fail hard on non-success. Returns parsed JSON body on success.
function Invoke-ApiCall {
    param(
        [string]$StepName,
        [string]$Method,
        [string]$Uri,
        [string]$Body = $null
    )
    try {
        $params = @{
            Uri     = $Uri
            Method  = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        if ($Body) { $params.Body = $Body }
        $response = Invoke-WebRequest @params
        if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
            Write-Host "`nERROR in $StepName" -ForegroundColor Red
            Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Red
            Write-Host "Response Body: $($response.Content)" -ForegroundColor Red
            exit 1
        }
        if ([string]::IsNullOrWhiteSpace($response.Content)) { return $null }
        return $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "`nERROR in $StepName" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response Body: $responseBody" -ForegroundColor Red
                $reader.Close()
            } catch { Write-Host "Response Body: (unable to read)" -ForegroundColor Red }
        } else {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        exit 1
    }
}

# Step A: Create entry
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP A: Create entry" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyA = @{ title = "Test Learning Entry"; description = "End-to-end test entry" } | ConvertTo-Json
$response = Invoke-ApiCall -StepName "STEP A: Create entry" -Method POST -Uri "$BASE_URL/api/entry/create" -Body $bodyA
$ENTRY_ID = $response.entry_id
Write-Host "[OK] Entry created successfully" -ForegroundColor Green
Write-Host "  Entry ID: $ENTRY_ID" -ForegroundColor Yellow

# Step B: Add evidence as text
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP B: Add evidence" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyB = @{ entry_id = $ENTRY_ID; evidence_type = "text"; content = "I learned how to build a Next.js API route with strict JSON parsing and Zod validation." } | ConvertTo-Json
$response = Invoke-ApiCall -StepName "STEP B: Add evidence" -Method POST -Uri "$BASE_URL/api/evidence/add" -Body $bodyB
Write-Host "[OK] Evidence added successfully" -ForegroundColor Green
Write-Host "  Evidence ID: $($response.evidence_id)" -ForegroundColor Yellow

# Step C: Save intent
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP C: Save intent" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyC = @{ entry_id = $ENTRY_ID; intent_prompt = "Learning for a project. Applied it in practice. Learn how to do something. Validate experience later." } | ConvertTo-Json
$response = Invoke-ApiCall -StepName "STEP C: Save intent" -Method POST -Uri "$BASE_URL/api/intent/save" -Body $bodyC
Write-Host "[OK] Intent saved successfully" -ForegroundColor Green
Write-Host "  Success: $($response.success)" -ForegroundColor Yellow

# Step D: AI analyze
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP D: AI analyze" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyD = @{ entry_id = $ENTRY_ID } | ConvertTo-Json
$response = Invoke-ApiCall -StepName "STEP D: AI analyze" -Method POST -Uri "$BASE_URL/api/ai/analyze" -Body $bodyD
Write-Host "[OK] Analysis completed" -ForegroundColor Green
Write-Host "  Primary Domain: $($response.primary_domain)" -ForegroundColor Yellow
Write-Host "  Eligible: $($response.eligible)" -ForegroundColor Yellow
Write-Host "  Evaluator Lens: $($response.evaluator_lens)" -ForegroundColor Yellow

if (-not $response.eligible) {
    Write-Host "`nERROR: Evidence is not eligible for assessment. Eligibility Reason: $($response.eligibility_reason)" -ForegroundColor Red
    exit 1
}

# Step E: Generate questions
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP E: Generate questions" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyE = @{ entry_id = $ENTRY_ID } | ConvertTo-Json
$response = Invoke-ApiCall -StepName "STEP E: Generate questions" -Method POST -Uri "$BASE_URL/api/ai/questions" -Body $bodyE
Write-Host "[OK] Questions generated successfully" -ForegroundColor Green
Write-Host "`nQuestions:" -ForegroundColor Yellow
Write-Host "  1. $($response.q1)" -ForegroundColor White
Write-Host "  2. $($response.q2)" -ForegroundColor White
Write-Host "  3. $($response.q3)" -ForegroundColor White
Write-Host "  4. $($response.q4)" -ForegroundColor White

# Step F: AI evaluate
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "STEP F: AI evaluate" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$bodyF = @{
    entry_id = $ENTRY_ID
    answers  = @(
        @{ questionNumber = 1; answer = "I used the evidence to design the route handler and validated inputs with Zod to prevent malformed requests." },
        @{ questionNumber = 2; answer = "With limited time I would keep only the strict JSON parser and a minimal schema, then add advanced checks later." },
        @{ questionNumber = 3; answer = "If the endpoint must support multiple evidence types, I would normalize inputs first and run the same prompt pipeline." },
        @{ questionNumber = 4; answer = "I am still unsure about rate limiting and would need to learn best practices for abuse prevention." }
    )
} | ConvertTo-Json -Depth 10
$response = Invoke-ApiCall -StepName "STEP F: AI evaluate" -Method POST -Uri "$BASE_URL/api/ai/evaluate" -Body $bodyF
Write-Host "[OK] Evaluation completed" -ForegroundColor Green
Write-Host "  Confidence Band: $($response.confidence_band)" -ForegroundColor Yellow
Write-Host "  Capability Summary: $($response.capability_summary)" -ForegroundColor Yellow

$PUBLIC_ID = $null
if ($response.public_id) {
    $PUBLIC_ID = $response.public_id
    Write-Host "  Public ID: $PUBLIC_ID" -ForegroundColor Green
} else {
    Write-Host "`nWARNING: Verification was not issued (confidence band: $($response.confidence_band)). Only Medium or High receive verification records." -ForegroundColor Yellow
}

# Step G: Verify public JSON (if public_id exists)
if ($PUBLIC_ID) {
    Write-Host "`n===============================================================" -ForegroundColor Cyan
    Write-Host "STEP G: Verify public JSON" -ForegroundColor Cyan
    Write-Host "===============================================================" -ForegroundColor Cyan

    $response = Invoke-ApiCall -StepName "STEP G: Verify public JSON" -Method GET -Uri "$BASE_URL/api/verify/$PUBLIC_ID"
    Write-Host "[OK] Verification record retrieved" -ForegroundColor Green
    Write-Host "`nVerification Details:" -ForegroundColor Yellow
    Write-Host "  Public ID: $($response.public_id)" -ForegroundColor White
    Write-Host "  Domain: $($response.domain)" -ForegroundColor White
    Write-Host "  Confidence Band: $($response.confidenceBand)" -ForegroundColor White
    Write-Host "  Capability Summary: $($response.capabilitySummary)" -ForegroundColor White
    Write-Host "  Created At: $($response.created_at)" -ForegroundColor White
    if ($response.intent_prompt) { Write-Host "  Intent Prompt: $($response.intent_prompt)" -ForegroundColor White }
} else {
    Write-Host "`nSkipping Step G: No public_id available" -ForegroundColor Yellow
}

# Only print success when we reached the end without exiting
Write-Host "`n===============================================================" -ForegroundColor Green
Write-Host "All tests completed successfully." -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
