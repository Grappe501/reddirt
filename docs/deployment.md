# Deployment (Netlify + Next.js)

## Netlify build

Configured in `netlify.toml`:

- **Build command:** `bash scripts/netlify-build.sh` — runs **`prisma generate`** → **`prisma migrate deploy`** → **`prisma db seed`** (unless skipped) → **`next build`**.
- **DATABASE_URL:** required before Prisma runs. On Netlify, the **Neon** integration often injects `NETLIFY_DATABASE_URL`; the script copies it to `DATABASE_URL` when the latter is unset (see `scripts/netlify-build.sh`).
- **Seed:** The production build runs `prisma db seed` by default so a fresh hosted database gets baseline rows (site settings, demo county scaffolding, workflow templates — idempotent upserts). To **skip** seed (faster CI or DB already seeded), set **`SKIP_DB_SEED=1`** in Netlify environment variables.
- **Seed schema-drift fallback:** if seed fails with `P2022` on `County.displayName` (hosted DB drift), you can temporarily set **`ALLOW_PRISMA_SEED_P2022_BYPASS=1`** to continue `next build`. Preferred quick unblock remains **`SKIP_DB_SEED=1`**. Remove bypass once DB schema is reconciled.
- **Failed migration (P3009):** If Netlify logs `migrate found failed migrations in the target database`, Prisma will not apply new migrations until the failed name is cleared. After the migration SQL is fixed in the repo, set **`PRISMA_RESOLVE_ROLLED_BACK`** to the **exact** failed migration folder name (e.g. `20260516143000_communication_intelligence_ingest`), redeploy once, then **delete** that env var. The build script runs `prisma migrate resolve --rolled-back "$PRISMA_RESOLVE_ROLLED_BACK"` before `migrate deploy`. Use only when the failed migration **fully rolled back** (PostgreSQL aborted the transaction); if objects were left half-applied, fix the DB manually or with counsel before resolving.
- **If `migrate deploy` fails again after a resolve:** Prisma marks that migration **failed** again (P3018). Leave **`PRISMA_RESOLVE_ROLLED_BACK`** set to the **same** migration name for **one more** deploy after pushing the SQL fix, or run `npx prisma migrate resolve --rolled-back <name>` locally against `DATABASE_URL`, then redeploy. Remove the env var once **`migrate deploy`** completes.
- **Plugin:** `@netlify/plugin-nextjs`
- **Node:** 20 (see `[build.environment]` in `netlify.toml`)

### Monorepo (`SOSWebsite` root on GitHub)

If the Git repo root contains **both** `sos-public/` and `RedDirt/`, in Netlify:

1. **Site settings → Build & deploy → Continuous deployment → Build settings**
2. Set **Base directory** to **`RedDirt`** (so Netlify reads `RedDirt/netlify.toml` and runs commands from that folder).
3. **Publish directory** is managed by `@netlify/plugin-nextjs`; do not set a custom publish dir unless Netlify docs require it for your plugin version.

If the repo is **only** the `RedDirt` project, leave base directory empty.

**Netlify checklist (one line):** point production at the right branch (usually `main`), set **Base directory** to `RedDirt` only when the GitHub repo root is the full monorepo—if the repo *is* this app at root, leave base empty.

