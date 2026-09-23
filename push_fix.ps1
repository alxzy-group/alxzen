$ErrorActionPreference = "Stop"

Write-Host "1/5 Mengembalikan commit lokal (Soft Reset)..."
git reset --soft origin/main 2>$null

Write-Host "2/5 Menghapus file-file raksasa dari antrean commit..."
git reset HEAD 2>$null

Write-Host "3/5 Memperbarui .gitignore agar file raksasa tidak ikut masuk lagi..."
$IgnoreList = @(
    "git_portable/"
    "node_standalone/"
    "*.zip"
    "*.tar.gz"
    "my_log.txt"
)
foreach ($item in $IgnoreList) {
    if (-not (Select-String -Path .gitignore -Pattern "^$([regex]::Escape($item))$" -Quiet -ErrorAction SilentlyContinue)) {
        Add-Content -Path .gitignore -Value $item
    }
}

Write-Host "4/5 Menyiapkan ulang file-file yang benar..."
git add -A

Write-Host "5/5 Melakukan Commit & Push menggunakan Token baru..."
git commit -m "feat: cumulative update (v4.1.0) and fix large files"
git remote set-url origin https://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@github.com/alxzy-group/alxzen.git
git push origin main

Write-Host "Selesai! Cek GitHub kamu sekarang."
