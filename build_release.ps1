# Build Script for Alxzen Panel Release
Write-Host "Alxzen Panel Release Builder" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Step 1: Install Dependencies
Write-Host "`n[1/3] Installing Yarn dependencies..." -ForegroundColor Yellow
# Fix Yarn on Windows for cross-platform scripts
yarn config set script-shell "d:\alxzen\git_portable\bin\bash.exe" | Out-Null
yarn install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to run yarn install" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 2: Build Frontend
Write-Host "`n[2/3] Building production frontend..." -ForegroundColor Yellow
yarn build:production
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build frontend" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 3: Package Release
Write-Host "`n[3/3] Creating panel.tar.gz..." -ForegroundColor Yellow
if (Test-Path "panel.tar.gz") {
    Remove-Item "panel.tar.gz" -Force
}

# Clean production files & directories to package
$items = @(
    "app",
    "bootstrap",
    "config",
    "database",
    "multiplayer",
    "public",
    "resources",
    "routes",
    "storage",
    "vendor",
    ".env.example",
    "artisan",
    "composer.json",
    "composer.lock",
    "package.json",
    "yarn.lock",
    "setup.sh",
    "CHANGELOG.md",
    "README.md",
    "LICENSE",
    "LICENSE.md"
)

tar --exclude="storage/logs/*.log" -czf panel.tar.gz $items

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create tar.gz" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`nSuccessfully created panel.tar.gz!" -ForegroundColor Green
Write-Host "You can now upload this file to your GitHub Release." -ForegroundColor Cyan