## Required environment variables (production)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres connection string for **runtime** Prisma queries (pooler or direct per provider docs). |
| `DIRECT_URL` | Yes | **Required** — `prisma/schema.prisma` uses `directUrl = env("DIRECT_URL")` for **migrations** and introspection. **Local Docker:** set to the **same** URI as `DATABASE_URL`. **Live RedDirt Supabase DB:** often set `DATABASE_URL` to **session pooler** and `DIRECT_URL` to **direct** or **session** URI from that Supabase project’s Connect UI when the transaction pooler (`6543` / `pgbouncer=true`) cannot run `migrate deploy`. Never commit values. |
| `ADMIN_SECRET` | Yes (admin) | Public admin board; omit only if you intentionally disable non-login admin routes — see `middleware` |
| `OPENAI_API_KEY` | Optional | Search RAG + form intake classification + **Email Command Center** advisory queue analysis (`EMAIL-AI-INTELLIGENCE-1.0`) |
| `OPENAI_MODEL` | Optional | Defaults in `.env.example` |
| `OPENAI_EMBEDDING_MODEL` | Optional | For ingest + query embeddings |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for Open Graph (no trailing slash). On Netlify’s default `*.netlify.app` hostname, **do not use `www.`** — the certificate covers `kgrappe.netlify.app` only; `www.kgrappe.netlify.app` breaks TLS (`ERR_CERT_COMMON_NAME_INVALID`). |
| `SENDGRID_*` / `TWILIO_*` | Optional | Comms + **Email Command Center SendGrid foundation** — see [`.env.example`](../.env.example). **`POST /api/sendgrid/events`** requires signed webhook verification in **production** (`SENDGRID_WEBHOOK_VERIFICATION_KEY` or `SENDGRID_WEBHOOK_PUBLIC_KEY` PEM). Legacy Comms path: **`POST /api/webhooks/sendgrid`**. |
| **Gmail (staff / Command Center)** | Optional | `GOOGLE_GMAIL_*` or `GOOGLE_CLIENT_ID` / `GOOGLE_CALENDAR_*` fallbacks, `GOOGLE_GMAIL_REDIRECT_URI` (or `NEXT_PUBLIC_SITE_URL` for default callback), **`GMAIL_TOKEN_ENCRYPTION_KEY`** (new connects), **`GMAIL_OAUTH_STATE_SECRET`** or **`ADMIN_SECRET`**, optional **`GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH`**, **`GOOGLE_PUBSUB_TOPIC`** + optional **`GMAIL_WATCH_LABEL_IDS`** / **`GMAIL_WATCH_RENEWAL_DAYS`** for **`users.watch`**, **`GMAIL_PUBSUB_VERIFICATION_TOKEN`** (or **`GOOGLE_PUBSUB_VERIFICATION_TOKEN`**) + request header **`x-gmail-pubsub-token`** for **`POST /api/gmail/pubsub`** — see `.env.example` (names only here) |
| `ELEVENLABS_API_KEY` | Optional | Admin-only TTS: `POST /api/ask-kelly/tts` (ElevenLabs). Omit if you do not need read-aloud on `/admin/ask-kelly`. |
| `ELEVENLABS_VOICE_ID` | Optional | Required **with** `ELEVENLABS_API_KEY` for TTS. Choose a voice in the ElevenLabs library. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase **SSR / Auth** project URL (`@supabase/ssr`). **Does not** configure Prisma — see [Supabase SSR / Auth vs Prisma Postgres](#supabase-ssr--auth-vs-prisma-postgres-supabase-canonical-db-and-env-gate-10). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Public anon / publishable key for Supabase browser + server clients. **Not** a substitute for `DATABASE_URL`. |

Never expose server secrets via `NEXT_PUBLIC_*`.

## Supabase SSR / Auth vs Prisma Postgres (`SUPABASE-CANONICAL-DB-AND-ENV-GATE-1.0`)

RedDirt uses **two independent environment groups**. Do not conflate them.

| Group | Variables | Used for |
|-------|-----------|----------|
| **Supabase SSR / Auth (public)** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `@supabase/ssr` in `src/utils/supabase/*`, middleware session refresh. **Not** read by Prisma. |
| **Prisma database** | `DATABASE_URL`, `DIRECT_URL` | Prisma Client at runtime, **`prisma migrate deploy`**, introspection (`schema.prisma` `url` + `directUrl`). **Not** the Supabase publishable key. |

- **Local Docker** often uses the **same** `DATABASE_URL` and `DIRECT_URL` string; Supabase public vars may be unset (SSR auth inactive) or set to a **different** Supabase project — avoid accidental split-brain in production unless Steve documents an intentional layout.
- **`npm run email:db:diagnose`** prints **presence only** for the public Supabase pair (no values) alongside Prisma URL diagnostics.
- **Canonical Supabase DB** (Kelly SOS live Postgres) is **verified** for contact imports only when **`npm run email:contact-import:gate`** (and the operator chain before it) succeeds with **`DATABASE_URL` / `DIRECT_URL`** pointed at that hosted project — not merely when `NEXT_PUBLIC_SUPABASE_*` is set.

**Secrets hygiene:** Do **not** commit `.env`, `.env.local`, or any file containing real API keys. Keep templates in [`.env.example`](../.env.example) with empty or placeholder values only.

**After changing environment variables in the Netlify UI** (any site): trigger a new **deploy** so serverless functions and the build see the new values; variable-only changes do not always hot-reload an existing deploy.

## After first deploy

1. Run migrations (already in build command).
2. Run **`npm run ingest`** from a secure context with `DATABASE_URL` + `OPENAI_API_KEY` if you want search chunks populated (not part of default Netlify build — often a manual or scheduled job).
3. Verify forms and analytics hit the production DB (see `docs/KELLY_SOS_INTAKE_SMOKE.md` for a one-shot POST test).
4. **Legal** — `/privacy` and `/terms` ship as **draft** structures; replace with **counsel-approved** copy when ready.

## Manual today

- **Search index:** ingest is not in the Netlify build (by design — avoids build-time OpenAI cost and long builds).
- **Legal / FEC:** `CampaignPaidForBar` + `CAMPAIGN_POLICY_V1` drive the paid-for line; `/disclaimer` references the same; counsel finalizes policy pages in `/privacy` and `/terms`.
- **CI:** `.github/workflows/check.yml` runs `npm run check` against a **Postgres 15** service (migrate deploy + full gate). **`nightly-self-build.yml`** remains lighter (preflight + typecheck + artifact).

## Prisma migrate vs `npm run check` (honest sequencing)

- **`npm run check`** alone runs lint + TypeScript + **`next build`**. It does **not** run **`prisma migrate deploy`**. A green check **does not prove** migrations applied to your database.
- When you need **both**: run from `RedDirt/`:

  ```bash
  npx prisma migrate deploy && npm run check
  ```

  Package alias: **`npm run email:command-center:migrate-and-check`**.

- **PowerShell:** `command1; command2` runs both even if `command1` fails; the shell exit code is from **`command2`**. Prefer **`&&`** when migration failure must stop before check.
- **Email Command Center DB gate:** **`npm run email:command-center:preflight`** (or **`npm run email:gmail:preflight`**) verifies `DATABASE_URL`, **`DIRECT_URL`**, **DNS**, **connectivity**, **`StaffGmailAccount.gmailSyncState`**, and the **five** Email Command Center migration rows in **`_prisma_migrations`** — without printing secrets.
- **Safe DB diagnostics (no secrets):** **`npm run email:db:diagnose`** — Supabase **public** env **presence** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, names only) **plus** Prisma URL **shape** (protocol/host/port/db name/username **shape**), DNS, TCP/Prisma probe, optional **`prisma migrate status`** (stdout redacted), ECC migration checklist, and a **contact-import gate** prerequisite hint (the full gate is **not** run inside diagnose).
- **Do not import bulk contact lists until:** **`npm run email:contact-import:gate`** succeeds (`migrate deploy` → preflight → `npm run check`) against the **Canonical Supabase DB** (live RedDirt/Kelly SOS Postgres) you intend to use for production contact truth — not only local Docker. See [`email-command-center-contact-import-readiness.md`](./email-command-center-contact-import-readiness.md).

