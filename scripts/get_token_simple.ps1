# Simple script to get a Supabase user token using curl (if available) or direct API call
# Alternative: Use Supabase Dashboard > Authentication > Users > [User] > Generate token

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "Get Supabase User Token - Simple Method" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1: Use Supabase Dashboard (Easiest)" -ForegroundColor Yellow
Write-Host "  1. Go to: Supabase Dashboard > Authentication > Users" -ForegroundColor White
Write-Host "  2. Click on your user (parvinjeet.kaur@gmail.com)" -ForegroundColor White
Write-Host "  3. Look for 'Access Token' or 'Generate Token' button" -ForegroundColor White
Write-Host "  4. Copy the token" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 2: Use this script with correct credentials" -ForegroundColor Yellow
Write-Host ""

$SupabaseUrl = Read-Host "Enter Supabase URL (e.g., https://ukhaafefmhadggcbgnew.supabase.co)"
$SupabaseKey = Read-Host "Enter PUBLISHABLE key (sb_publishable_... or eyJ... format)"
$Email = Read-Host "Enter user email"
$Password = Read-Host "Enter password" -AsSecureString
$PasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
)

# Try using the correct Supabase Auth API format
$body = @{
    email = $Email
    password = $PasswordPlain
} | ConvertTo-Json

$headers = @{
    "apikey" = $SupabaseKey
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Attempting sign in..." -ForegroundColor Yellow

try {
    # Use the signIn endpoint
    $response = Invoke-WebRequest -Uri "$SupabaseUrl/auth/v1/token?grant_type=password" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    $jsonResponse = $response.Content | ConvertFrom-Json
    
    if ($jsonResponse.access_token) {
        Write-Host ""
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "===============================================================" -ForegroundColor Green
        Write-Host "ACCESS TOKEN:" -ForegroundColor Green
        Write-Host $jsonResponse.access_token -ForegroundColor Yellow
        Write-Host "===============================================================" -ForegroundColor Green
    } else {
        Write-Host "ERROR: No access_token in response" -ForegroundColor Red
        Write-Host "Response: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Sign in failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Details: $errorBody" -ForegroundColor Red
        $reader.Close()
        $stream.Close()
    }
    
    Write-Host ""
    Write-Host "TIP: If this keeps failing, use OPTION 1 (Supabase Dashboard)" -ForegroundColor Yellow
    Write-Host "     Or check that:" -ForegroundColor Yellow
    Write-Host "     - Email/password are correct" -ForegroundColor Yellow
    Write-Host "     - You're using the PUBLISHABLE key (not service role)" -ForegroundColor Yellow
    Write-Host "     - Email provider is enabled in Supabase Auth settings" -ForegroundColor Yellow
}
