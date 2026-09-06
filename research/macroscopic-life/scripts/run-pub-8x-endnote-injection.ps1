$ErrorActionPreference='Stop'
Write-Host 'PUB-8X — Controlled Endnote Marker Injection + Integrity Proof'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8w-scholarly-apparatus.ps1
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node .\research\macroscopic-life\scripts\inject-controlled-endnotes.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node .\research\macroscopic-life\scripts\proof-post-injection-manuscript-integrity.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
Write-Host 'PUB-8X PASS — derivative endnoted reader master built; frozen clean master preserved.'
