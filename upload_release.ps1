param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.2.0"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.2.0 — Industry-Standard UI/UX & Upstream Security Release`n`n- 🎨 **Unified Server Row & Console UI/UX Overhaul:**`n  - **Consistent 3-Column Server Cards (`ServerRow.tsx`):** Every server card now displays a uniform 3-column metric grid (CPU, RAM, Disk with allocated capacity limits and smooth hardware-accelerated progress bars) across all power states (`Online`, `Starting`, `Stopping`, `Offline`, `Suspended`) so dashboard grids align evenly.`n  - **One-Click IP:Port Copy Pill:** Added instant copy-to-clipboard with live checkmark feedback on both dashboard server cards and the console header.`n  - **Responsive Console Hero Header (`ServerConsoleContainer.tsx`):** Unified header card visible on both mobile and desktop with status badge, allocation copy badge, expiry badge, and tactile power controls.`n  - **Enhanced Terminal Toolbar (`Console.tsx`):** Added one-click `Clear` console button alongside `A-`, `A+`, and `Fit` controls.`n  - **Balanced 6-Column Telemetry Grid (`ServerDetailsBlock.tsx` & `StatBlock.tsx`):** Responsive 6-card grid (`Uptime`, `CPU Load`, `Memory`, `Disk Storage`, `Inbound`, `Outbound`) with `tabular-nums` and dynamic status icon coloring.`n`n- 🔘 **Industry-Standard Tactile Buttons & Responsive Admin Panel:**`n  - **Unified Client Button System (`Button.tsx`, `button/style.module.css`, `PowerButtons.tsx`):** Upgraded all legacy and modern buttons with 1px inner top highlights, tactile press feedback (`scale(0.98)`), sentence-case typography, and action icons (`Start`, `Restart`, `Stop`/`Kill`).`n  - **Global Admin Design System (`layouts/admin.blade.php` & `admin/index.blade.php`):** Fixed stylesheet load order so the dark precision design system overrides legacy AdminLTE/Pterodactyl styles across all rooms (Overview, Settings, Locations, Databases, Nodes, Nests, Mounts, Announcements, Users, Servers, Expiration), complete with mobile responsive headers and quick-access overview cards.`n`n- 🛡️ **Official Upstream Pterodactyl Security Patches (Backported up to v1.14.1):**`n  - **CVE-2026-86177 (High / CVSS 8.7):** Enforced action-specific permissions (`control.console`, `control.start`, `control.restart`, `control.stop`, `backup.create`) on schedule task creation and updates in `ScheduleTaskController.php` and `StoreTaskRequest.php`.`n  - **CVE-2026-35202:** Serialized concurrent database creation by locking the parent `Server` row (`lockForUpdate()`) inside the database creation transaction in `DatabaseController.php` and `DatabaseManagementService.php`.`n  - **CVE-2026-61609:** Scoped authentication and 2FA checkpoint rate-limiting per account/checkpoint token + IP in `AbstractLoginController.php` to prevent global panel lockouts."
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
