[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = "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"
$tag = "v4.1.40"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.40`n`n- Server List: Added expiration time display to the server cards (e.g. 'Expires in 5 days' or 'Expired') right next to the IP and Port."
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
