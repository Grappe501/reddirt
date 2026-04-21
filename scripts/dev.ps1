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
try {
    docker compose up -d
    Write-Host "✓ Compose up" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker Compose failed — start Docker Desktop?" -ForegroundColor Yellow
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
