[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = "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"
$tag = "v4.1.42"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.42`n`n- Fix: Added `domain_limit` to `ServersController::updateBuild` request handler so saving Build Configuration properly persists the Domain Limit.`n- Enhanced: Enforced `domain_limit` on Subdomain creation API and UI.`n- Fix: Safe migration check for `domain_limit` column."
} | ConvertTo-Json

Write-Host "Fetching or Creating GitHub Release $tag..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases" -Method Post -Headers @{ Authorization = "token $token" } -Body $releaseData -ContentType "application/json"
} catch {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/releases/tags/$tag" -Method Get -Headers @{ Authorization = "token $token" }
}

$uploadUrl = $response.upload_url -replace '\{.*\}', '?name=panel.tar.gz'

Write-Host "Uploading panel.tar.gz to Release..." -ForegroundColor Yellow
Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers @{ Authorization = "token $token"; "Content-Type" = "application/gzip" } -InFile "panel.tar.gz" -TimeoutSec 600

Write-Host "Release $tag created and uploaded successfully!" -ForegroundColor Green
