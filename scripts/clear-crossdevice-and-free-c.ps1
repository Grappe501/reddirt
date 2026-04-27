# Run in PowerShell (User account). If Access Denied, right-click PowerShell > Run as administrator and run again.
# WARNING: Deleting from CrossDevice may affect linked phone content in some setups—back up the phone if unsure.

$ErrorActionPreference = "Continue"
$cross = Join-Path $env:USERPROFILE "CrossDevice"

Write-Host "Stopping Phone Link / related processes (ignore errors)..."
@(
  "PhoneExperienceHost", "PhoneLink", "YourPhone", "TextInputHost", "LinkToWindows"
) | ForEach-Object { Stop-Process -Name $_ -Force -ErrorAction SilentlyContinue }

# Optional: taskkill for exe names
$exes = @("PhoneExperienceHost.exe", "PhoneLink.exe", "ms-teams.exe")
foreach ($e in $exes) {
  & taskkill /F /IM $e 2>$null | Out-Null
}

if (-not (Test-Path $cross)) {
  Write-Host "No CrossDevice folder at: $cross"
} else {
  $before = (Get-ChildItem $cross -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
  Write-Host "CrossDevice size (approx): $([math]::Round($before / 1GB, 2)) GB"
  Write-Host "Deleting: $cross"
  try {
    & cmd /c "rmdir /s /q `"$cross`""
  } catch {}
  if (Test-Path $cross) {
    Write-Host "rmdir did not remove all; using Remove-Item (per-item errors allowed)..."
    # Do not use -ErrorAction Stop: cloud placeholders and 'Saved Searches' often throw and abort the whole tree.
    Get-ChildItem -LiteralPath $cross -Force -ErrorAction SilentlyContinue | ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $cross) {
      Remove-Item -LiteralPath $cross -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
  if (Test-Path $cross) {
    Write-Host "Trying robocopy empty-folder mirror (sometimes clears cloud stub folders)..."
    $empty = Join-Path $env:TEMP ("empty_robo_" + [guid]::NewGuid().ToString("n"))
    New-Item -ItemType Directory -Path $empty -Force | Out-Null
    try {
      & robocopy $empty $cross /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
      Remove-Item -LiteralPath $empty -Recurse -Force -ErrorAction SilentlyContinue
      Remove-Item -LiteralPath $cross -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
  }
  if (Test-Path $cross) {
    Write-Host @"
FAILED: CrossDevice could not be fully removed (common: cloud/Phone Link 'The cloud operation was unsuccessful').

Do this, then re-run this script (or delete the rest in Explorer):
  1) Reboot (clears file handles from Phone Link).
  2) Settings > Bluetooth & devices > Mobile devices — remove the phone / turn off file sync.
  3) Open Phone Link > Settings — Sign out; turn off Photos and any PC file access.
  4) Optional: run this script in an elevated PowerShell (Run as administrator).
  5) If one folder like '...Saved Searches' remains: delete the parent 'Steven''s S24...' in Explorer, or
     Settings > System > For developers is unrelated — use unlink above first.

"@
    exit 1
  }
  Write-Host "CrossDevice removed."
}

$c = Get-PSDrive -Name C -ErrorAction SilentlyContinue
if ($c) { Write-Host "C: free  $([math]::Round($c.Free/1GB,2)) GB" }

Write-Host @"

NEXT — stop refilling:
1) Windows 11: Settings > Bluetooth & devices > Mobile devices
   - Turn OFF features that sync files/photos to this PC, or remove the linked device.
2) Open Phone Link app > Settings (gear) > Features: turn OFF Photos (and any file sharing) or sign out.
3) Optional: Uninstall "Phone Link" (Windows optional feature / Store) if you do not use it.

"@
exit 0
