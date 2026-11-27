param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.9.2"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.9.2 - Ubuntu 24.04 Fresh Installer & Private Repo Support

- **Ubuntu 24.04 Fresh VPS Compatibility (`setup.sh`):**
  - Added non-interactive `DEBIAN_FRONTEND=noninteractive` & `NEEDRESTART_MODE=a` flags, native `amd64`/`arm64` Wings binary detection, resilient PHP/Redis repo fallbacks, and explicit service enablement (`php8.3-fpm`, `redis-server`, `mariadb`, `nginx`).
- **Private GitHub Release Support (`setup.sh`):**
  - Added `download_panel_archive()` with `GITHUB_TOKEN` API asset lookup + `tar -tzf` integrity verification for both fresh installs and `[4] Update Panel`.
- **Installer Bug Fixes (`setup.sh`):**
  - Fixed PM2 port env injection for `dunia-alxzy`, preserved pre-bundled `vendor/`, removed slow `yarn install` on updates, auto-populated `HASHIDS_SALT`, and fixed undefined `print_error` / `${PURPLE}` bugs.
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
