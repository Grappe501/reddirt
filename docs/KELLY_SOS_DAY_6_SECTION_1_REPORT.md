# Kelly SOS — Day 6 Section 1 completion (deploy QA + CI)

**Date:** 2026-04-26  
**Scope:** `H:\SOSWebsite\RedDirt`  
**Reference:** [`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md), [`deployment.md`](./deployment.md)

## Objectives (Section 1)

1. Netlify/host documentation matches repo (`netlify.toml`, `scripts/netlify-build.sh`).
2. Env parity checklist for operators (Kelly SOS subsection in `deployment.md`).
3. Route smoke pattern documented; optional **hosted** read-only checks recorded.
4. Intake smoke script supports **deploy-preview** base URL (`KELLY_SOS_INTAKE_SMOKE.md`).
5. Non-disruptive **CI** for `npm run check` with Postgres (`.github/workflows/check.yml`).
6. Build log updated.

## What changed

| Item | Status |
|------|--------|
| **`docs/deployment.md`** | Build command corrected to `bash scripts/netlify-build.sh`; `NETLIFY_DATABASE_URL` behavior documented; Kelly SOS Section 1 checklist added; CI file referenced. |
| **`docs/KELLY_SOS_DEMO_AND_DEPLOY.md`** | Day 6 steps aligned with `netlify-build.sh` and CI. |
| **`docs/KELLY_SOS_INTAKE_SMOKE.md`** | PowerShell example uses `$base` for preview/staging/local. |
| **`.github/workflows/check.yml`** | New: Postgres 15 service, `prisma migrate deploy`, `npm run check`, placeholder `ADMIN_SECRET` for CI only. |

## Hosted read-only smoke (automated snapshot)

**Host tested:** `https://www.kellygrappe.com` (public apex — may or may not be the current RedDirt Netlify deploy).

| Route | Result (snapshot) |
|-------|-------------------|
| `GET /` | **200** — Kelly SOS home content |
| `GET /donate` | **200** — donate page with paid-for framing |
| `GET /privacy` | **404** |
| `GET /terms` | **404** |
| `GET /get-involved` | **404** |

**Interpretation:** The apex domain is **not** serving the full RedDirt `(site)` route map as of this check, or another stack is fronting the domain. **Section 1 is complete for repo-side deliverables;** operators must run legal + get-involved smoke on the **exact Netlify hostname** they plan to launch (e.g. **deploy preview** after a PR) before claiming parity.

## Intake POST on hosted origin

**Not run** against `www.kellygrappe.com` here — avoids test rows in an unknown production DB. Use a **deploy preview URL** + [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) with `$base` set to that origin.

**Local / Docker proof** remains in [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) (Day 3 E2E).

## CI

On push/PR to `main`/`master`: **Quality gate (npm run check)** runs with migrations applied. First run requires GitHub Actions enabled for the repository.

## Remaining (Section 2–3, not Section 1)

- Counsel/treasurer gates, go/no-go, launch lock ([`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md) § Launch lock).
- Hosted **`POST /api/forms`** smoke on an agreed **non-production** Netlify URL.
- Optional: browser pass **`/admin/workbench`** on preview with `ADMIN_SECRET`.

*End KELLY-D6-S1*
