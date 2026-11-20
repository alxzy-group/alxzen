param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.1.56"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.56`n`n- ⚡ **Major UI/UX Performance & Anti-Lag Optimization:**`n  - **Eliminated Cascading Backdrop-Filter Blurs:** Removed heavy `backdrop-filter: blur(...)` from repeating list/grid components (`ServerRow` cards, file manager `.file_row`, `GreyRowBox`, `StatBlock`, `ChartBlock`, `AnnounceBar`, `SubNavigation`, and modal/dropdown elements). Overlapping multi-pass Gaussian blurs were exhausting GPU fill-rate and dropping frame rates down to 10-15 FPS.`n  - **Hardware-Accelerated Server Cards:** Refactored `ServerRow.tsx` from `framer-motion` to pure CSS GPU-composited layers (`transform: translateZ(0)`, `will-change: transform`). Hover glow is now 100% CSS-driven with zero React state re-renders.`n  - **CSS Hardware-Accelerated Progress Bars:** Replaced 3 concurrent Framer Motion JavaScript RAF loops per server card with CSS width transitions (`transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1)`), eliminating up to 30 JS animation loops running simultaneously.`n  - **Optimized Background Engine & tsParticles:** Set `pointer-events: none` on `#tsparticles-bg` so it never intercepts mouse events or clicks. Disabled expensive Euclidean distance calculations on mouse hover (`onHover: { enable: false }`), capped FPS to 30, and disabled retina canvas upscaling to stop mousemove stuttering.`n  - **Lightweight Grid Entrance:** Replaced Framer Motion staggered scale/x-translation loops on DashboardContainer with compositor-scheduled CSS animations.`n  - **Universal Performance & Reduced Motion:** Added smooth scrolling, text rendering speed optimization, and `prefers-reduced-motion` support in global stylesheet."
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
