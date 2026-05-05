# Deployment (Netlify + Next.js)

## Netlify build

Configured in `netlify.toml`:

- **Build command:** `bash scripts/netlify-build.sh` — runs **`prisma generate`** → **`prisma migrate deploy`** → **`prisma db seed`** (unless skipped) → **`next build`**.
- **DATABASE_URL:** required before Prisma runs. On Netlify, the **Neon** integration often injects `NETLIFY_DATABASE_URL`; the script copies it to `DATABASE_URL` when the latter is unset (see `scripts/netlify-build.sh`).
- **Seed:** The production build runs `prisma db seed` by default so a fresh hosted database gets baseline rows (site settings, demo county scaffolding, workflow templates — idempotent upserts). To **skip** seed (faster CI or DB already seeded), set **`SKIP_DB_SEED=1`** in Netlify environment variables.
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
| `DATABASE_URL` | Yes | Hosted Postgres connection string |
| `ADMIN_SECRET` | Yes (admin) | Public admin board; omit only if you intentionally disable non-login admin routes — see `middleware` |
| `OPENAI_API_KEY` | Optional | Search RAG + form intake classification + **Email Command Center** advisory queue analysis (`EMAIL-AI-INTELLIGENCE-1.0`) |
| `OPENAI_MODEL` | Optional | Defaults in `.env.example` |
| `OPENAI_EMBEDDING_MODEL` | Optional | For ingest + query embeddings |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for Open Graph (no trailing slash). On Netlify’s default `*.netlify.app` hostname, **do not use `www.`** — the certificate covers `kgrappe.netlify.app` only; `www.kgrappe.netlify.app` breaks TLS (`ERR_CERT_COMMON_NAME_INVALID`). |
| `SENDGRID_*` / `TWILIO_*` | Optional | Comms + **Email Command Center SendGrid foundation** — see [`.env.example`](../.env.example). **`POST /api/sendgrid/events`** requires signed webhook verification in **production** (`SENDGRID_WEBHOOK_VERIFICATION_KEY` or `SENDGRID_WEBHOOK_PUBLIC_KEY` PEM). Legacy Comms path: **`POST /api/webhooks/sendgrid`**. |
| **Gmail (staff / Command Center)** | Optional | `GOOGLE_GMAIL_*` or `GOOGLE_CLIENT_ID` / `GOOGLE_CALENDAR_*` fallbacks, `GOOGLE_GMAIL_REDIRECT_URI` (or `NEXT_PUBLIC_SITE_URL` for default callback), **`GMAIL_TOKEN_ENCRYPTION_KEY`** (new connects), **`GMAIL_OAUTH_STATE_SECRET`** or **`ADMIN_SECRET`**, optional **`GMAIL_OAUTH_INCLUDE_SEND_FOR_WORKBENCH`**, **`GOOGLE_PUBSUB_TOPIC`** + optional **`GMAIL_WATCH_LABEL_IDS`** / **`GMAIL_WATCH_RENEWAL_DAYS`** for **`users.watch`**, **`GMAIL_PUBSUB_VERIFICATION_TOKEN`** (or **`GOOGLE_PUBSUB_VERIFICATION_TOKEN`**) + request header **`x-gmail-pubsub-token`** for **`POST /api/gmail/pubsub`** — see `.env.example` (names only here) |
| `ELEVENLABS_API_KEY` | Optional | Admin-only TTS: `POST /api/ask-kelly/tts` (ElevenLabs). Omit if you do not need read-aloud on `/admin/ask-kelly`. |
| `ELEVENLABS_VOICE_ID` | Optional | Required **with** `ELEVENLABS_API_KEY` for TTS. Choose a voice in the ElevenLabs library. |

Never expose server secrets via `NEXT_PUBLIC_*`.

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
- **Email Command Center DB gate:** **`npm run email:command-center:preflight`** (or **`npm run email:gmail:preflight`**) verifies `DATABASE_URL`, connectivity, and **`StaffGmailAccount.gmailSyncState`** — without printing secrets.

## Kelly SOS — deploy QA checklist (Section 1)

Use after a Netlify **production** or **deploy-preview** build:

1. **Env in Netlify UI** — same variable **names** as the **Required environment variables (production)** table above; confirm `DATABASE_URL` or Neon-linked `NETLIFY_DATABASE_URL`, `ADMIN_SECRET`, and `NEXT_PUBLIC_SITE_URL` for the target site.
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
