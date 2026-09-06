$ErrorActionPreference='Stop'
Write-Host 'PUB-9C-R13 — Exact Anchor Candidate + Review Gate'
Write-Host '1/3 Build revised physical master and bibliography'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r10-revised-reader-preflight.ps1
Write-Host '2/3 Validate 46-slot static architecture'
node .\research\macroscopic-life\scripts\validate-pub-9c-46-slot-architecture.mjs
Write-Host '3/3 Generate deterministic exact-anchor candidates'
node .\research\macroscopic-life\scripts\populate-pub-9c-exact-endnote-anchors.mjs
$review='.\research\macroscopic-life\manuscript\book-one-exact-endnote-anchor-review-pub-9c-v1.0.md'
if(!(Test-Path $review)){throw "BLOCKED: review report not generated: $review"}
Write-Host ''
Write-Host 'STOP FOR SCHOLARLY REVIEW.'
Write-Host "Review: $review"
Write-Host 'Edit book-one-exact-endnote-anchor-approvals-pub-9c-v1.0.json.'
Write-Host 'Only after all 46 decisions are APPROVE, run:'
Write-Host 'node .\research\macroscopic-life\scripts\approve-pub-9c-exact-endnote-anchors.mjs'
Write-Host 'Then the R12 reconciliation/injection chain may consume the approved manifest.'
