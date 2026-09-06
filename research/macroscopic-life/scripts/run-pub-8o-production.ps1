param([string]$RepoRoot = ".")
$ErrorActionPreference = "Stop"
Push-Location $RepoRoot
try {
  Write-Host "PUB-8O — materializing physical reader master..."
  node .\research\macroscopic-life\scripts\materialize-book-one-master.mjs
  if ($LASTEXITCODE -ne 0) { throw "Materializer failed." }
  $master = ".\research\macroscopic-life\manuscript\book-one-master-v1.0-reader-materialized.md"
  if (-not (Test-Path -LiteralPath $master -PathType Leaf)) { throw "Materialized master was not created." }
  $text = Get-Content -LiteralPath $master -Raw
  $chapterCount = ([regex]::Matches($text, '(?m)^##? Chapter \d+ —')).Count
  if ($chapterCount -ne 16) { throw "Expected 16 chapters; found $chapterCount." }
  if ($text -match 'PUB-7L .*IMPLEMENTATION NOTES|EDITORIAL LEDGER') { throw "Build-only material leaked into physical master." }
  Write-Host "Physical master validation: PASS (16 chapters)."

  Write-Host "PUB-8O — building bibliography normalization queue..."
  node .\research\macroscopic-life\scripts\build-bibliography-normalization-queue.mjs
  if ($LASTEXITCODE -ne 0) { throw "Bibliography queue builder failed." }

  Write-Host "PUB-8O production execution: PASS"
  Write-Host "Review generated manuscript and bibliography queue, then commit generated artifacts."
} finally { Pop-Location }
