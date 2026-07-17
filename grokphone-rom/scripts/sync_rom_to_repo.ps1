# sync_rom_to_repo.ps1
# Synchroniseert de GrokPhone custom ROM bestanden naar de repo
# onder de map 'grokphone-rom/' om conflicten met root bestanden (zoals README) te voorkomen.

param(
    # Default: actual ROM tree used on this machine (GrokPhone no longer exists)
    [string]$LocalGrokPhone = "",
    [string]$TargetClone   = "C:\Users\Gebruiker\Stay4s-grokrom-work"
)

Write-Host "=== Stay4S GrokPhone ROM → grokphone-rom/ in repo ===" -ForegroundColor Cyan

# Resolve source: explicit param > legacy GrokPhone > in-repo grokphone-rom
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
    Write-Host "ERROR: No ROM source found. Pass -LocalGrokPhone <path> with device/, packages/, docs/." -ForegroundColor Red
    Write-Host "Tried GrokPhone and Stay4s-grokrom-work\grokphone-rom (C: and D:)." -ForegroundColor Yellow
    exit 1
}

Write-Host "Source ROM tree: $LocalGrokPhone" -ForegroundColor Cyan

if (-not (Test-Path $TargetClone)) {
    Write-Host "Cloning target repo..."
    git clone https://github.com/miesdevries/Stay4s-grokrom.git $TargetClone
}

$TargetClone = (Resolve-Path $TargetClone).Path
$RomTarget   = Join-Path $TargetClone "grokphone-rom"

# Avoid robocopy /MIR wiping the tree when source == destination
$srcResolved = (Resolve-Path $LocalGrokPhone).Path
if ($srcResolved -eq $RomTarget) {
    Write-Host "Source is already the repo grokphone-rom/ tree. Nothing to sync; commit/push instead:" -ForegroundColor Yellow
    Write-Host "  cd `"$TargetClone`""
    Write-Host "  git add grokphone-rom/"
    Write-Host '  git commit -m "GrokPhone ROM: update custom ROM files"'
    Write-Host "  git push origin main"
    exit 0
}

# Maak de doelmap aan als die nog niet bestaat
New-Item -ItemType Directory -Force -Path $RomTarget | Out-Null

# Belangrijke mappen die onder grokphone-rom/ komen
$romDirs = @(
    "device",
    "packages",
    "scripts",
    "docs"
)

foreach ($dir in $romDirs) {
    $src = Join-Path $LocalGrokPhone $dir
    $dst = Join-Path $RomTarget $dir

    if (Test-Path $src) {
        Write-Host "Syncing $dir -> grokphone-rom/$dir" -ForegroundColor Green
        robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /XD ".git" "out"
    }
}

# Root bestanden die veilig onder grokphone-rom/ kunnen
$rootFiles = @(".gitignore", ".gitattributes", "roomservice.xml")
foreach ($file in $rootFiles) {
    $src = Join-Path $LocalGrokPhone $file
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $RomTarget $file) -Force
    }
}

Write-Host ""
Write-Host "ROM bestanden klaar in: $RomTarget" -ForegroundColor Green
Write-Host ""
Write-Host "Nu handmatig committeren en pushen:" -ForegroundColor Yellow
Write-Host "cd `"$TargetClone`""
Write-Host "git add grokphone-rom/"
Write-Host 'git commit -m "GrokPhone ROM: Update custom ROM files (device tree, SELinux, scripts, docs)"'
Write-Host "git push origin main"
Write-Host ""
Write-Host "Tip: Gebruik een branch als je eerst wilt reviewen." -ForegroundColor DarkCyan