## Canonical Supabase DB (live RedDirt / Kelly SOS Postgres)

- **Canonical Supabase DB** (also referred to as **Live RedDirt Supabase DB** until Steve confirms the Supabase **project** display name) is the intended **canonical** hosted Postgres for **real** contact import commits. **Local Docker** remains for build/dev and does **not** prove hosted Supabase readiness.
- **Operator steps (secrets stay in the dashboard / env UI only):**
  1. Supabase Dashboard → open the **correct** Supabase project (the one that should hold the RedDirt schema and contact data — verify host / project ref matches **`DATABASE_URL`** / **`DIRECT_URL`**; confirm naming with Steve).
  2. **Project Settings → Database** (or **Connect**) → copy fresh **Connection string** / **Session pooler** / **Direct** URIs as documented for Prisma.
  3. Set **`DATABASE_URL`** and **`DIRECT_URL`** in Netlify (production/deploy previews) and locally in `.env` / `.env.local` — **never** commit `.env`.
  4. From `RedDirt/`: **`npm run email:db:diagnose`** → **`npx prisma migrate status`** → **`npx prisma migrate deploy`** → **`npm run email:command-center:preflight`** → **`npm run email:contact-import:gate`**.
- **Until that gate passes on the Canonical Supabase DB**, treat real list imports as **blocked** even if local Docker is green.
- **Common Supabase failures (safe categories):** wrong **project** / ref (string points at a different Supabase project); wrong **password** or password not **URL-encoded**; **session pooler** username must be `postgres.<projectRef>` on `pooler.supabase.com`, not bare `postgres`; **transaction** pooler (`6543`, `pgbouncer=true`) for `DATABASE_URL` without a working **`DIRECT_URL`** for migrations; project **paused** on free tier; **IPv6-only** direct host without pooler on IPv4-only CI (see below).

### Diagnose output — how to read failures (no secrets)

Use **`npm run email:db:diagnose`** after changing env. Match redacted errors to these **categories** (fix in Supabase / env UI, not in repo):

| Category | Typical signal (wording varies) |
|----------|----------------------------------|
| Wrong project ref / tenant | `tenant` + `user` mismatch, wrong **project ref** in hostname or username |
| Wrong password | `password authentication failed`, `P1000` |
| Password not URL-encoded | Parse OK but auth fails after paste from password manager — re-copy with encoding from Connect UI |
| Wrong pooler mode / port | `6543` + `pgbouncer` for migrate-only workloads; use **session** or **direct** per Supabase Prisma docs |
| `DIRECT_URL` missing / wrong | `prisma generate` / preflight fails “`DIRECT_URL` missing”; or migrate errors on transaction pooler |
| Network / DNS | `ENOTFOUND`, `ECONNREFUSED`, DNS failure in diagnose |
| Migration failure | `migrate status` not clean — run **`migrate deploy`** against the **same** DB you diagnosed |

## Database URL strategy (`DATABASE_URL` vs `DIRECT_URL`)

