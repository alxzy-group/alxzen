$ErrorActionPreference = "Stop"
$Token = "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"
$env:GITHUB_TOKEN = $Token
$BashCmd = "$pwd\git_portable\bin\bash.exe"
Write-Host "Running release upload script..."
& $BashCmd "./upload_release.sh"

