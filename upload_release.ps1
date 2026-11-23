param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.5.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.5.0 - Cloud-Native UI/UX Enhancement (Ultra-Lightweight 60fps)

- **Dashboard Command Toolbar & Grid/List ServerRow (`DashboardContainer.tsx`, `ServerRow.tsx`):**
  - Added instant client-side server filter, persisted Grid / Compact List view toggle, and Streamer IP Privacy Mask toggle (`Hide IP`).
  - Added 1-click Quick Files shortcut buttons, percentage usage labels next to limits, subtle CSS pulse status dots, and lightweight CSS transitions (zero Framer Motion loops).
- **Enhanced Terminal Console & Telemetry Charts (`Console.tsx`, `StatGraphs.tsx`, `chart.ts`):**
  - Added 1-click Search Logs (`Ctrl+F`), Expand/Compact terminal height toggle, and command input history hint (`History / Enter`).
  - Refined Network I/O badges and charts to Electric Cyan (Inbound) and Emerald (Outbound) with ultra-clean gridlines.
- **Enhanced File Manager & Startup (`FileManagerContainer.tsx`, `FileObjectRow.tsx`, `StartupContainer.tsx`, `VariableBox.tsx`):**
  - Added instant directory file filtering, Sort selector (`Name / Size / Modified`), tinted rounded-xl file/folder icon badges, 1-click Copy Startup Command button, and Environment Variable search filter.
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
