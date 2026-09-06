$ErrorActionPreference = 'Stop'

Write-Host 'PUB-9C-R10 — Revised Reader + Scholarly Preflight'
Write-Host '1/3 Promote frozen R1 sources into PUB-9C reader derivatives'
node .\research\macroscopic-life\scripts\promote-pub-9c-r9-reader-revisions.mjs

Write-Host '2/3 Materialize revised five-act reader master'
node .\research\macroscopic-life\scripts\materialize-book-one-master-pub-9c.mjs

Write-Host '3/3 Build verified BIB-001..033 bibliography'
node .\research\macroscopic-life\scripts\build-final-book-one-bibliography-pub-9c.mjs

$master = '.\research\macroscopic-life\manuscript\book-one-master-pub-9c-reader-materialized.md'
$biblio = '.\research\macroscopic-life\manuscript\book-one-final-verified-bibliography-pub-9c.md'
if (!(Test-Path $master)) { throw "Missing revised master: $master" }
if (!(Test-Path $biblio)) { throw "Missing revised bibliography: $biblio" }

Write-Host ''
Write-Host 'PASS: PUB-9C revised reader preflight artifacts exist.'
Write-Host 'Historical PUB-7L R1 files remain untouched.'
Write-Host 'IMPORTANT: legacy 45-slot exact-anchor/injection harness is NOT run here.'
Write-Host 'Next gate: amend the exact-anchor/endnote insertion architecture from 45 to 46 slots, then regenerate anchors against this revised physical master.'
