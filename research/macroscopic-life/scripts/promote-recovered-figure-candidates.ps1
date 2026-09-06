param(
  [string]$InputJson = "",
  [string]$InputDir = "research/macroscopic-life/recovery/intake",
  [string]$DecisionJson = "research/macroscopic-life/recovery/intake/pub-8k-visual-decisions.json",
  [string]$OutputDir = "research/macroscopic-life/recovery/verified"
)

$ErrorActionPreference = "Stop"

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Latest-Intake([string]$Dir) {
  if (-not (Test-Path -LiteralPath $Dir)) { return $null }
  Get-ChildItem -LiteralPath $Dir -File -Filter "pub-8j-candidate-intake-*.json" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

if ([string]::IsNullOrWhiteSpace($InputJson)) {
  $latest = Latest-Intake $InputDir
  if ($null -eq $latest) { Write-Error "No PUB-8J intake JSON found. Run verify-recovered-figure-candidates.ps1 first." }
  $InputJson = $latest.FullName
}

if (-not (Test-Path -LiteralPath $InputJson)) { Write-Error "Input intake JSON not found: $InputJson" }
if (-not (Test-Path -LiteralPath $DecisionJson)) {
  Write-Error "Decision file not found: $DecisionJson. Create it from the PUB-8K decision template after visual review."
}

Ensure-Directory $OutputDir

$candidates = @(Get-Content -LiteralPath $InputJson -Raw | ConvertFrom-Json)
$decisions = @(Get-Content -LiteralPath $DecisionJson -Raw | ConvertFrom-Json)

$decisionMap = @{}
foreach ($d in $decisions) {
  if ($null -eq $d.figure) { continue }
  $key = "{0}|{1}" -f [int]$d.figure, ("$($d.sha256)".ToLowerInvariant())
  $decisionMap[$key] = $d
}

$rows = New-Object System.Collections.Generic.List[object]

foreach ($c in $candidates) {
  $hash = ("$($c.sha256)").ToLowerInvariant()
  $key = "{0}|{1}" -f [int]$c.figure, $hash
  $d = $decisionMap[$key]

  $status = "R1"
  $promoted = $false
  $reason = "No matching signed visual decision."

  if ($null -ne $d) {
    $approved = $d.approvedComposition -eq $true
    $versionMatch = $d.frozenVersionMatch -eq $true
    $panelMatch = $d.panelArchitectureMatch -eq $true
    $noRejectedLanguage = $d.noRejectedVisualLanguage -eq $true
    $screenshotSafe = $d.screenshotSafetyAcceptable -eq $true
    $binaryExists = $false
    if (-not [string]::IsNullOrWhiteSpace("$($c.candidatePath)")) {
      $binaryExists = Test-Path -LiteralPath $c.candidatePath -PathType Leaf
    }

    if ($approved -and $versionMatch -and $panelMatch -and $noRejectedLanguage -and $screenshotSafe -and $binaryExists -and $hash.Length -gt 0) {
      $status = "R2"
      $promoted = $true
      $reason = "Human visual verification confirms approved frozen base composition; binary exists and SHA-256 is recorded."
    } else {
      $fails = New-Object System.Collections.Generic.List[string]
      if (-not $approved) { $fails.Add("approvedComposition=false") }
      if (-not $versionMatch) { $fails.Add("frozenVersionMatch=false") }
      if (-not $panelMatch) { $fails.Add("panelArchitectureMatch=false") }
      if (-not $noRejectedLanguage) { $fails.Add("noRejectedVisualLanguage=false") }
      if (-not $screenshotSafe) { $fails.Add("screenshotSafetyAcceptable=false") }
      if (-not $binaryExists) { $fails.Add("candidate binary not reachable") }
      if ($hash.Length -eq 0) { $fails.Add("missing SHA-256") }
      $reason = "R2 gate failed: " + ($fails -join "; ")
    }
  }

  $rows.Add([pscustomobject]@{
    figure = [int]$c.figure
    figureId = $c.figureId
    expectedFrozenVersion = $c.expectedFrozenVersion
    canonicalLockCommit = $c.canonicalLockCommit
    candidatePath = $c.candidatePath
    candidateName = $c.candidateName
    sha256 = $hash
    recoveryClass = $status
    promotedToR2 = $promoted
    visualReviewer = if ($null -ne $d) { "$($d.reviewer)" } else { "" }
    visualReviewDate = if ($null -ne $d) { "$($d.reviewDate)" } else { "" }
    reviewNotes = if ($null -ne $d) { "$($d.notes)" } else { "" }
    reason = $reason
    deterministicOverlayStatus = if ($promoted) { "OPEN" } else { "BLOCKED UNTIL R2" }
    webProof = "OPEN"
    printProof = "OPEN"
    publicationReady = $false
    nextAction = if ($promoted) { "Build deterministic scientific overlay and complete R3 proof." } else { "Resolve visual provenance mismatch or review another candidate." }
  })
}

$ordered = @($rows | Sort-Object figure, candidateName)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$jsonOut = Join-Path $OutputDir "pub-8k-r1-r2-verification-$timestamp.json"
$csvOut = Join-Path $OutputDir "pub-8k-r1-r2-verification-$timestamp.csv"
$mdOut = Join-Path $OutputDir "pub-8k-r1-r2-verification-$timestamp.md"

$ordered | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $jsonOut -Encoding UTF8
$ordered | Export-Csv -LiteralPath $csvOut -NoTypeInformation -Encoding UTF8

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# PUB-8K — R1 → R2 Visual Provenance Verification")
$lines.Add("")
$lines.Add("| Figure | Candidate | Class | Reviewer | Result |")
$lines.Add("|---:|---|---|---|---|")
foreach ($row in $ordered) {
  $safeName = ("$($row.candidateName)").Replace("|","\\|")
  $safeReason = ("$($row.reason)").Replace("|","\\|")
  $lines.Add("| $($row.figure) | $safeName | $($row.recoveryClass) | $($row.visualReviewer) | $safeReason |")
}
$lines.Add("")
$lines.Add("R2 means only that the recovered binary matches the frozen approved base composition. It is not publication-ready. R3 still requires deterministic typography/scientific copy, caption/alt text, web/mobile proof, screenshot safety, and print proof.")
$lines | Set-Content -LiteralPath $mdOut -Encoding UTF8

Write-Host "PUB-8K verification complete."
Write-Host "JSON: $jsonOut"
Write-Host "CSV : $csvOut"
Write-Host "MD  : $mdOut"
Write-Host "R2 promoted: $(@($ordered | Where-Object { $_.promotedToR2 }).Count)"
