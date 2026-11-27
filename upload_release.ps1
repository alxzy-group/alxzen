param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.6.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.6.0 - Server Search Fix, Mobile Admin Scroll & "Admin Panel" Polish

- **Fixed Global & Dashboard Server Search (`SearchModal.tsx`, `DashboardContainer.tsx`, `MultiFieldServerFilter.php`):**
  - Rebuilt `SearchModal` without Formik input unmounting bugs: instant focus, `220ms` debounce, initial server list on open, and clean empty states.
  - Wired dashboard filter bar to backend `/api/client?filter[*]=...` (`280ms` debounce) + case-insensitive `LOWER(...)` search across server name, UUID, short ID, external ID, description, IP:port, and node name.
  - Simplified topbar search trigger (`SearchContainer.tsx`) into a compact `Ctrl+K` icon button.
- **Fixed Mobile Horizontal Table Scrolling & Renamed to "Admin Panel" (`layouts/admin.blade.php`, `admin/api/index.blade.php`, `NavigationBar.tsx`, `admin/index.blade.php`):**
  - Replaced `overflow: hidden` traps on `Application API` and added global `.table-responsive` / `.table-responsible` touch-scroll CSS across all Admin pages.
  - Renamed all `Control Plane` / `Command Center` references to `Admin Panel`.
  - Unified remaining Admin sub-pages (`nodes/view/index`, `nodes/view/servers`, `locations/view`, `databases/view`, `servers/view/database`, `servers/view/mounts`) with Obsidian + Electric Cyan cards, icons, and empty states.
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
