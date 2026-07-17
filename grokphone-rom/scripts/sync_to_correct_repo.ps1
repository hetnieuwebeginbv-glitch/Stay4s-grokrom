# sync_to_correct_repo.ps1
# Prefer sync_rom_to_repo.ps1 (lays out under grokphone-rom/).
# This script syncs into the repo root (legacy). Defaults fixed for current machine paths.

param(
    [string]$LocalGrokPhone = "",
    [string]$TargetClone   = "C:\Users\Gebruiker\Stay4s-grokrom-work"
)

Write-Host "=== Stay4S GrokPhone → Official Repo Sync (legacy root layout) ===" -ForegroundColor Cyan
Write-Host "Tip: prefer scripts\sync_rom_to_repo.ps1 (uses grokphone-rom/ subfolder)." -ForegroundColor DarkCyan

if ([string]::IsNullOrWhiteSpace($LocalGrokPhone)) {
    $candidates = @(
        "C:\Users\Gebruiker\GrokPhone",
        "C:\Users\Gebruiker\Stay4s-grokrom-work\grokphone-rom",
        "D:\Stay4S\GrokPhone",
        "D:\Stay4S\Stay4s-grokrom-work\grokphone-rom"
    )
    foreach ($c in $candidates) {
        if (Test-Path (Join-Path $c "device")) {
            $LocalGrokPhone = $c
            break
        }
    }
}

if ([string]::IsNullOrWhiteSpace($LocalGrokPhone) -or -not (Test-Path $LocalGrokPhone)) {
    Write-Host "ERROR: No ROM source with device/ found. Pass -LocalGrokPhone <path>." -ForegroundColor Red
    exit 1
}

Write-Host "Source: $LocalGrokPhone" -ForegroundColor Cyan

if (-not (Test-Path $TargetClone)) {
    Write-Host "Cloning target repo..."
    git clone https://github.com/miesdevries/Stay4s-grokrom.git $TargetClone
}

$TargetClone = (Resolve-Path $TargetClone).Path
$srcResolved = (Resolve-Path $LocalGrokPhone).Path

# If source is already grokphone-rom inside target, use subfolder layout instead of root
$preferred = Join-Path $TargetClone "grokphone-rom"
if ($srcResolved -eq $preferred) {
    Write-Host "Source already is $preferred — use sync_rom_to_repo.ps1 / git add grokphone-rom/" -ForegroundColor Yellow
    exit 0
}

$syncDirs = @("device", "packages", "scripts", "docs")
foreach ($dir in $syncDirs) {
    $src = Join-Path $LocalGrokPhone $dir
    $dst = Join-Path $TargetClone $dir
    if (Test-Path $src) {
        Write-Host "Syncing $dir ..." -ForegroundColor Green
        robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /XD ".git" "out" | Out-Null
    }
}

$rootFiles = @(".gitignore")
foreach ($file in $rootFiles) {
    $src = Join-Path $LocalGrokPhone $file
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $TargetClone $file) -Force
    }
}

Write-Host ""
Write-Host "Files prepared in: $TargetClone" -ForegroundColor Green
Write-Host "Next: cd `"$TargetClone`"; git add .; git commit; git push origin main" -ForegroundColor Yellow
