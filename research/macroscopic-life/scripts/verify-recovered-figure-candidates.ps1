param(
  [string]$RecoveryDir = "research/macroscopic-life/recovery",
  [string]$InputJson = "",
  [string]$OutputDir = "research/macroscopic-life/recovery/intake"
)

$ErrorActionPreference = "Stop"

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Get-LatestRecoveryJson([string]$Dir) {
  if (-not (Test-Path -LiteralPath $Dir)) { return $null }
  $files = Get-ChildItem -LiteralPath $Dir -File -Filter "*.json" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "\\intake\\" } |
    Sort-Object LastWriteTime -Descending
  return $files | Select-Object -First 1
}

function Normalize-Candidates($data) {
  if ($null -eq $data) { return @() }
  if ($data -is [System.Array]) { return @($data) }
  foreach ($prop in @("candidates", "Candidates", "files", "Files", "results", "Results")) {
    if ($data.PSObject.Properties.Name -contains $prop) {
      return @($data.$prop)
    }
  }
  return @($data)
}

function Read-Field($obj, [string[]]$names) {
  foreach ($n in $names) {
    if ($obj.PSObject.Properties.Name -contains $n) {
      $v = $obj.$n
      if ($null -ne $v -and "$v".Trim().Length -gt 0) { return "$v" }
    }
  }
  return ""
}

$versionMap = @{
  "02" = "V4"; "03" = "V4"; "04" = "V4"; "05" = "V3"; "06" = "V3";
  "07" = "V3"; "08" = "V2"; "09" = "V2"; "10" = "V3"; "11" = "V2";
  "12" = "V3"; "13" = "V3"; "14" = "V3"; "15" = "V3"; "16" = "FROZEN"
}

$lockMap = @{
  "02" = "786b9dec0e763906198954c8b6b5b2b723321730";
  "03" = "681159c5f3cc2b988c58d52627b48d749e695027";
  "04" = "ce516935f999e52decc3e2561a048f5896e5383c";
  "05" = "90e4dccf0e90471190b73968634df982b6ddde73";
  "06" = "c276a9e9ba211a07c487d70379625b734898780a";
  "07" = "76149c8c8ce1ee9c61fb2cb03ee9e925a57de9bc";
  "08" = "30885f9e1980cc32075f1d42b3edf9196a24cfac";
  "09" = "7cbf92241d851e08a6ddf0e18f00660f86587de0";
  "10" = "7350f0edfe7817fb969796c5150b604dd693a9ab";
  "11" = "e0c839a341759bbab894f6ce3442d004915fe0b3";
  "12" = "51fe578231eb0a70960b4c29c8106b90a37c2584";
  "13" = "8834c60209e50e88febb48dabe77007a8b291830";
  "14" = "97007d01dcdc8aaf2cd2a287a81e8204736688d3";
  "15" = "69f59749f701213f4ee63c7c98b8b49578debbcf";
  "16" = "3178eaf81abd53c42ab613316e144907c6736b65"
}

if ([string]::IsNullOrWhiteSpace($InputJson)) {
  $latest = Get-LatestRecoveryJson $RecoveryDir
  if ($null -eq $latest) {
    Write-Error "No recovery JSON found in $RecoveryDir. Run recover-figure-binaries.ps1 first."
  }
  $InputJson = $latest.FullName
}

if (-not (Test-Path -LiteralPath $InputJson)) {
  Write-Error "Input JSON not found: $InputJson"
}

Ensure-Directory $OutputDir
$data = Get-Content -LiteralPath $InputJson -Raw | ConvertFrom-Json
$candidates = Normalize-Candidates $data

$rows = New-Object System.Collections.Generic.List[object]

