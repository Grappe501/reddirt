$ErrorActionPreference='Stop'
Write-Host 'PUB-8Y — Publication Package Assembly + Release Candidate Manifest'
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8x-endnote-injection.ps1
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
node .\research\macroscopic-life\scripts\build-book-one-release-candidate-manifest.mjs
if($LASTEXITCODE -ne 0){
 Write-Host 'PUB-8Y BLOCKED — inspect release/book-one-rc1-manifest.json. A figure R3 verification blocker is expected until recovered production binaries are proven.'
 exit $LASTEXITCODE
}
Write-Host 'PUB-8Y PASS — Book One RC1 package is release-candidate ready.'
