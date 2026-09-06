$ErrorActionPreference = 'Stop'
Write-Host 'PUB-8W — Exact-Anchor Reconciliation + Final Scholarly Apparatus Proof'
node .\research\macroscopic-life\scripts\materialize-book-one-master.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node .\research\macroscopic-life\scripts\build-final-book-one-bibliography.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node .\research\macroscopic-life\scripts\proof-endnote-insertion-readiness.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node .\research\macroscopic-life\scripts\reconcile-exact-endnote-anchors.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
node .\research\macroscopic-life\scripts\proof-final-scholarly-apparatus.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'PUB-8W PASS — scholarly apparatus is ready for controlled marker injection.'
