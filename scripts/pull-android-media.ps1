#Requires -Version 5.1
<#
  Pulls photos/videos from a USB-connected Android device using adb (MTP is harder to script).
  Prereqs on the phone: Developer options > USB debugging ON, USB mode = File transfer, accept RSA prompt.

  Usage (from repo root):
    powershell -ExecutionPolicy Bypass -File scripts/pull-android-media.ps1
  Or set ADB to your platform-tools adb.exe
#>
$ErrorActionPreference = "Stop"
# scripts/ -> repo root (RedDirt)
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outRoot = if ($env:PHONE_IMPORT_DIR) { $env:PHONE_IMPORT_DIR } else { Join-Path (Join-Path $repoRoot "campaign-media") "phone-import" }
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$out = Join-Path $outRoot $stamp
New-Item -ItemType Directory -Force -Path $out | Out-Null

$adb = $env:ADB
if (-not $adb) {
  $candidates = @(
    "$env:TEMP\platform-tools\adb.exe",
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "adb"
  )
  foreach ($c in $candidates) {
    if ($c -eq "adb") {
      $g = Get-Command adb -ErrorAction SilentlyContinue
      if ($g) { $adb = $g.Source; break }
    } elseif (Test-Path $c) { $adb = $c; break }
  }
}
if (-not $adb -or -not (Test-Path $adb)) {
  Write-Host "adb not found. Download platform-tools: https://developer.android.com/tools/releases/platform-tools" -ForegroundColor Red
  exit 1
}

& $adb start-server
$devices = & $adb devices | Select-String "device$" | Where-Object { $_ -notmatch "List" }
if (-not $devices) {
  Write-Host "No device in 'adb devices'. On the phone: enable USB debugging, set USB to File transfer, accept the computer." -ForegroundColor Yellow
  exit 2
}

$paths = @(
  "/sdcard/DCIM",
  "/sdcard/Pictures",
  "/sdcard/Movies",
  "/sdcard/Download"
)
foreach ($p in $paths) {
  $name = ($p -replace "/sdcard/", "" -replace "/", "_")
  $sub = Join-Path $out $name
  Write-Host "Pulling $p -> $sub"
  & $adb pull $p $sub 2>&1
}

Write-Host "Done. Files under: $out" -ForegroundColor Green
