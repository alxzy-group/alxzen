param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.9.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.9.0 - Per-Admin Creation Quotas & Dashboard Controls

- **Per-Admin Creation Limits (`AdminQuotaService`, `2026_11_27_000000_add_admin_creation_quotas.php`):**
  - Restricts sub-admins (`id !== 1`) across both Web Admin Panel and Application API (`POST /api/application/servers`) by Max Servers, Max RAM (MiB), Max Disk (MiB), and Max CPU (%).
  - Blocks quota bypass via post-creation Build modifications (`ServersController::updateBuild`, `ServerDetailsController::build`).
- **Admin Dashboard Quota Control Center (`admin/index.blade.php`, `AdminQuotaController`, `admin/users/view.blade.php`):**
  - Super Admin (ID 1) can view real-time quota usage and adjust every sub-admin's creation limits inline directly from `/admin` or `/admin/users/view/{id}` (blank = Unlimited, `0` = Blocked).
  - Displays live remaining quota status to sub-admins on `/admin` and `/admin/servers/new`.
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