foreach ($candidate in $candidates) {
  $path = Read-Field $candidate @("Path","path","FullName","fullName","File","file")
  $name = Read-Field $candidate @("Name","name","FileName","filename")
  if ([string]::IsNullOrWhiteSpace($name) -and -not [string]::IsNullOrWhiteSpace($path)) {
    $name = [System.IO.Path]::GetFileName($path)
  }
  $hash = Read-Field $candidate @("SHA256","sha256","Hash","hash")
  $scoreRaw = Read-Field $candidate @("Score","score","RankScore","rankScore")
  $guessedRaw = Read-Field $candidate @("Figure","figure","FigureNumber","figureNumber","GuessedFigure","guessedFigure")

  $text = (($name + " " + $path + " " + $guessedRaw).ToLowerInvariant())
  $fig = $null

  if ($guessedRaw -match '(?<!\d)(?:fig(?:ure)?[-_ ]*)?0?([2-9]|1[0-6])(?!\d)') {
    $fig = [int]$Matches[1]
  } elseif ($text -match '(?:fig(?:ure)?[-_ ]*)0?([2-9]|1[0-6])(?!\d)') {
    $fig = [int]$Matches[1]
  }

  if ($null -eq $fig) { continue }

  $key = $fig.ToString("00")
  $expectedVersion = $versionMap[$key]
  $versionSignals = @()
  if ($expectedVersion -ne "FROZEN") {
    $versionToken = $expectedVersion.ToLowerInvariant()
    if ($text -match [regex]::Escape($versionToken)) { $versionSignals += "filename/path mentions $expectedVersion" }
  }

  $format = [System.IO.Path]::GetExtension($name).ToLowerInvariant()
  $binaryExistsNow = $false
  $size = $null
  $modified = $null
  if (-not [string]::IsNullOrWhiteSpace($path) -and (Test-Path -LiteralPath $path -PathType Leaf)) {
    $item = Get-Item -LiteralPath $path
    $binaryExistsNow = $true
    $size = $item.Length
    $modified = $item.LastWriteTimeUtc.ToString("o")
    if ([string]::IsNullOrWhiteSpace($hash)) {
      $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
    }
  }

  $confidence = "LOW"
  $rClass = "R1-CANDIDATE"
  $reason = New-Object System.Collections.Generic.List[string]
  $reason.Add("candidate maps to Figure $fig")

  if ($versionSignals.Count -gt 0) {
    $confidence = "MEDIUM"
    $reason.AddRange([string[]]$versionSignals)
  }

  if ($binaryExistsNow) {
    $reason.Add("file exists at scan path")
  } else {
    $reason.Add("file not currently reachable at scan path")
  }

  if (-not [string]::IsNullOrWhiteSpace($hash)) {
    $reason.Add("SHA-256 recorded")
  }

  $rows.Add([pscustomobject]@{
    figure = $fig
    figureId = "fig-$key"
    expectedFrozenVersion = $expectedVersion
    canonicalLockCommit = $lockMap[$key]
    candidatePath = $path
    candidateName = $name
    extension = $format
    sha256 = $hash
    sizeBytes = $size
    modifiedUtc = $modified
    scannerScore = $scoreRaw
    recoveryClass = $rClass
    confidence = $confidence
    reason = ($reason -join "; ")
    publicationReady = $false
    nextAction = "Visually compare against frozen final review/composite lock before any R2 promotion."
  })
}

$ordered = @($rows | Sort-Object figure, @{Expression={ if ($_.scannerScore -match '^\d+(\.\d+)?$') { -[double]$_.scannerScore } else { 0 } }}, candidateName)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$jsonOut = Join-Path $OutputDir "pub-8j-candidate-intake-$timestamp.json"
$csvOut = Join-Path $OutputDir "pub-8j-candidate-intake-$timestamp.csv"
$mdOut = Join-Path $OutputDir "pub-8j-candidate-intake-$timestamp.md"

$ordered | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $jsonOut -Encoding UTF8
$ordered | Export-Csv -LiteralPath $csvOut -NoTypeInformation -Encoding UTF8

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# PUB-8J — Recovered Figure Candidate Intake")
$lines.Add("")
$lines.Add("Input recovery report: `$InputJson`")
$lines.Add("")
$lines.Add("This report performs provenance intake only. It does not promote any candidate to R2 or R3 and does not modify source image files.")
$lines.Add("")
$lines.Add("| Figure | Frozen version | Confidence | Candidate | SHA-256 | State |")
$lines.Add("|---:|---|---|---|---|---|")
foreach ($row in $ordered) {
  $shortHash = if ($row.sha256.Length -ge 12) { $row.sha256.Substring(0,12) + "…" } else { $row.sha256 }
  $safeName = $row.candidateName.Replace("|","\\|")
  $lines.Add("| $($row.figure) | $($row.expectedFrozenVersion) | $($row.confidence) | $safeName | $shortHash | R1 candidate only |")
}
$lines.Add("")
$lines.Add("## Promotion rule")
$lines.Add("")
$lines.Add("No candidate advances to R2 until a human/visual comparison confirms that its composition matches the frozen final hostile-review/composite lock for that figure. No candidate advances to R3 until deterministic typography, scientific labels/brakes, alt text, web proof, screenshot safety, and print proof are complete.")
$lines | Set-Content -LiteralPath $mdOut -Encoding UTF8

Write-Host "PUB-8J candidate intake complete."
Write-Host "JSON: $jsonOut"
Write-Host "CSV : $csvOut"
Write-Host "MD  : $mdOut"
Write-Host "Candidates mapped to Figures 2-16: $($ordered.Count)"
