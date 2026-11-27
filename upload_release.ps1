param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.10.1"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.10.1 - Pre-Flight Upload Size Guard & 1024MB Defaults

- **Instant Upload Size Guard (`FileUploadController`, `getFileUploadUrl`, `UploadButton`):**
  - Exposes the target node's `upload_limit_mb` before starting upload and extends signed Wings upload JWT expiry from 15 minutes to 60 minutes.
  - Rejects oversized files immediately in the browser before wasting bandwidth/time uploading to Wings, and sets `timeout: 0` for large valid uploads.
- **Higher Defaults (`Node`, `MakeNodeCommand`, `setup.sh`):**
  - Sets default node `upload_size` and Nginx/PHP-FPM upload limits to `1024` MiB (`1024M`).
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