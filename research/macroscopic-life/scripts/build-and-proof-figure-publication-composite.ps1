param(
  [Parameter(Mandatory=$true)][ValidateRange(2,16)][int]$Figure,
  [Parameter(Mandatory=$true)][string]$BaseImage,
  [string]$R2DecisionJson = "",
  [string]$CopyRegister = "research/macroscopic-life/visuals/figure-r3-proof-copy-v1.json",
  [string]$ProofRoot = "research/macroscopic-life/recovery/r3-proof",
  [switch]$DeterministicTypographyVerified,
  [switch]$ScientificLabelsVerified,
  [switch]$QuantitativeCopyVerified,
  [switch]$AltTextVerified,
  [switch]$WebProofVerified,
  [switch]$MobileProofVerified,
  [switch]$ScreenshotSafetyVerified,
  [switch]$PrintProofVerified,
  [switch]$Promote
)

$ErrorActionPreference = "Stop"

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

if (-not (Test-Path -LiteralPath $BaseImage -PathType Leaf)) {
  Fail "Base image not found: $BaseImage"
}
if (-not (Test-Path -LiteralPath $CopyRegister -PathType Leaf)) {
  Fail "Copy register not found: $CopyRegister"
}

$key = $Figure.ToString("00")
$figId = "fig-$key"
$copy = Get-Content -LiteralPath $CopyRegister -Raw | ConvertFrom-Json
$record = $copy.figures.$key
if ($null -eq $record) {
  Fail "No deterministic proof record found for Figure $Figure."
}

if (-not [string]::IsNullOrWhiteSpace($R2DecisionJson)) {
  if (-not (Test-Path -LiteralPath $R2DecisionJson -PathType Leaf)) {
    Fail "R2 decision JSON not found: $R2DecisionJson"
  }
  $r2 = Get-Content -LiteralPath $R2DecisionJson -Raw | ConvertFrom-Json
  $class = ""
  foreach ($field in @("recoveryClass","RecoveryClass","class","Class","decision","Decision")) {
    if ($r2.PSObject.Properties.Name -contains $field) {
      $class = "$($r2.$field)"
      break
    }
  }
  if ($class -notmatch '^R2') {
    Fail "R2 decision file does not prove an R2 state. Found: '$class'."
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$proofDir = Join-Path $ProofRoot (Join-Path $figId $timestamp)
Ensure-Directory $proofDir

$baseItem = Get-Item -LiteralPath $BaseImage
$baseHash = (Get-FileHash -LiteralPath $BaseImage -Algorithm SHA256).Hash.ToLowerInvariant()
$baseExt = $baseItem.Extension.ToLowerInvariant()
$copiedBase = Join-Path $proofDir ("approved-base" + $baseExt)
Copy-Item -LiteralPath $BaseImage -Destination $copiedBase -Force

# Write deterministic required-copy sidecar. This is authoritative text for proof,
# not an assumption that every line belongs inside a single visual footer.
$requiredCopyPath = Join-Path $proofDir "required-deterministic-copy.txt"
$copyLines = New-Object System.Collections.Generic.List[string]
$copyLines.Add("Figure $Figure")
$copyLines.Add("Frozen version: $($record.frozenVersion)")
$copyLines.Add("Lock commit: $($record.lockCommit)")
$copyLines.Add("")
$copyLines.Add("Required deterministic brake / firewall copy:")
foreach ($line in @($record.requiredBrakes)) {
  $copyLines.Add("- $line")
}
$copyLines | Set-Content -LiteralPath $requiredCopyPath -Encoding UTF8

# Produce a normalized WebP candidate when ImageMagick is present. This does not
# certify scientific copy; it merely creates a stable export candidate for proof.
$magick = Get-Command magick -ErrorAction SilentlyContinue
$normalizedWebp = Join-Path $proofDir "$figId-proof.webp"
$normalizationStatus = "not-run"
if ($null -ne $magick) {
  & $magick.Source $copiedBase -strip -quality 92 $normalizedWebp
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $normalizedWebp)) {
    Fail "ImageMagick normalization failed for $BaseImage"
  }
  $normalizationStatus = "webp-created"
} else {
  $normalizationStatus = "ImageMagick-not-installed; source copy retained for proof"
}

