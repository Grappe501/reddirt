<#
.SYNOPSIS
  Kelly SOS Section 2 — hosted smoke: GET critical routes + POST /api/forms (fake data only).

.PARAMETER BaseUrl
  Deploy preview, staging, or local origin (no trailing slash). If `next dev` says port in use, try http://localhost:3001. Example preview: https://deploy-preview-12--mysite.netlify.app

.PARAMETER SkipPost
  If set, only runs GET checks (no form submission).

.EXAMPLE
  .\scripts\section2-preview-smoke.ps1 -BaseUrl "https://YOUR-PREVIEW.netlify.app"
#>

param(
  [Parameter(Mandatory = $true)]
  [string] $BaseUrl,

  [switch] $SkipPost
)

$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd("/")

$routes = @(
  "/",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/get-involved",
  "/donate"
)

Write-Host "Section 2 preview smoke — GET checks — $base" -ForegroundColor Cyan
$failed = @()
foreach ($path in $routes) {
  $uri = "$base$path"
  try {
    $r = Invoke-WebRequest -Uri $uri -Method GET -UseBasicParsing -MaximumRedirection 5
    $code = $r.StatusCode
    if ($code -ge 200 -and $code -lt 400) {
      Write-Host "  OK $code  $path"
    }
    else {
      Write-Host "  FAIL $code  $path" -ForegroundColor Yellow
      $failed += $path
    }
  }
  catch {
    Write-Host "  FAIL $path  $($_.Exception.Message)" -ForegroundColor Red
    $failed += $path
  }
}

if ($failed.Count -gt 0) {
  Write-Host "`nGET failures: $($failed -join ', ')" -ForegroundColor Red
  exit 1
}

if ($SkipPost) {
  Write-Host "`n-SkipPost: no POST performed. Append GET-only note to build log if appropriate." -ForegroundColor Cyan
  exit 0
}

$body = @{
  formType = "join_movement"
  name     = "Section 2 Preview Smoke"
  email    = "section2-smoke@example.com"
  zip      = "72201"
  interests = @()
  message  = "Automated Section 2 hosted verification — safe test data."
} | ConvertTo-Json

Write-Host "`nPOST /api/forms (join_movement)..." -ForegroundColor Cyan
try {
  $resp = Invoke-RestMethod -Method POST -Uri "$base/api/forms" -Body $body -ContentType "application/json; charset=utf-8"
  if ($resp.ok) {
    Write-Host "  OK ok=true submissionId=$($resp.submissionId) workflowIntakeId=$($resp.workflowIntakeId)"
  }
  else {
    Write-Host "  Unexpected JSON: $($resp | ConvertTo-Json -Compress)" -ForegroundColor Red
    exit 1
  }
}
catch {
  Write-Host "  POST failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host "`nDone. Log this run in docs/KELLY_SOS_BUILD_LOG.md (preview hostname, UTC date, ok)." -ForegroundColor Green
exit 0
