param(
  [Parameter(Mandatory=$true)][ValidateRange(2,16)][int]$Figure,
  [Parameter(Mandatory=$true)][string]$ProofManifest,
  [string]$RegistryPath = "src/content/macroscopic-life/figure-publication-registry.json",
  [string]$PublicDir = "public/macroscopic-life/figures"
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  Write-Error $Message
  exit 1
}

function Ensure-Directory([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

if (-not (Test-Path -LiteralPath $ProofManifest -PathType Leaf)) {
  Fail "Proof manifest not found: $ProofManifest"
}
if (-not (Test-Path -LiteralPath $RegistryPath -PathType Leaf)) {
  Fail "Figure publication registry not found: $RegistryPath"
}

$manifest = Get-Content -LiteralPath $ProofManifest -Raw | ConvertFrom-Json
$key = $Figure.ToString("00")
$figId = "fig-$key"

if ("$($manifest.figureId)" -ne $figId) {
  Fail "Proof manifest figure mismatch. Expected $figId, found '$($manifest.figureId)'."
}
if ("$($manifest.recoveryClass)" -ne "R3") {
  Fail "Promotion refused. Proof manifest is not R3. Found '$($manifest.recoveryClass)'."
}
if (-not [bool]$manifest.publicationReady -or -not [bool]$manifest.promoted) {
  Fail "Promotion refused. Proof manifest does not assert publicationReady=true and promoted=true."
}

foreach ($field in @("deterministicTypography","scientificLabels","quantitativeCopy","altText","webProof","mobileProof","screenshotSafety","printProof")) {
  if (-not ($manifest.checks.PSObject.Properties.Name -contains $field) -or -not [bool]$manifest.checks.$field) {
    Fail "Promotion refused. R3 proof gate '$field' is not PASS."
  }
}

$sourceAsset = "$($manifest.publicAssetPath)"
if ([string]::IsNullOrWhiteSpace($sourceAsset) -or -not (Test-Path -LiteralPath $sourceAsset -PathType Leaf)) {
  Fail "Promoted R3 asset not found at manifest path: $sourceAsset"
}

$actualHash = (Get-FileHash -LiteralPath $sourceAsset -Algorithm SHA256).Hash.ToLowerInvariant()
$manifestHash = "$($manifest.publicAssetSha256)".ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($manifestHash) -or $actualHash -ne $manifestHash) {
  Fail "Promotion refused. Public asset SHA-256 does not match R3 proof manifest."
}

Ensure-Directory $PublicDir
$canonicalDiskPath = Join-Path $PublicDir "$figId.webp"
if ((Resolve-Path $sourceAsset).Path -ne (Resolve-Path $canonicalDiskPath -ErrorAction SilentlyContinue).Path) {
  Copy-Item -LiteralPath $sourceAsset -Destination $canonicalDiskPath -Force
}

$canonicalHash = (Get-FileHash -LiteralPath $canonicalDiskPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($canonicalHash -ne $manifestHash) {
  Fail "Canonical public asset hash differs after copy."
}

$registry = Get-Content -LiteralPath $RegistryPath -Raw | ConvertFrom-Json
if (-not ($registry.figures.PSObject.Properties.Name -contains $figId)) {
  Fail "Registry does not contain $figId."
}

$entry = $registry.figures.$figId
$entry.status = "publication-ready"
$entry.publicAssetPath = "/macroscopic-life/figures/$figId.webp"
$entry.sha256 = $canonicalHash
$entry.proofManifest = $ProofManifest.Replace("\\","/")

$registry | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $RegistryPath -Encoding UTF8

Write-Host "PUB-8M promotion complete for Figure $Figure."
Write-Host "Canonical asset: $canonicalDiskPath"
Write-Host "SHA-256: $canonicalHash"
Write-Host "Registry: $RegistryPath"
Write-Host "Status: publication-ready"
