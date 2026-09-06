$ErrorActionPreference='Stop'
Write-Host 'PUB-9A — RC1 Final Release Proof + Publication Freeze'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8z-figure-recovery-closure.ps1
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8y-release-candidate.ps1
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node .\research\macroscopic-life\scripts\freeze-book-one-rc1.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
Write-Host 'PUB-9A PASS — MACROSCOPIC LIFE BOOK ONE RC1 IS FROZEN.'
Write-Host 'Next phase: export, layout, accessibility, print/web proof, and distribution. Do not reopen frozen science/prose without a new version.'
