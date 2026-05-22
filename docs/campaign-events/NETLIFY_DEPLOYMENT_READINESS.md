# Netlify deployment readiness — Kelly Campaign OS (RedDirt)

**Branch under test:** `feature/kelly-schedule-settlement-dashboard`  
**Last local stabilization pass:** 2026-05-22  
**Scope:** Campaign OS / `/admin` — stabilization sprint, not new features.

---

## Build configuration

| Setting | Value |
|--------|--------|
| **Build command** | `bash scripts/netlify-build.sh` (see `netlify.toml`) |
| **Publish directory** | `.next` (Next.js runtime; do not point publish at repo root) |
| **Node version** | `20` (`netlify.toml` `[build.environment]`) |
| **Heap** | `NODE_OPTIONS=--max-old-space-size=6144` |
| **Plugin** | `@netlify/plugin-nextjs` |

### What `scripts/netlify-build.sh` runs (order)

1. Map `NETLIFY_DATABASE_URL` → `DATABASE_URL` when unset; trim quotes; reject localhost URLs.
2. Default `DIRECT_URL` to `DATABASE_URL` when unset (Supabase pooler setups).
3. `npx prisma generate`
4. Optional one-time: `PRISMA_RESOLVE_ROLLED_BACK=<migration>` if a failed migration blocks deploy.
5. `npx prisma migrate deploy`
6. `npx prisma db seed` unless `SKIP_DB_SEED=1` (or `true` / `yes`)
7. `npm run build` (`next build` — includes `tsc` + ESLint per Next config)

### Monorepo base directory

If the Git remote root is `SOSWebsite` (not RedDirt alone), set Netlify **Base directory** to `RedDirt` (folder containing this `netlify.toml`).

---

## Required environment variables (production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Hosted Postgres URI (`postgresql://` or `postgres://`). **Must not** be `127.0.0.1` / `localhost` on Netlify. |
| `DIRECT_URL` | Prisma direct URL when pooler requires split; script mirrors `DATABASE_URL` if omitted. |
| `ADMIN_SECRET` | Non-empty; `/admin` middleware blocks misconfiguration without it. |

**Supabase session pooler:** user must be `postgres.<projectRef>`, not bare `postgres` (build script validates).

---

## Strongly recommended

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, no trailing slash (OG/metadata, links). |

