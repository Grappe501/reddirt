# Red Dirt — Windows one-step dev launcher
# Usage: .\scripts\dev.ps1   (from repo root, or: powershell -File scripts/dev.ps1)

$ErrorActionPreference = "Continue"
Set-Location (Join-Path $PSScriptRoot "..")

# Machine-level DATABASE_URL overrides Prisma's .env — drop it for this session so repo .env wins.
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Red Dirt — dev launcher" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.local") -and -not (Test-Path ".env")) {
    Write-Host "No .env.local or .env — copy .env.example to .env.local" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "→ Docker Compose…"
$composeOk = $false
docker compose up -d
if ($LASTEXITCODE -eq 0) {
    $composeOk = $true
    Write-Host "✓ Compose up" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker Compose failed — start Docker Desktop?" -ForegroundColor Yellow
}
if ($composeOk) {
    Write-Host "→ waiting for Postgres (pg_isready)…" -NoNewline
    $ready = $false
    for ($i = 0; $i -lt 45; $i++) {
        docker compose exec -T db pg_isready -U reddirt -d reddirt 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    Write-Host ""
    if ($ready) { Write-Host "✓ Postgres ready" -ForegroundColor Green }
    else { Write-Host "⚠ Postgres not ready — check: docker compose logs db" -ForegroundColor Yellow }
}
Write-Host ""

Write-Host "→ prisma generate…"
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "→ prisma migrate deploy…"
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ migrate deploy failed — try: npx prisma migrate dev" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "→ prisma db seed…"
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ seed failed (optional on repeat runs)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "→ next dev…" -ForegroundColor Cyan
npx next dev
