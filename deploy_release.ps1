$ErrorActionPreference = "Stop"

$Token = "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"
$env:GITHUB_TOKEN = $Token

$ExtractPath = "git_portable"
$env:Path = "$pwd\$ExtractPath\cmd;" + $env:Path
$BashCmd = "$pwd\$ExtractPath\bin\bash.exe"

$env:GIT_TERMINAL_PROMPT="0"
$env:GCM_INTERACTIVE="false"
$env:GIT_ASKPASS="echo"

Write-Host "Adding ignored public/assets..."
git add -f public/assets/

Write-Host "Amending commit..."
git commit --amend --no-edit

Write-Host "Pushing to GitHub..."
$RepoUrl = "https://x-access-token:$Token@github.com/alxzy-group/alxzen.git"
git -c core.askPass="" push $RepoUrl HEAD:main

Write-Host "Running release upload script..."
& $BashCmd "./upload_release.sh"

Write-Host "All steps complete!"
