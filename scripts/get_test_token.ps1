# Helper script to get a Supabase user authentication token for testing
# This signs in an existing user and gets their access token

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Supabase Test User Token Generator" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Get Supabase URL
$SupabaseUrl = Read-Host "Enter your Supabase URL (e.g., https://ukhaafefmhadggcbgnew.supabase.co)"

# Get Supabase Anon Key
Write-Host ""
Write-Host "NOTE: Use your PUBLISHABLE/ANON key from the API Keys page" -ForegroundColor Yellow
$SupabaseAnonKey = Read-Host "Enter your Supabase Anon/Publishable Key"

# Get email and password
Write-Host ""
$Email = Read-Host "Enter email for test user"
$Password = Read-Host "Enter password for test user" -AsSecureString
$PasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
)

Write-Host ""
Write-Host "Attempting to sign in user..." -ForegroundColor Yellow

try {
    $signInBody = @{
        email = $Email
        password = $PasswordPlain
    } | ConvertTo-Json

    # Headers for Supabase Auth API
    $headers = @{
        "apikey" = $SupabaseAnonKey
        "Content-Type" = "application/json"
        "X-Client-Info" = "supabase-ps1-script"
    }
    
    # If the key looks like a JWT (starts with eyJ), it might be a legacy key
    # Try using it as both apikey and Authorization header
    if ($SupabaseAnonKey -match '^eyJ') {
        Write-Host "WARNING: Detected JWT format key. Make sure you're using the PUBLISHABLE key, not the legacy anon key." -ForegroundColor Yellow
    }

    # Try the new Supabase Auth API endpoint
    $authEndpoint = "$SupabaseUrl/auth/v1/token?grant_type=password"
    $signInResponse = Invoke-RestMethod -Uri $authEndpoint -Method POST -Headers $headers -Body $signInBody
    
    if ($signInResponse.access_token) {
        Write-Host ""
        Write-Host "SUCCESS: User signed in successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "===============================================================" -ForegroundColor Green
        Write-Host "ACCESS TOKEN (use this in the test script):" -ForegroundColor Green
        Write-Host "===============================================================" -ForegroundColor Green
        Write-Host $signInResponse.access_token -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Copy this token and use it when running the test script." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "ERROR: No access token in response" -ForegroundColor Red
        Write-Host "Response: $($signInResponse | ConvertTo-Json)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Could not sign in user" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
            $reader.Close()
            $stream.Close()
            
            # Try to parse as JSON for better error message
            try {
                $errorJson = $responseBody | ConvertFrom-Json
                if ($errorJson.error_description) {
                    Write-Host "Error Description: $($errorJson.error_description)" -ForegroundColor Red
                }
                if ($errorJson.msg) {
                    Write-Host "Message: $($errorJson.msg)" -ForegroundColor Red
                }
            } catch {
                # Not JSON, that's okay
            }
        } catch {
            Write-Host "Could not read error response: $_" -ForegroundColor Red
        }
    }
    exit 1
}
