param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.10.0"
$repo = "alxzy-group/alxzen"
$bodyText = @'
### AlxZen Panel v4.10.0 - Flagship Split-Layout Auth UI & Nginx/PHP-FPM Hardening

- **Split-Layout Auth & Login Redesign (`LoginFormContainer`, `Login`, `ForgotPassword`, `ResetPassword`, `LoginCheckpoint`):**
  - Replaced the narrow card and stock Pterodactyl bird with a sleek two-column Cloud Platform authentication workspace on desktop and a crisp responsive layout on mobile (zero heavy GPU blur).
  - Added icon-prefixed inputs, fixed vertical centering of Show/Hide password toggles, moved Forgot Password inline beside the Password label, and removed the redundant `xl:pt-32` top offset.
- **Nginx & PHP-FPM Reliability (`setup.sh`):**
  - Switched Nginx `SCRIPT_FILENAME` to `$realpath_root$fastcgi_script_name`, verified `public/index.php` presence during extract/update, enforced `755` directory traversal permissions, and restarted `php8.3-fpm` to prevent PHP-FPM `File not found.` (`Primary script unknown`) issues.
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