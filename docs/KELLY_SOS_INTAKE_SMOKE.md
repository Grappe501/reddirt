# Kelly SOS — public form → DB intake smoke (operator)

**Purpose:** Prove `POST /api/forms` → `Submission` + `WorkflowIntake` with Postgres up.

## Preconditions

1. `DATABASE_URL` points at a running database (e.g. `npm run dev:db` in `RedDirt` then `npx prisma migrate deploy`).
2. Next.js running (`npm run dev` or staging URL).

## One-shot request (PowerShell)

Set **`$base`** to your target origin (no trailing slash): local dev, **Netlify deploy preview**, or staging.

```powershell
$base = "http://localhost:3000"   # or "https://deploy-preview-123--your-site.netlify.app"

$body = @{
  formType    = "join_movement"
  name        = "Intake Smoke Test"
  email       = "smoke-test@example.com"
  zip         = "72201"
  interests   = @()
  message     = "Automated Day 3/4 verification — safe to delete."
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "$base/api/forms" -Body $body -ContentType "application/json; charset=utf-8"
```

**Expected:** HTTP 200, JSON with `ok: true`. Honeypot: omit `website` or leave empty (real browsers leave it blank; bots may fill it).

## Alternative: PowerShell bundle (GET + POST)

For deploy previews, you can run:

`.\scripts\section2-preview-smoke.ps1 -BaseUrl "https://YOUR-PREVIEW.netlify.app"`

Use `-SkipPost` for GET-only checks. See [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md) Track C.

## Verify in admin

1. Log in to `/admin` with `ADMIN_SECRET`.
2. Open **`/admin/workbench`** and confirm new **open work** / `WorkflowIntake` in **PENDING** (or use Prisma Studio / SQL with least privilege).

## Log

Append a row to [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) with date, operator, and “intake smoke OK”.

*End KELLY-INTAKE-SMOKE-1*