$checks = [ordered]@{
  deterministicTypography = [bool]$DeterministicTypographyVerified
  scientificLabels = [bool]$ScientificLabelsVerified
  quantitativeCopy = [bool]$QuantitativeCopyVerified
  altText = [bool]$AltTextVerified
  webProof = [bool]$WebProofVerified
  mobileProof = [bool]$MobileProofVerified
  screenshotSafety = [bool]$ScreenshotSafetyVerified
  printProof = [bool]$PrintProofVerified
}

$allVerified = $true
foreach ($value in $checks.Values) {
  if (-not $value) { $allVerified = $false }
}

$r3Eligible = $allVerified -and ($normalizationStatus -eq "webp-created")

$manifest = [ordered]@{
  generatedUtc = (Get-Date).ToUniversalTime().ToString("o")
  figure = $Figure
  figureId = $figId
  frozenVersion = "$($record.frozenVersion)"
  canonicalLockCommit = "$($record.lockCommit)"
  sourceBasePath = $baseItem.FullName
  sourceBaseSha256 = $baseHash
  sourceBaseSizeBytes = $baseItem.Length
  proofDirectory = (Resolve-Path $proofDir).Path
  normalizedWebp = if (Test-Path -LiteralPath $normalizedWebp) { (Resolve-Path $normalizedWebp).Path } else { $null }
  normalizationStatus = $normalizationStatus
  deterministicCopyRegister = $CopyRegister
  requiredBrakes = @($record.requiredBrakes)
  checks = $checks
  recoveryClass = if ($r3Eligible) { "R3-CANDIDATE" } else { "R2-PROOF-INCOMPLETE" }
  publicationReady = $false
  promoted = $false
}

if ($Promote) {
  if (-not $r3Eligible) {
    Fail "Promotion refused. R3 proof is incomplete. All verification switches and a successful normalized WebP export are required."
  }

  $publicDir = "public/macroscopic-life/figures"
  Ensure-Directory $publicDir
  $publicPath = Join-Path $publicDir "$figId.webp"
  Copy-Item -LiteralPath $normalizedWebp -Destination $publicPath -Force
  $publicHash = (Get-FileHash -LiteralPath $publicPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $manifest.publicationReady = $true
  $manifest.promoted = $true
  $manifest.recoveryClass = "R3"
  $manifest.publicAssetPath = $publicPath
  $manifest.publicAssetSha256 = $publicHash
}

$manifestPath = Join-Path $proofDir "r3-proof-manifest.json"
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

$mdPath = Join-Path $proofDir "R3-PROOF.md"
$md = New-Object System.Collections.Generic.List[string]
$md.Add("# Figure $Figure — R3 Publication Proof")
$md.Add("")
$md.Add("Frozen version: **$($record.frozenVersion)**")
$md.Add("")
$md.Add("Lock commit: `$($record.lockCommit)`")
$md.Add("")
$md.Add("Base SHA-256: `$baseHash`")
$md.Add("")
$md.Add("Normalization: **$normalizationStatus**")
$md.Add("")
$md.Add("## Required deterministic brakes")
$md.Add("")
foreach ($line in @($record.requiredBrakes)) { $md.Add("- $line") }
$md.Add("")
$md.Add("## R3 checks")
$md.Add("")
foreach ($entry in $checks.GetEnumerator()) {
  $mark = if ($entry.Value) { "PASS" } else { "OPEN" }
  $md.Add("- $($entry.Key): **$mark**")
}
$md.Add("")
$md.Add("## State")
$md.Add("")
$md.Add("**$($manifest.recoveryClass)**")
if ($manifest.promoted) {
  $md.Add("")
  $md.Add("Promoted to canonical public asset path after proof gate passed.")
} else {
  $md.Add("")
  $md.Add("No publication promotion occurred. The existing deterministic SVG fallback remains authoritative on the live site.")
}
$md | Set-Content -LiteralPath $mdPath -Encoding UTF8

Write-Host "PUB-8L proof package created for Figure $Figure."
Write-Host "Proof directory: $proofDir"
Write-Host "State: $($manifest.recoveryClass)"
if ($manifest.promoted) { Write-Host "Published asset: $($manifest.publicAssetPath)" }
