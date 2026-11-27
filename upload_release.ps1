param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.8.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.8.0 - Deep API Hardening, Dunia Alxzy Code-Splitting & Performance Polish

- **Deep Application API & Network Hardening:**
  - Restricted `NodeConfigurationController` (Wings daemon config/token) and write/delete endpoints on `NodeController`, `AllocationController`, and `LocationController` to Super Admin (ID 1).
  - Enforced server ownership / ID 1 Anti-Intip checks across `Application\Servers\DatabaseController`.
  - Added Panel-side SSRF protection on remote file Pull URLs (`PullFileRequest`) and upgraded security headers (`SetSecurityHeaders`).
- **Frontend Code-Splitting, Auth Fixes & Lightweight Rendering:**
  - Split `DuniaAlxzyOverlay` (Three.js/WebGL) into an on-demand lazy chunk (`React.lazy`) to shrink the initial Dashboard bundle.
  - Optimized `BackgroundEngine` (`localforage` loaded only for video mode) and removed heavy `backdrop-filter` / `filter: blur(40px)` on Auth cards.
  - Added Show/Hide Password toggle on Login, fixed flex form bugs & missing 2FA label on Forgot/Reset/Checkpoint screens, and persisted announcement dismissals to DB (`markAnnouncementRead`).
- **Backend & Admin Performance:**
  - Switched `CheckServerExpirations` to `chunkById(50)` and added 30s cache to Admin sidebar counters and Overview KPI counts.
'@
$releaseData = [System.Text.Encoding]::UTF8.GetBytes((@{
    tag_name = $tag
    name = $tag
    body = $bodyText
} | ConvertTo-Json))

Write-Host "Fetching or Creating GitHub Release $tag..." -ForegroundColor Yellow
$headers = @{ 
    Authorization = "token $token"
    "User-Agent" = "PowerShell"
}
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers $headers -Body $releaseData -ContentType "application/json"
} catch {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/tags/$tag" -Method Get -Headers $headers
}

if ($response.assets) {
    foreach ($asset in $response.assets) {
        if ($asset.name -eq "panel.tar.gz") {
            Write-Host "Deleting old panel.tar.gz asset ($($asset.id))..." -ForegroundColor Yellow
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/assets/$($asset.id)" -Method Delete -Headers $headers
        }
    }
}

$uploadUrl = $response.upload_url -replace '\{.*\}', '?name=panel.tar.gz'

Write-Host "Uploading panel.tar.gz ($([math]::Round((Get-Item 'panel.tar.gz').Length / 1MB, 2)) MB) to Release $tag..." -ForegroundColor Yellow
$assetResponse = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{ Authorization = "token $token"; "User-Agent" = "PowerShell"; "Content-Type" = "application/gzip" } -InFile "panel.tar.gz" -TimeoutSec 1200

Write-Host "Release $tag created and panel.tar.gz uploaded successfully! Asset ID: $($assetResponse.id)" -ForegroundColor Green
