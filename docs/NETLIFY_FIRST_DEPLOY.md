# Netlify — first production deploy (Kelly SOS / RedDirt)

Use this when the site has never successfully built on Netlify or the database is empty.

## 1. Repository wiring

| Situation | Netlify setting |
|-----------|-----------------|
| Git root is **`SOSWebsite`** with subfolders `RedDirt/`, `sos-public/` | **Base directory:** `RedDirt` |
| Git root **is** the RedDirt app only | Base directory: *(empty)* |

**Branch:** deploy from the branch you actually push (e.g. `main`).

## 2. Environment variables (Site → Environment variables)

**Required for a working public site + API routes**

| Variable | Notes |
|---------|--------|
| `DATABASE_URL` | **Hosted** Postgres only (e.g. Neon). Must **not** be `127.0.0.1` or `localhost` — that is your **local Docker** URL from `.env.example`; Netlify cannot reach your computer. Copy the connection string from the Neon project (or use Netlify’s Neon integration so `NETLIFY_DATABASE_URL` is set; the build script maps it when `DATABASE_URL` is unset). |
| `ADMIN_SECRET` | Non-empty string; **required** for `/admin` (middleware blocks misconfiguration). |

**Strongly recommended**

| Variable | Notes |
|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, **no trailing slash**. Use your Netlify URL, e.g. `https://yoursite.netlify.app` — avoid `www.` on `*.netlify.app` (TLS mismatch). |

**Optional**

| Variable | Notes |
|---------|--------|
| `OPENAI_API_KEY` | RAG search answers, ingest, intake classification |
| `SKIP_DB_SEED` | Set to `1` to **skip** `prisma db seed` on build (default is **to seed**). |

Never put secrets in `NEXT_PUBLIC_*`.

## 3. What the build runs

`bash scripts/netlify-build.sh`:

1. `npx prisma generate`
2. `npx prisma migrate deploy`
3. `npx prisma db seed` (unless `SKIP_DB_SEED=1`)
4. `npm run build`

## 4. Trigger a deploy

**From Netlify UI:** Deploys → **Trigger deploy** → **Deploy site**.

**From your machine** (after `npx netlify login` and `npx netlify link` inside `RedDirt/`):

```bash
cd RedDirt
npx netlify deploy --build --prod
```

## 5. If the build still fails

1. Open **Deploy log** → find the first `ERROR` or `exit code 1`.
2. **`DATABASE_URL` missing** — set it or finish Neon linking (`NETLIFY_DATABASE_URL`).
3. **Migration error** — fix migration state in the **same** DB Netlify uses (not a different local DB).
4. **Prisma binary** — `schema.prisma` includes `rhel-openssl-3.0.x` for Linux builders; if the error is binary-related, say so in a ticket and check Prisma `binaryTargets`.
5. **Clear cache** — Deploys → **Clear cache and deploy site**.

## 6. After the site is up

- Smoke public routes (`/`, `/privacy`, `/get-involved`, etc.).
- Optional: run search ingest from a secure context (`npm run ingest`) — **not** part of Netlify build by design (see `deployment.md`).
- Intake: see `docs/KELLY_SOS_INTAKE_SMOKE.md` for a safe POST test (fake data).
