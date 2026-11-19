param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.1.55"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.55`n`n- 🤖 **Bot Auto-Order & User Creation Fix (cpanel alxzy & Telegram/Discord bots):**`n  - **Sub-Admin API User Provisioning:** Allowed `r_users` write access for Sub-Admin PTLA keys (`POST /api/application/users`) so automated deployment scripts can register client accounts before deploying servers.`n  - **Backward-Compatible Token Policy:** Automatically permits `POST /api/application/users` and rollback `DELETE /api/application/users/{id}` for existing Sub-Admin PTLA keys that already hold `r_servers` write permission. Existing bot configurations do not need to be regenerated or reconfigured.`n  - **Security Safeguards Preserved:** Sub-admins are strictly prohibited from creating accounts with `root_admin = true`, cannot delete or edit Super Admin (ID 1), cannot delete other administrators, cannot delete servers, cannot delete or edit eggs, and cannot peek at other users' servers.`n  - **UI/UX Preset Enhancement:** Updated Server Bot Preset in the Admin API dashboard to enable Create User and Create Server while keeping other sensitive resources read-only."
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
