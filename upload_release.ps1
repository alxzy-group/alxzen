[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$token = "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"
$tag = "v4.1.44"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.44`n`n- 🎮 **Dunia Alxzy 3D Overhaul:**`n  - Fixed T-pose / 'salip' animation glitch when stopping movement with smooth cross-fading.`n  - Added Jump feature (Spacebar on PC, on-screen JUMP button on Mobile) with realistic gravity physics and multiplayer vertical sync.`n  - Added sliding wall collision system (anti-tembus) so characters cannot walk through buildings, deep lakes, or central monuments.`n  - Overhauled town architecture with Alxzy Tower HQ, Server Lab, Cyber Cafe, Tech Store, streetlights, curbs, and animated central fountain.`n- 🛡️ **Security & Admin:** Root Admin creation restricted to Super Admin (User ID 1)."
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
