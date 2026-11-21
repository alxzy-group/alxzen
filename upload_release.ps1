param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.3.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.3.0 - Next-Gen Cloud Platform UI/UX Architecture

- **Next-Gen SaaS Admin Control Plane (No Longer Stock AdminLTE Look):**
  - **Flattened Cloud Command Sidebar (`layouts/admin.blade.php`):** Removed old collapsible treeviews in favor of direct 1-click categorized navigation (`COMMAND CENTER`, `CLOUD FLEET & USERS`, `INFRASTRUCTURE`, `RUNTIME & EGGS`) with live database count badges and modern topbar pills.
  - **Cloud Command Center Overview (`admin/index.blade.php`):** Added hero operational banner, 4 live KPI telemetry cards (Total Servers, Registered Accounts, Wings Daemon Nodes, Runtime Eggs), Recently Deployed Servers table, and Security Engine status panel.
  - **Bento Settings & Interactive 2FA Cards (`admin/settings/index.blade.php` & `advanced.blade.php`):** Replaced old Bootstrap 3 `.btn-group` and flat forms with 12-column Bento Feature Cards, segmented pill tabs, and an interactive 3-card Zero-Trust 2FA selector.

- **Next-Gen Client Cloud Cockpit & 1-Click Server Dock:**
  - **Persistent 1-Click Server Command Dock (`ServerRouter.tsx`):** Added horizontal sticky pill navigation dock with icons across `/server/:id/*` for instant 1-click switching between Console, Files, Databases, Network, Subdomain, Backups, Startup, and Settings.
  - **Asymmetric 12-Column Console Cockpit (`ServerConsoleContainer.tsx` & `ServerDetailsBlock.tsx`):** Side-by-side Terminal Console (`xl:col-span-8`) and Live Telemetry Bento Dock with progress bars (`xl:col-span-4`).
  - **Bento Instance Cards (`ServerRow.tsx` & `DashboardContainer.tsx`):** Added Cloud Workspace fleet counter pills and instance card footer action strip (`ID · Open Console`).
'@
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = $bodyText
} | ConvertTo-Json

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
Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{ Authorization = "token $token"; "User-Agent" = "PowerShell"; "Content-Type" = "application/gzip" } -InFile "panel.tar.gz" -TimeoutSec 1200

Write-Host "Release $tag created and panel.tar.gz uploaded successfully!" -ForegroundColor Green
