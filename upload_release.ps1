[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = "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"
$tag = "v4.1.46"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.46`n`n- 🎮 **Dunia Alxzy 3D Camera Fix (RE4 Remake Style):**`n  - Fixed inverted vertical camera pitch: dragging mouse up now looks up to the sky, and dragging down looks down to the ground naturally.`n  - Fixed camera lag & floatiness: eliminated lerp latency for instantaneous, tight, 1:1 camera tracking matching Resident Evil 4 Remake.`n  - Calibrated true Over-The-Shoulder framing (tight 2.5m orbit, 0.65m right shoulder shift, keeping character naturally in the left third of the view)."
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
