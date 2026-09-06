param(
  [string]$RepoRoot = ".",
  [string]$OutputDir = "research/macroscopic-life/recovery/release-readiness"
)
$ErrorActionPreference = "Stop"
function Exists([string]$p) { Test-Path -LiteralPath (Join-Path $RepoRoot $p) -PathType Leaf }
function EnsureDir([string]$p) { if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

$checks = [ordered]@{
  scientificCoreFrozen = (Exists "research/macroscopic-life/82-pub-6u-book-one-beginning-to-end-hostile-review.md")
  canonicalAssemblyControl = (Exists "research/macroscopic-life/96-pub-7i-master-manuscript-assembly-and-source-preservation-map.md")
  redundancyAudit = (Exists "research/macroscopic-life/97-pub-7j-whole-book-redundancy-audit-start-to-finish.md")
  controlledMasterRoot = (Exists "research/macroscopic-life/manuscript/book-one-master-v1.0-controlled.md")
  materializer = (Exists "research/macroscopic-life/scripts/materialize-book-one-master.mjs")
  materializedReaderMaster = (Exists "research/macroscopic-life/manuscript/book-one-master-v1.0-reader-materialized.md")
  bibliographyRegister = (Exists "research/macroscopic-life/manuscript/book-one-bibliography-and-endnote-register-v1.0.md")
  figureRecoveryLedger = (Exists "research/macroscopic-life/104-pub-8g-recovered-asset-intake-ledger.md")
  figurePublicationRegistry = (Exists "research/macroscopic-life/visuals/figure-publication-registry-v1.json")
}

$registryPath = Join-Path $RepoRoot "research/macroscopic-life/visuals/figure-publication-registry-v1.json"
$r3 = 0
$figTotal = 15
if (Test-Path -LiteralPath $registryPath) {
  $reg = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
  foreach ($n in 2..16) {
    $key = $n.ToString("00")
    $entry = $reg.figures.$key
    if ($null -ne $entry -and $entry.recoveryClass -eq "R3" -and $entry.publicationReady -eq $true) { $r3++ }
  }
}

$blockers = New-Object System.Collections.Generic.List[string]
if (-not $checks.materializedReaderMaster) { $blockers.Add("Physical reader manuscript has not been confirmed materialized.") }
if (-not $checks.bibliographyRegister) { $blockers.Add("Bibliography/endnote register missing.") }
if ($r3 -lt $figTotal) { $blockers.Add("Publication figures R3 complete: $r3/$figTotal. All Figures 2–16 must reach R3 for final illustrated release.") }

$releaseReady = ($blockers.Count -eq 0)
EnsureDir (Join-Path $RepoRoot $OutputDir)
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = [ordered]@{
  generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
  releaseReady = $releaseReady
  status = if ($releaseReady) { "PASS" } else { "BLOCKED" }
  checks = $checks
  figures = [ordered]@{ frozen = 15; r3 = $r3; requiredR3 = 15 }
  blockers = @($blockers)
  doctrine = "No architecture rewrite. Resolve production blockers only."
}
$jsonPath = Join-Path (Join-Path $RepoRoot $OutputDir) "book-one-release-readiness-$stamp.json"
$mdPath = Join-Path (Join-Path $RepoRoot $OutputDir) "BOOK-ONE-RELEASE-READINESS-$stamp.md"
$out | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
$lines = @(
  "# Macroscopic Life Book One — Release Readiness",
  "",
  "**Status: $($out.status)**",
  "",
  "## Production dashboard",
  "",
  "- Scientific core frozen: $($checks.scientificCoreFrozen)",
  "- Canonical assembly control: $($checks.canonicalAssemblyControl)",
  "- Controlled master root: $($checks.controlledMasterRoot)",
  "- Physical reader master materialized: $($checks.materializedReaderMaster)",
  "- Bibliography/endnote register: $($checks.bibliographyRegister)",
  "- Figure recovery ledger: $($checks.figureRecoveryLedger)",
  "- Figure publication registry: $($checks.figurePublicationRegistry)",
  "- Figures R3: $r3 / $figTotal",
  "",
  "## Release blockers",
  ""
)
if ($blockers.Count -eq 0) { $lines += "None." } else { foreach ($b in $blockers) { $lines += "- $b" } }
$lines += @("", "## Rule", "", "**No architecture rewrite. Resolve production blockers only.**")
$lines | Set-Content -LiteralPath $mdPath -Encoding UTF8
Write-Host "Book One release gate: $($out.status)"
Write-Host "Figures R3: $r3/$figTotal"
Write-Host "JSON: $jsonPath"
Write-Host "MD: $mdPath"
if (-not $releaseReady) { exit 2 }
