param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.11.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.11.0 - Real-Time Node RAM, Disk & CPU Telemetry Dashboard

- **Live Wings Telemetry (`NodeSystemUsageController.php`):**
  - Aggregates real active RAM (`memory_bytes`), real Disk (`disk_bytes`), live CPU (`cpu_absolute`), Network RX/TX, Docker engine stats, and top container resource consumers directly from Wings (`/api/system?v=2` + `/api/servers/{uuid}` via concurrent pool).
- **Complete Node Overview Redesign (`resources/views/admin/nodes/view/index.blade.php`):**
  - Replaces static Allocated-only gauges with live 5s Real Memory Used, Real Disk Used, and Live CPU/Network doughnut charts + KPI strip + Remaining Real Free RAM/Disk cards, per-server live usage breakdown table, and complete System & Daemon info.
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