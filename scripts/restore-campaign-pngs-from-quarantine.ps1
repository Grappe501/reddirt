# Restore Kelly campaign PNG stills quarantined by mistake.
# Leave DAB tour ops assets in quarantine.
$ErrorActionPreference = "Stop"
$src = "H:\SOSWebsite\RedDirt\data\campaign-media\quarantine\dab-tour-not-public"
$dest = "H:\SOSWebsite\RedDirt\public\media\campaign-photos"
$keepQuarantined = @(
  "2026-dab-stage-plot-3d.png",
  "dab-2026-input-list.jpg",
  "dab-stage-plot-2025-jpg.png",
  "credential-listing-2026.jpg",
  "3aa8d603-9a59-41d4-8591-1ab885d0dcdd.png",
  "68a6ee58-e50f-4093-8532-c27b48bb9456.png",
  "7625542d-ebeb-4a5c-ae25-420711f5e16a.png",
  "e5bfdf16-6b76-48f8-841a-7e3a35a90d2e.png",
  "56a98350-cc99-40a1-b0d0-784da9a7fee3.png",
  "cbp00157.jpg",
  "cbp00398.jpg",
  "cbp01665.jpg",
  "cbp01770.jpg",
  "cbp04849.jpg",
  "img-1731-1.jpeg",
  "img-1731.jpeg",
  "img-2635.jpg",
  "img-3568.jpeg",
  "img-3581.jpeg",
  "img-3629.jpeg",
  "img-3638.jpeg",
  "img-3667.jpeg",
  "img-5331.jpg",
  "img-5332.jpg",
  "img-5608.jpg",
  "img-5609.jpg",
  "img-5610.jpg",
  "img-5611.jpg",
  "img-5612.jpg",
  "img-5613.jpg",
  "img-5614.jpg",
  "img-5615.jpg",
  "img-5616.jpg",
  "img-5618.jpg",
  "img-5619.jpg",
  "img-5620.jpg",
  "img-5621.jpg",
  "img-5622.jpg",
  "img-5623.jpg",
  "img-6104.jpeg",
  "img-6186.jpeg",
  "img-6192-1.jpeg",
  "img-6192.jpeg",
  "img-6199.jpeg",
  "photo-jul-19-2025-7-51-50-pm.jpg",
  "photo-jul-19-2025-8-01-34-pm.jpg",
  "photo-jul-19-2025-8-01-50-pm.jpg",
  "photo-jun-06-2015-11-29-07-pm.jpg"
)
$restored = 0
$kept = 0
Get-ChildItem -LiteralPath $src -File | ForEach-Object {
  if ($keepQuarantined -contains $_.Name) {
    Write-Output ("Kept quarantined: " + $_.Name)
    $kept++
    return
  }
  Move-Item -LiteralPath $_.FullName -Destination $dest -Force
  Write-Output ("Restored: " + $_.Name)
  $restored++
}
Write-Output ("Done. Restored " + $restored + "; kept " + $kept + " in quarantine.")
