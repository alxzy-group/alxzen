[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
param(
    [string]$token = $env:GITHUB_TOKEN
)
if (-not $token) {
    Write-Error "Please provide GitHub Token via -token or GITHUB_TOKEN environment variable."
    exit 1
}
$tag = "v4.1.52"
$repo = "alxzy-group/alxzen"
$releaseData = @{
    tag_name = $tag
    name = $tag
    body = "### AlxZen Panel v4.1.52`n`n- 🥚 **Fix Egg Import Error 500 & Author Validation:**`n  - **Support Non-Email Authors:** Mengubah validasi author egg di `Egg.php` dari `required|string|email` menjadi `required|string|max:191`. Kini egg kustom dengan username author (seperti `zanspiw`, `parkervcp`, `pelican`) dapat diimpor tanpa memicu DataValidationException HTTP 500.`n  - **Safe Author Fallback:** Menambahkan fallback otomatis author jika kosong pada saat import egg baru.`n  - **Sanitize & Cast Egg Variables:** Memastikan seluruh variabel egg disaring hanya kolom database yang valid, serta casting `default_value` dan `description` sebagai nullable string agar tidak error pada tipe non-string (seperti integer default value).`n  - **Graceful Error Handling:** Menambahkan try-catch di `EggShareController` agar jika ada egg yang tidak valid, panel menampilkan notifikasi alert yang jelas di UI admin alih-alih error 500 putih."
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
