# Builds a Chrome Web Store upload ZIP (and optional .crx for local testing).
# Usage:
#   .\scripts\package-extension.ps1
#   .\scripts\package-extension.ps1 -Crx
#   .\scripts\package-extension.ps1 -Crx -KeyPath ".\dist\session-copy.pem"

param(
  [switch]$Crx,
  [string]$KeyPath = "",
  [string]$OutDir = "dist"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $repoRoot

$manifestPath = Join-Path $repoRoot "manifest.json"
if (-not (Test-Path $manifestPath)) {
  throw "manifest.json not found in $repoRoot"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$zipName = "session-copy-v$version.zip"

$outPath = Join-Path $repoRoot $OutDir
$stagePath = Join-Path $outPath "staging"
$zipPath = Join-Path $outPath $zipName

# Prefer bash script when Git Bash / WSL available (same output as CI)
$bashScript = Join-Path $repoRoot "scripts\build-store-zip.sh"
if (Get-Command bash -ErrorAction SilentlyContinue) {
  & bash $bashScript.Replace('\', '/') $version | Out-Null
} else {
  if (Test-Path $stagePath) { Remove-Item $stagePath -Recurse -Force }
  New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
  New-Item -ItemType Directory -Path $outPath -Force | Out-Null
  @("manifest.json", "assets", "src", "changelog") | ForEach-Object {
    $src = Join-Path $repoRoot $_
    if (-not (Test-Path $src)) { throw "Required path missing: $_" }
    Copy-Item $src (Join-Path $stagePath $_) -Recurse -Force
  }
  if (Test-Path (Join-Path $repoRoot "LICENSE")) {
    Copy-Item (Join-Path $repoRoot "LICENSE") (Join-Path $stagePath "LICENSE") -Force
  }
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path (Join-Path $stagePath "*") -DestinationPath $zipPath -CompressionLevel Optimal
}

$zipSize = (Get-Item $zipPath).Length
Write-Host ""
Write-Host "Chrome Web Store package ready:" -ForegroundColor Green
Write-Host "  $zipPath"
Write-Host "  $([math]::Round($zipSize / 1KB, 1)) KB"
Write-Host ""
Write-Host "Upload this ZIP at: https://chrome.google.com/webstore/devconsole"
Write-Host "  (Developer Dashboard -> your item -> Package -> Upload new package)"
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
    $packArgs = @("--pack-extension=$stagePath")
    if ($KeyPath -and (Test-Path $KeyPath)) {
      $packArgs += "--pack-extension-key=$(Resolve-Path $KeyPath)"
    } elseif ($KeyPath) {
      Write-Warning "Key file not found: $KeyPath — Chrome will create a new key."
    }

    Write-Host "Packing .crx (local install / testing only)..." -ForegroundColor Cyan
    & $chrome @packArgs

    $crx = Get-ChildItem $outPath -Filter "*.crx" -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
    $pem = Get-ChildItem $outPath -Filter "*.pem" -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1

    if ($crx) {
      Write-Host "  CRX: $($crx.FullName)" -ForegroundColor Green
    }
    if ($pem) {
      Write-Host "  KEY: $($pem.FullName) — keep this private; reuse with -KeyPath for future builds"
    }
    Write-Host ""
    Write-Host "Note: Chrome Web Store uploads use the .zip, not .crx."
  }
}

Write-Host "Staging folder kept at: $stagePath (for inspection)"
