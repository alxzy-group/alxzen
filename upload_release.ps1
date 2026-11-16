param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.1.54"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.54`n`n- 🛡️ **Comprehensive OWASP Top 10 Security Patches:**`n  - **Fix BOLA / IDOR in Domain Management:** Enforce ownership validation (`server_id` match) and restrict subdomain management to server owner or Super Admin in `DomainController.php`.`n  - **Fix Broken Access Control in Server Expiration:** Restrict bulk deletion (`deleteAllExpired`) and manual extension (`update`) exclusively to Super Admin ID 1 in `ExpirationController.php`.`n  - **Fix Unauthenticated Info Disclosure in Public Domain Router:** Restrict `/api/public/resolve-domain` to authorized reverse proxies (`DOMAIN_ROUTER_KEY`) or local loopback proxy only.`n  - **Fix Stored XSS in Blade Templates:** Switched `{!! json_encode(...) !!}` to secure `@json(...)` in `wrapper.blade.php` to prevent script breakout injection.`n  - **Harden WebRTC Auto-Answer:** Enforce room peer validation and restrict microphone streams to active room participants in Dunia Alxzy.`n  - **Secure Cookie Default:** Automatically enforce HTTPS `secure` cookie flag when `APP_URL` starts with https in `config/session.php`.`n`n- 🔒 **Total Anti-Intip & Server Isolation (Endpoint Level):**`n  - **Client API & UI Isolation:** Sub-admins (ID != 1) can no longer list other users' servers using `?type=admin` or `?type=admin-all`. The frontend 'Admin View' switch is now strictly limited to Super Admin ID 1, and search only indexes accessible servers.`n  - **Client Server Access Control:** Patched `AuthenticateServerAccess` middleware and `ServerPolicy` so sub-admins cannot bypass server ownership or subuser permissions on any endpoint (Websocket, files, console, databases, power).`n  - **Application API Isolation:** `GET /api/application/servers` and server details are strictly scoped to the user's own servers for non-ID 1 API keys. Eager-loaded relationships (`users?include=servers`, `nodes?include=servers`, `eggs?include=servers`, etc.) are filtered to prevent indirect server leakage.`n  - **Admin Panel Isolation:** In `/admin/servers`, `/admin/servers/view/{id}/*`, and `/admin/expiration`, non-ID 1 admins can only see and manage servers they own. Sensitive node configuration (Wings daemon tokens) and all-server node listings are locked exclusively to Super Admin ID 1."
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

$uploadUrl = $response.upload_url -replace '\{.*\}', '?name=panel.tar.gz'

Write-Host "Uploading panel.tar.gz ($([math]::Round((Get-Item 'panel.tar.gz').Length / 1MB, 2)) MB) to Release $tag..." -ForegroundColor Yellow
Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{ Authorization = "token $token"; "User-Agent" = "PowerShell"; "Content-Type" = "application/gzip" } -InFile "panel.tar.gz" -TimeoutSec 1200

Write-Host "Release $tag created and panel.tar.gz uploaded successfully!" -ForegroundColor Green
