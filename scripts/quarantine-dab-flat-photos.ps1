# Move DAB/concert flat copies out of public/media/campaign-photos (Kelly site only).
# Only targets known DAB tour / credential filenames — never semantic campaign PNGs.
$ErrorActionPreference = "Stop"
$patterns = @(
  "credential-listing*",
  "dab-*",
  "2026-dab-*",
  "cbp*.jpg",
  "img-560*.jpg",
  "img-561*.jpg",
  "img-562*.jpg",
  "img-1731*",
  "img-2635.jpg",
  "img-533*.jpg",
  "img-3568*",
  "img-3581*",
  "img-3629*",
  "img-3638*",
  "img-3667*",
  "img-6104*",
  "img-6186*",
  "img-6192*",
  "img-6199*",
  "photo-jul-19-2025-*",
  "photo-jun-06-2015-*",
  "3aa8d603-*",
  "68a6ee58-*",
  "7625542d-*",
  "e5bfdf16-*",
  "56a98350-*"
)
$src = "H:\SOSWebsite\RedDirt\public\media\campaign-photos"
$dest = "H:\SOSWebsite\RedDirt\data\campaign-media\quarantine\dab-tour-not-public"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$moved = 0
Get-ChildItem -LiteralPath $src -File | ForEach-Object {
  $match = $false
  foreach ($pat in $patterns) {
    if ($_.Name -like $pat) { $match = $true; break }
  }
  if (-not $match) { return }
  Move-Item -LiteralPath $_.FullName -Destination $dest -Force
  Write-Output ("Moved: " + $_.Name)
  $moved++
}
Write-Output ("Done. Moved " + $moved + " file(s) to quarantine.")
