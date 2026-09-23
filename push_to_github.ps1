$ErrorActionPreference = "Stop"

$ExtractPath = "git_portable"
$GitCmd = "$pwd\$ExtractPath\bin\git.exe"

$env:Path = "$pwd\$ExtractPath\cmd;" + $env:Path

Write-Host "Configuring Git safe directory..."
git config --global --add safe.directory D:/alxzen

Write-Host "Configuring Git user..."
git config --global user.name "Alxzen AI"
git config --global user.email "ai@alxzen.local"

Write-Host "Staging changes..."
git add -A

Write-Host "Committing..."
    git commit -m "feat: Add Subdomain Manager, Auto-Proxy, and patch suspended server bypass"

Write-Host "Pushing to GitHub..."
$Token = "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"
$RepoUrl = "https://x-access-token:$Token@github.com/alxzy-group/alxzen.git"

git push $RepoUrl HEAD:main

Write-Host "Push complete!"
