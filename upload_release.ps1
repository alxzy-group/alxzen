param(
    [string]$token = $env:GITHUB_TOKEN
)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.1.53"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.53`n`n- 🔑 **Sub-Admin Application API (PTLA) Access & Scoped Protection:**`n  - **Enable Application API for All Admins:** Membuka menu Application API di sidebar admin untuk seluruh admin (`root_admin`), tidak lagi terbatas hanya pada Owner ID 1.`n  - **Scoped Protection Policy:** API Key yang dibuat oleh Sub-Admin (ID != 1) memiliki izin terproteksi: **hanya bisa Create Server** dan **Read-Only** ke fitur lainnya. Aksi **Delete Server**, **Delete Egg**, dan **Edit Egg** diblokir secara ketat di backend (`ApplicationApiRequest`).`n  - **Key Isolation & Privacy:** Sub-Admin hanya dapat melihat dan me-revoke API Key miliknya sendiri di halaman daftar kredensial, menjaga privasi token SuperAdmin (Owner).`n  - 🎨 **Modern High-End UI/UX:**`n    - Perombakan total halaman pembuatan API Key (`admin/api/new`) dengan segmented permission controls, quick preset buttons (Bot Server Creator, Read-Only All, None All), serta banner proteksi yang informatif.`n    - Desain ulang daftar kredensial (`admin/api/index`) dengan tombol copy 1-klik, badge status policy, dan tampilan glassmorphism modern."
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
