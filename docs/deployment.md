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

## Required environment variables (production)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Hosted Postgres connection string |
| `ADMIN_SECRET` | Yes (admin) | Public admin board; omit only if you intentionally disable non-login admin routes — see `middleware` |
| `OPENAI_API_KEY` | Optional | Search RAG + form intake classification |
| `OPENAI_MODEL` | Optional | Defaults in `.env.example` |
| `OPENAI_EMBEDDING_MODEL` | Optional | For ingest + query embeddings |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for Open Graph (no trailing slash). On Netlify’s default `*.netlify.app` hostname, **do not use `www.`** — the certificate covers `kgrappe.netlify.app` only; `www.kgrappe.netlify.app` breaks TLS (`ERR_CERT_COMMON_NAME_INVALID`). |
| `SENDGRID_*` / `TWILIO_*` | Optional | Comms; see [`.env.example`](../.env.example); intake still saves without them |

Never expose server secrets via `NEXT_PUBLIC_*`.

## After first deploy

1. Run migrations (already in build command).
2. Run **`npm run ingest`** from a secure context with `DATABASE_URL` + `OPENAI_API_KEY` if you want search chunks populated (not part of default Netlify build — often a manual or scheduled job).
3. Verify forms and analytics hit the production DB (see `docs/KELLY_SOS_INTAKE_SMOKE.md` for a one-shot POST test).
4. **Legal** — `/privacy` and `/terms` ship as **draft** structures; replace with **counsel-approved** copy when ready.

## Manual today

- **Search index:** ingest is not in the Netlify build (by design — avoids build-time OpenAI cost and long builds).
- **Legal / FEC:** `CampaignPaidForBar` + `CAMPAIGN_POLICY_V1` drive the paid-for line; `/disclaimer` references the same; counsel finalizes policy pages in `/privacy` and `/terms`.
- **CI:** `.github/workflows/check.yml` runs `npm run check` against a **Postgres 15** service (migrate deploy + full gate). **`nightly-self-build.yml`** remains lighter (preflight + typecheck + artifact).

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
