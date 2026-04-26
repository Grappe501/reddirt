# Kelly SOS — Day 6 deploy QA + Day 7 demo (combined)

**Doc ID:** KELLY-D6D7-1  
**Last updated:** 2026-04-26

## Section 2 (detailed) — counsel, treasurer, preview smoke, demo

Full procedure, code map, RACI, and exit criteria: [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md).  
Sign-off template: [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md).  
Preview smoke script: `scripts/section2-preview-smoke.ps1`.

## Section 3 — launch lock & post-launch backlog

[`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md) — Steve go/no-go table, P0/P1/P2, deferred template work, optional `git tag`.

---

## Day 6 — Deploy & staging smoke

1. **Netlify (or host)** — `netlify.toml` → **`bash scripts/netlify-build.sh`** (`migrate deploy` + `npm run build`); Neon users: `NETLIFY_DATABASE_URL` mapped to `DATABASE_URL` when unset. Details: [`deployment.md`](./deployment.md).  
2. **Env** — set at minimum: `DATABASE_URL`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL`. Optional: `OPENAI_API_KEY`, SendGrid/Twilio (see [`.env.example`](../.env.example)).  
3. **After deploy** — `GET /` loads; **`GET /privacy`**, `/terms`, `/disclaimer` return 200 on the **same host** you are launching (preview vs apex may differ).  
4. **Forms** — run [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) against **Netlify deploy preview** or **staging** base URL (fake data only).  
5. **Admin** — log in; confirm **workbench** loads without console errors.  
6. **Log** — append `KELLY_SOS_BUILD_LOG.md` with “Section 1 / deploy QA” notes and date.  
7. **CI** — `.github/workflows/check.yml` runs **`npm run check`** with Postgres (no substitute for hosted smoke).

## Day 7 — 10-minute demo script (Steve / stakeholder)

1. **Home** — hero, paid-for in footer, no broken nav.  
2. **Issue** — `/priorities` or `/direct-democracy` (2 min).  
3. **County or event** — `/county-briefings` or `/events` (1–2 min).  
4. **Donate** — click through to external processor; return (1 min).  
5. **Volunteer** — `/get-involved` — show form; **do not** submit PII in a live demo; or use staging with fake data (2 min).  
6. **Admin** — show **login** and **workbench** “open work” count only (2 min).  
7. **Close** — “Legal pages are draft; counsel finalizes; intake path is workbench + human follow-up per SLA.”

## Launch lock (go / no-go)

- [x] `npm run check` green locally and/or via `.github/workflows/check.yml` (or known exceptions in build log).  
- [x] **Form smoke** logged — **local dev** `http://localhost:3001` (2026-04-26); **Netlify deploy preview** smoke still recommended before apex ([`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md)).  
- [x] Treasurer/counsel — **documented waiver / pending formal initials** ([`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md)).  
- [x] Backlog items listed in `KELLY_SOS_LAUNCH_STATUS` known risks (includes Section 2 follow-ups / formal signatures).

*End KELLY-D6D7-1*
