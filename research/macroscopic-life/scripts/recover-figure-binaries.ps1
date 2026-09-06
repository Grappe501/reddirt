param(
  [string[]]$Roots = @(
    "H:\SOSWebsite\RedDirt",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Pictures",
    "$env:USERPROFILE\Desktop"
  ),
  [string]$OutputDir = "H:\SOSWebsite\RedDirt\research\macroscopic-life\recovery",
  [int]$MaxResults = 2000
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# PUB-8I — READ-ONLY workstation recovery scanner.
# This script does not move, copy, rename, delete, or modify candidate assets.

$extensions = @(".png", ".jpg", ".jpeg", ".webp", ".svg", ".tif", ".tiff")
$keywords = @(
  "macroscopic",
  "figure",
  "fig-",
  "fig_",
  "sensory",
  "landscape",
  "individuality",
  "boundary",
  "bioelectric",
  "body electric",
  "morphogenesis",
  "missing limb",
  "memory",
  "prediction",
  "collective intelligence",
  "civilization",
  "model competition",
  "microbe"
)

$finalVersionHints = @{
  2 = @("v4", "figure 2", "fig-02", "fig02")
  3 = @("v4", "figure 3", "fig-03", "fig03")
  4 = @("v4", "figure 4", "fig-04", "fig04")
  5 = @("v3", "figure 5", "fig-05", "fig05")
  6 = @("v3", "figure 6", "fig-06", "fig06")
  7 = @("v3", "figure 7", "fig-07", "fig07")
  8 = @("v2", "figure 8", "fig-08", "fig08")
  9 = @("v2", "figure 9", "fig-09", "fig09")
  10 = @("v3", "figure 10", "fig-10", "fig10")
  11 = @("v2", "figure 11", "fig-11", "fig11")
  12 = @("v3", "figure 12", "fig-12", "fig12")
  13 = @("v3", "figure 13", "fig-13", "fig13")
  14 = @("v3", "figure 14", "fig-14", "fig14")
  15 = @("v3", "figure 15", "fig-15", "fig15")
  16 = @("figure 16", "fig-16", "fig16")
}

function Get-FigureGuess {
  param([string]$Text)
  $lower = $Text.ToLowerInvariant()
  foreach ($n in 2..16) {
    $tokens = @(
      "figure $n",
      "figure-$n",
      "figure_$n",
      "fig-$('{0:d2}' -f $n)",
      "fig_$('{0:d2}' -f $n)",
      "fig$('{0:d2}' -f $n)",
      "fig $n"
    )
    foreach ($token in $tokens) {
      if ($lower.Contains($token)) { return $n }
    }
  }
  return $null
}

function Get-RelevanceScore {
  param(
    [System.IO.FileInfo]$File,
    [Nullable[int]]$FigureGuess
  )

  $text = ($File.FullName + " " + $File.Name).ToLowerInvariant()
  $score = 0
  $reasons = New-Object System.Collections.Generic.List[string]

  foreach ($keyword in $keywords) {
    if ($text.Contains($keyword)) {
      $score += 2
      $reasons.Add("keyword:$keyword")
    }
  }

  if ($null -ne $FigureGuess) {
    $score += 10
    $reasons.Add("figure:$FigureGuess")
    foreach ($hint in $finalVersionHints[[int]$FigureGuess]) {
      if ($text.Contains($hint)) {
        $score += 4
        $reasons.Add("final-hint:$hint")
      }
    }
  }

  if ($File.DirectoryName -match "macroscopic-life|macroscopic_life|macroscopic life") {
    $score += 8
    $reasons.Add("macroscopic-path")
  }

  if ($File.Length -gt 250KB) {
    $score += 1
    $reasons.Add("image-sized")
  }

  if ($File.LastWriteTime -ge [datetime]"2026-09-04" -and $File.LastWriteTime -le [datetime]"2026-09-07") {
    $score += 4
    $reasons.Add("production-window")
  }

  [pscustomobject]@{
    Score = $score
    Reasons = ($reasons -join ";")
  }
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$candidates = New-Object System.Collections.Generic.List[object]

foreach ($root in $Roots) {
  if (-not (Test-Path -LiteralPath $root)) {
    Write-Warning "Root not found: $root"
    continue
  }

  Write-Host "Scanning $root ..."

  Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
    ForEach-Object {
      $file = $_
      $figureGuess = Get-FigureGuess -Text $file.FullName
      $rank = Get-RelevanceScore -File $file -FigureGuess $figureGuess

      if ($rank.Score -gt 0) {
        $hash = $null
        try {
          $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
        } catch {
          $hash = "HASH_ERROR"
        }

        $candidates.Add([pscustomobject]@{
          figure_guess = if ($null -eq $figureGuess) { "" } else { [int]$figureGuess }
          score = $rank.Score
          reasons = $rank.Reasons
          file_name = $file.Name
          extension = $file.Extension.ToLowerInvariant()
          bytes = $file.Length
          last_write_time = $file.LastWriteTime.ToString("o")
          full_path = $file.FullName
          sha256 = $hash
        })
      }
    }
}

$sorted = $candidates |
  Sort-Object -Property @{Expression="score";Descending=$true}, @{Expression="figure_guess";Descending=$false}, @{Expression="last_write_time";Descending=$true} |
  Select-Object -First $MaxResults

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$jsonPath = Join-Path $OutputDir "pub-8i-figure-binary-candidates-$timestamp.json"
$csvPath = Join-Path $OutputDir "pub-8i-figure-binary-candidates-$timestamp.csv"
$mdPath = Join-Path $OutputDir "pub-8i-figure-binary-summary-$timestamp.md"

$sorted | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
$sorted | Export-Csv -LiteralPath $csvPath -NoTypeInformation -Encoding UTF8

$byFigure = foreach ($n in 2..16) {
  $items = @($sorted | Where-Object { $_.figure_guess -eq $n })
  [pscustomobject]@{
    Figure = $n
    CandidateCount = $items.Count
    TopCandidate = if ($items.Count -gt 0) { $items[0].full_path } else { "" }
    TopScore = if ($items.Count -gt 0) { $items[0].score } else { 0 }
  }
}

$summaryLines = New-Object System.Collections.Generic.List[string]
$summaryLines.Add("# PUB-8I Workstation Figure Binary Recovery Summary")
$summaryLines.Add("")
$summaryLines.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')")
$summaryLines.Add("")
$summaryLines.Add("This scan is read-only with respect to candidate assets. It only writes recovery reports to the configured output directory.")
$summaryLines.Add("")
$summaryLines.Add("| Figure | Candidate count | Top score | Top candidate |")
$summaryLines.Add("|---:|---:|---:|---|")
foreach ($row in $byFigure) {
  $safePath = $row.TopCandidate.Replace("|", "\|")
  $summaryLines.Add("| $($row.Figure) | $($row.CandidateCount) | $($row.TopScore) | $safePath |")
}
$summaryLines.Add("")
$summaryLines.Add("## Next step")
$summaryLines.Add("")
$summaryLines.Add("Do not move or publish a candidate based on filename alone. Compare each strong candidate against the frozen hostile-review/composite specification and advance only R0 -> R1 -> R2 -> R3.")

$summaryLines | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host ""
Write-Host "Recovery scan complete."
Write-Host "JSON: $jsonPath"
Write-Host "CSV : $csvPath"
Write-Host "MD  : $mdPath"
Write-Host ""
$byFigure | Format-Table -AutoSize
