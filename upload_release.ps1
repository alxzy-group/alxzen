param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.3.1"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.3.1 - Full-Width Console Telemetry Bento & Complete Admin Room Redesign

- **Fixed Client Server Console Layout (`ServerConsoleContainer.tsx`, `ServerDetailsBlock.tsx`, `StatBlock.tsx`):**
  - Replaced the squeezed 8/4 split (which left a 230px empty black gap below CPU Load and wrapped JSON logs) with an edge-to-edge **6-Card Horizontal Live Telemetry Bento Strip** (`Instance Uptime`, `CPU Load`, `Memory Usage`, `Disk Storage`, `Net Inbound`, `Net Outbound` with live progress bars) directly above the **100% Full-Width Terminal Console**.
- **Smart `STARTING` -> `ONLINE` Status Detection (`WebsocketHandler.tsx`, `ServerDetailsBlock.tsx`):**
  - Fixed Node.js / Python / Auto-Order bot servers staying stuck on `STARTING` when an Egg's startup regex does not match; the panel now automatically promotes status to `ONLINE` as soon as Wings reports active CPU, RAM, or Uptime telemetry.
- **Complete Admin Room Bento Redesign:**
  - Modernized all remaining Admin pages (`settings/mail`, `announcements`, `locations`, `databases`, `nests`, `mounts`, `users/new`, `users/view`, `servers/view`, and `servers/partials/navigation`) with Bento cards, icon headers, counter badges, and dark modals.
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
