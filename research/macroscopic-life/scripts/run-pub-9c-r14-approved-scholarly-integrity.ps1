$ErrorActionPreference='Stop'
Write-Host 'PUB-9C-R14 — Approved 46-Note Scholarly Integrity Run'

$approved='.\research\macroscopic-life\manuscript\book-one-exact-endnote-anchor-manifest-pub-9c-approved-v1.0.json'
$master='.\research\macroscopic-life\manuscript\book-one-master-pub-9c-reader-materialized.md'

Write-Host '1/5 Rebuild revised physical master + verified bibliography'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r10-revised-reader-preflight.ps1

Write-Host '2/5 Validate static 46-slot architecture'
node .\research\macroscopic-life\scripts\validate-pub-9c-46-slot-architecture.mjs

if(!(Test-Path $approved)){
  throw 'BLOCKED: approved 46-anchor manifest does not exist. Complete R13 review and run approve-pub-9c-exact-endnote-anchors.mjs first.'
}

Write-Host '3/5 Verify approved manifest still matches rebuilt master'
node .\research\macroscopic-life\scripts\verify-pub-9c-approved-anchor-manifest.mjs

Write-Host '4/5 Inject 46 controlled notes from approved manifest'
node .\research\macroscopic-life\scripts\inject-pub-9c-approved-endnotes.mjs

Write-Host '5/5 Prove post-injection integrity and scholarly closure'
node .\research\macroscopic-life\scripts\prove-pub-9c-final-scholarly-integrity.mjs

Write-Host ''
Write-Host 'PASS: PUB-9C 46-note scholarly integrity chain completed.'
Write-Host 'This PASS is valid only for the exact master SHA recorded in the approved manifest and closure report.'
