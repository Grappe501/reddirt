$ErrorActionPreference='Stop'
Write-Host 'PUB-9C-R15 — Revised RC1 + Figure Recovery Merge Gate'

Write-Host '1/3 Run revised 46-note scholarly integrity chain'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r14-approved-scholarly-integrity.ps1

Write-Host '2/3 Audit recovered Figure 2–16 R3 binaries'
node .\research\macroscopic-life\scripts\audit-figure-r3-closure.mjs

Write-Host '3/3 Build revised RC1 manifest'
node .\research\macroscopic-life\scripts\build-pub-9c-revised-rc1-manifest.mjs

Write-Host ''
Write-Host 'PASS: PUB-9C RC1 merge gate satisfied.'
Write-Host 'This does not redesign figures and does not independently prove deployment.'
Write-Host 'Next operation after PASS: deterministic publication freeze against the RC1 manifest hashes.'
