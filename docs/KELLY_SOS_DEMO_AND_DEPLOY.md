# Kelly SOS — Day 6 deploy QA + Day 7 demo (combined)

**Doc ID:** KELLY-D6D7-1  
**Last updated:** 2026-04-26

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
- [ ] **Hosted** form smoke on agreed **Netlify preview** (or staging) URL logged — not localhost only.  
- [ ] Treasurer/counsel sign-off on **paid-for** and **public legal** pages or documented waiver.  
- [ ] Backlog items listed in `KELLY_SOS_LAUNCH_STATUS` known risks.

*End KELLY-D6D7-1*
