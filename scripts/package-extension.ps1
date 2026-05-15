# Builds Web Store ZIP (and optional .crx) from npm dist/ output.
# Usage:
#   .\scripts\package-extension.ps1
#   .\scripts\package-extension.ps1 -Crx
#   .\scripts\package-extension.ps1 -Crx -KeyPath ".\dist\staging.pem"

param(
  [switch]$Crx,
  [string]$KeyPath = "",
  [string]$OutDir = "release"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "npm not found. Install Node.js 20+ and run: npm install"
}

if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host "Building extension (npm run build:release)..." -ForegroundColor Cyan
npm run build:release
if ($LASTEXITCODE -ne 0) { throw "npm run build:release failed" }

Write-Host "Creating ZIP (npm run package)..." -ForegroundColor Cyan
npm run package
if ($LASTEXITCODE -ne 0) { throw "npm run package failed" }

$manifest = Get-Content (Join-Path $repoRoot "package.json") -Raw | ConvertFrom-Json
$version = $manifest.version
$distPath = Join-Path $repoRoot "dist"
$zipPath = Join-Path $repoRoot "$OutDir\session-copy-v$version.zip"

if (-not (Test-Path $zipPath)) {
  throw "ZIP not found: $zipPath"
}

$zipSize = (Get-Item $zipPath).Length
Write-Host ""
Write-Host "Chrome Web Store package ready:" -ForegroundColor Green
Write-Host "  $zipPath"
Write-Host "  $([math]::Round($zipSize / 1KB, 1)) KB"
Write-Host ""
Write-Host "Load unpacked from: $distPath"
Write-Host "Upload ZIP at: https://chrome.google.com/webstore/devconsole"
Write-Host ""

if ($Crx) {
  $chromeCandidates = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
  )
  $chrome = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

  if (-not $chrome) {
    Write-Warning "Chrome not found. Install Chrome or pack manually with: chrome --pack-extension=..."
  } else {
    $packArgs = @("--pack-extension=$distPath")
    if ($KeyPath -and (Test-Path $KeyPath)) {
      $packArgs += "--pack-extension-key=$((Resolve-Path $KeyPath).Path)"
    } elseif ($KeyPath) {
      Write-Warning "Key file not found: $KeyPath - Chrome will create a new key."
    }

    Write-Host "Packing .crx (local testing only)..." -ForegroundColor Cyan
    Write-Host "  If Chrome opens a dialog, click OK - the script waits until Chrome exits." -ForegroundColor DarkGray
    $proc = Start-Process -FilePath $chrome -ArgumentList $packArgs -Wait -PassThru
    if ($proc.ExitCode -ne 0 -and $null -ne $proc.ExitCode) {
      Write-Warning "Chrome pack exited with code $($proc.ExitCode)"
    }

    $crxFile = Get-ChildItem $repoRoot -Filter "*.crx" -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    $pemFile = Get-ChildItem $repoRoot -Filter "*.pem" -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1

    if ($crxFile) {
      Write-Host "  CRX: $($crxFile.FullName)" -ForegroundColor Green
    } else {
      Write-Warning "No .crx found (Chrome pack may have failed)."
    }
    if ($pemFile) {
      Write-Host "  KEY: $($pemFile.FullName) - keep private; reuse with -KeyPath" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Note: Web Store uploads use the .zip, not .crx."
  }
}