- **`DATABASE_URL`** — **runtime** queries (Next.js server, Prisma Client). Use the string your host documents for **application** or **session** access.
- **`DIRECT_URL`** — **required** in `schema.prisma` as `directUrl`. Prisma uses it for **`migrate deploy`** / introspection. **Local:** duplicate `DATABASE_URL`. **Supabase split:** when the runtime string is a **transaction** pooler, set `DIRECT_URL` to the **direct** or **session** connection string from the Connect UI so migrations are not blocked by PgBouncer transaction mode.
- **Netlify:** `scripts/netlify-build.sh` sets **`DIRECT_URL="$DATABASE_URL"`** when `DIRECT_URL` is unset, so single-URI hosts (Neon, one-string Supabase) keep working. For **explicit** pooler/direct split on Supabase, set **both** vars in the Netlify UI (do not rely on the default mirror).
- **Netlify retry/bypass controls for transient Supabase outages:**
  - `PRISMA_MIGRATE_RETRIES` (default `3`)
  - `PRISMA_MIGRATE_RETRY_DELAY_SECONDS` (default `8`)
  - `ALLOW_PRISMA_P1001_BYPASS` (`1`/`true`/`yes`): only bypasses **P1001** after retries and continues to `next build` (seed skipped). Intended for deploy previews or emergency frontend deploys.
  - `PRISMA_MIGRATE_OPTIONAL_IN_DEPLOY_PREVIEW` (default `1`): automatically enables bypass in Netlify `deploy-preview` context unless explicitly disabled.
  - `ALLOW_PRISMA_SEED_P2022_BYPASS` (`1`/`true`/`yes`): bypasses only seed-time `P2022` for missing `County.displayName` to unblock deploys while drift is being repaired.
- **Supabase-style setups:** copy hosts, ports, usernames, and `sslmode` from the **Connect** UI. Prefer **session pooler** or **direct** strings that match Prisma’s expectations for **migrations**; **transaction pooler** is often for **serverless runtime**, not necessarily for **`migrate deploy`**. **URL-encode** passwords with special characters.
- **Alignment:** keep **local** `.env`, **Netlify** (or other host) env, and **Cursor terminal** env consistent for the database you think you are testing — mismatches produce “green check + red preflight” confusion.

## Kelly SOS — deploy QA checklist (Section 1)

Use after a Netlify **production** or **deploy-preview** build:

1. **Env in Netlify UI** — same variable **names** as the **Required environment variables (production)** table above; confirm `DATABASE_URL` (or Neon-linked `NETLIFY_DATABASE_URL`), **`DIRECT_URL`** (set explicitly for Supabase pooler/direct **split**; otherwise build script mirrors `DATABASE_URL`), `ADMIN_SECRET`, and `NEXT_PUBLIC_SITE_URL` for the target site.
2. **Read-only routes** — `GET /`, `GET /privacy`, `GET /terms`, `GET /disclaimer`, `GET /get-involved`, `GET /donate` should return **200** on the **same** deployment you are certifying (preview URL vs public domain may differ).
3. **Forms** — run [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) against the **preview or staging** base URL with fake data; avoid polluting production with test rows unless Steve approves.
4. **Log** — append [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) with date and “Section 1 / deploy QA” notes.

*The public apex domain may lag a Netlify deploy or point at a different stack; always smoke the exact hostname you intend to launch.*

## Supabase + Netlify (P1001 “Can’t reach database server”)

Supabase’s **direct** connection string (`db.<project>.supabase.co:5432`) uses **IPv6 by default**. Many CI hosts (including Netlify builds) only route **IPv4**, so Prisma fails with **P1001** before auth.

**Fix:** In the Supabase dashboard, open **Connect** and copy the **Session pooler** URI (host like `aws-0-<region>.pooler.supabase.com`, port **5432**, username `postgres.<project-ref>`). Use that as **`DATABASE_URL`** in Netlify (keep `sslmode=require` / password encoding as shown in the dashboard).

Alternatives: enable Supabase’s **[IPv4 add-on](https://supabase.com/docs/guides/platform/ipv4-address)** for direct connections, or use **Transaction pooler** (port **6543**) for serverless runtime only — Prisma needs `?pgbouncer=true` there; for **`prisma migrate deploy`** on Netlify, prefer **Session pooler** unless Supabase’s docs for your tier say otherwise.

Also confirm the Supabase project is **not paused** (free-tier pause can look like a reachability failure).

## Runtime caveats

- API routes need `DATABASE_URL` at runtime on Netlify (serverless functions).
- Prisma binary: `schema.prisma` includes `binaryTargets` for deployment platforms; adjust if you change hosts.

## Local vs production

- Local: `docker-compose.yml` Postgres.
- Production: managed Postgres; use connection pooling if your provider recommends it.