---

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `NETLIFY_DATABASE_URL` | Neon/Netlify integration; mapped to `DATABASE_URL` at build if `DATABASE_URL` unset. |
| `SKIP_DB_SEED` | `1` / `true` / `yes` — skip `prisma db seed` on build. |
| `OPENAI_API_KEY` | RAG, ingest, intake classification (server-only). |
| `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL` | Model overrides. |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_*` | Email transport when enabled. |
| `GOOGLE_CALENDAR_CLIENT_*`, `GOOGLE_GMAIL_*` | Calendar/Gmail OAuth. |
| `ELEVENLABS_*` | Optional TTS on `/admin/ask-kelly`. |
| `NEXT_PUBLIC_SUPABASE_*` | Auth/session only — **not** a substitute for `DATABASE_URL`. |

See `.env.example` for the full template. **Never commit** `.env` / `.env.local`.

---

## Disabled-by-default / risky features

These gates protect production until operators explicitly enable them:

| Variable | Default behavior | Risk if enabled without review |
|----------|------------------|--------------------------------|
| `EMAIL_SEND_ENABLED` | Off / falsy — approval and mass paths log `skipped_disabled` | Live email to real recipients |
| `GOOGLE_CALENDAR_WRITE_ENABLED` | Off — promotion UI dry-run / blocked writes | Live Google Calendar mutations |
| Mass comms command center | No send from `/admin/communications` V1 | Bulk outreach |

**SendGrid webhooks:** `SENDGRID_WEBHOOK_VERIFICATION_KEY` required in production for `POST /api/sendgrid/events`.

**Cron routes:** festival ingest, media monitor, calendar cron — require secrets (`*_CRON_SECRET`); not part of Netlify build.

---

## Prisma notes

- **Build-time DB access:** Netlify build must reach the **same** hosted DB you use in production (migrations + optional seed).
- **Binary targets:** `schema.prisma` should include Linux OpenSSL targets for Netlify builders (`rhel-openssl-3.0.x` if documented in repo).
- **Failed migration recovery:** set `PRISMA_RESOLVE_ROLLED_BACK` once per failed migration name, deploy, then **remove** the variable.
- **Local-only:** `npm run dev:prepare` runs `migrate deploy` against your local `.env` — do not assume Netlify applied the same migrations until deploy log shows success.

---

## File-backed JSON storage warnings

Several Campaign OS modules read/write under `data/campaign-events/` (and related paths) via Node `fs`:

- Event blueprints (`data/campaign-events/event-blueprints/`)
- County memory (`data/campaign-events/county-memory/`)
- Reimbursement month ops (`data/campaign-events/finance/reimbursement-ops/`)
- User observations (`data/campaign-events/user-observations.json`)
- Agent runtime audit (`data/campaign-events/agent-runtime-audit.json`)
- Volunteer CRM JSON under `data/campaign-events/volunteers/`

**Netlify serverless / read-only filesystem:** writes from server actions or API routes may **fail or not persist** across deploys unless you use external storage or commit seed files into the repo. Treat file stores as **dev/staging convenience** unless Steve approves a persistence strategy (DB columns, S3, etc.).

**Git hygiene:** do not commit live PII in observation/audit JSON; prefer empty/seed indexes only.

---

## Local verification commands (RedDirt root)

```powershell
cd H:\SOSWebsite\RedDirt
npm install
npm run dev:prepare
npx prisma validate
npm run typecheck
npm run build
```

Netlify-equivalent (requires hosted `DATABASE_URL` in shell, bash on PATH):

```bash
bash scripts/netlify-build.sh
```

### Campaign OS script smoke (representative)

```powershell
npm run agents:test-dashboard-nav
npm run agents:test-single-campaign-hardening
npm run agents:test-sprint-10
npm run agents:test-runtime
npm run agents:test-observations
npm run campaign-events:test-planning-drilldown
npm run campaign-events:test-finance-operations
npm run campaign-events:verify-travel-queues -- 2026-03
npm run campaign-events:seed-march
npm run campaign-events:seed-april
npm run campaign-events:seed-may
```

**Known script limitation (not a Netlify build blocker):** `agents:test-os-control` and `campaign-events:test-hot-wash-intelligence` import chains that load `server-only` modules (`blueprint-store`, `event-intelligence-persist`). `tsx` CLI tests throw; **Next production build succeeds** because those modules run only in Server Components / server actions.

---

## Post-deploy verification routes

After deploy, with `ADMIN_SECRET` session:

| Route | Check |
|-------|--------|
| `/admin/login` | 200, form loads |
| `/admin/ai-command-center` | Loads after auth |
| `/admin/campaign-manager-dashboard` | Dashboard snapshot |
| `/admin/candidate-dashboard` | Candidate view |
| `/admin/campaign-events/workbench?month=2026-03` | Ledger workbench |
| `/admin/campaign-events/reimbursement?month=2026-03` | Reimbursement |
| `/admin/campaign-events/travel-log?month=2026-03` | Travel log |
| `/admin/campaign-events/review?month=2026-03` | Review queue |
| `/admin/campaign-events/calendar-sync?month=2026-03` | Sync health |
| `/admin/campaign-events/calendar-promotion` | Promotion (write gated) |
| `/admin/campaign-events/media-approval` | Media approval |
| `/admin/communications` | Comms command center (no mass send) |
| `/admin/volunteers` | Volunteer OS |
| `/admin/onboarding` | Onboarding |

Public smoke: `/`, `/privacy`, `/get-involved` — see `docs/NETLIFY_FIRST_DEPLOY.md`.

---

## Known limitations

1. **File-backed stores** may not persist on Netlify serverless (see above).
2. **Heavy admin pages** — first dev request can exceed 30s (cold compile); production uses built bundles.
3. **Search ingest** — `npm run ingest` is manual/scheduled, not part of Netlify build.
4. **Multi-tenant / campaign tenancy** — migration `20260521140000_campaign_tenancy_foundation` must be applied on hosted DB before features depending on it work.
5. **Remote CI** — local `typecheck` + `build` green does not replace Netlify deploy log review.

---

## Related docs

- `docs/NETLIFY_FIRST_DEPLOY.md` — first-time Netlify + env setup
- `docs/netlify-production-retry-readiness.md` — migration-history / retry governance
- `docs/campaign-events/GOOGLE_PROMOTION_SAFETY.md` — calendar write gates
- `docs/campaign-events/APPROVAL_PACKAGE_EMAIL_WORKFLOW.md` — email send gates

---

## Stabilization pass snapshot (2026-05-22)

| Check | Result |
|-------|--------|
| `npm run typecheck` | Clean |
| `npm run build` | Clean (~11 min local; `globals.css` os-* classes must not use `@apply` with opacity on CSS-var colors) |
| Prisma validate | Valid |
| `dev:prepare` | Applied `20260521140000_campaign_tenancy_foundation` on local hosted DB |
| Feature branch HEAD | `f79fc58` Volunteer OS foundation (+ this doc when committed) |

**Main merge:** defer until Netlify production deploy is green and Steve approves merge.
