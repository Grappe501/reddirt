$ErrorActionPreference='Stop'
Write-Host 'PUB-8Z — Figure Binary Recovery Closure + R3 Promotion Audit'
$root='.\research\macroscopic-life\scripts'
# Existing recovery/proof machinery is intentionally reused. No figure redesign occurs here.
$steps=@(
 'recover-figure-binaries.ps1',
 'verify-recovered-figure-candidates.ps1'
)
foreach($s in $steps){$p=Join-Path $root $s;if(!(Test-Path $p)){Write-Host "BLOCKED: missing existing recovery step $s";exit 2};powershell -ExecutionPolicy Bypass -File $p;if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}}
Write-Host 'Recovery and candidate verification complete. Run the repository R2/R3 promotion controls for every verified candidate requiring promotion before closure audit.'
node .\research\macroscopic-life\scripts\audit-figure-r3-closure.mjs
if($LASTEXITCODE -ne 0){Write-Host 'PUB-8Z remains BLOCKED. Resolve only listed recovery/promotion gaps; DO NOT redesign figures.';exit $LASTEXITCODE}
Write-Host 'PUB-8Z PASS — Figures 2–16 verified R3 15/15.'
