$ErrorActionPreference='Stop'

Write-Host 'PUB-9C-R12 — Revised Exact-Anchor + 46-Note Injection Proof'

powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r10-revised-reader-preflight.ps1
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}

node .\research\macroscopic-life\scripts\validate-pub-9c-46-slot-architecture.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}

node .\research\macroscopic-life\scripts\reconcile-pub-9c-exact-endnote-anchors.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}

node .\research\macroscopic-life\scripts\inject-pub-9c-controlled-endnotes.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}

node .\research\macroscopic-life\scripts\proof-pub-9c-post-injection-integrity.mjs
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}

Write-Host 'PUB-9C-R12 PASS — 46-slot anchor reconciliation and endnote integrity proof complete.'
