$ErrorActionPreference = "Stop"

$ExtractPath = "node_standalone"
$NodeDir = "$pwd\$ExtractPath\node-v22.14.0-win-x64"

Write-Host "Setting up environment variables..."
$env:Path = "$NodeDir;" + $env:Path

Write-Host "Enabling Corepack (Yarn)..."
corepack enable

Write-Host "Yarn version:"
yarn -v

Write-Host "Installing dependencies with Yarn..."
yarn install

Write-Host "Building frontend..."
yarn run cross-env NODE_ENV=production ./node_modules/.bin/webpack --mode production

Write-Host "Build complete!"
