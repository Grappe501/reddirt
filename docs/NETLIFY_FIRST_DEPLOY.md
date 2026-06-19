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

**Lambda env cap (Lambda compatibility mode only):** If deploy fails at **Deploy site** with `Invalid AWS Lambda parameters` / `Failed to create function`, the build succeeded but AWS rejected the function. Most common fix: reduce env vars injected into `___netlify-server-handler`.

| Scope in Netlify UI | Variables |
|---------------------|-----------|
| **Builds only** | `PRISMA_*`, `ALLOW_*`, `SKIP_DB_SEED`, `NODE_OPTIONS`, `NODE_VERSION`, **all `NEXT_PUBLIC_*`** (inlined at build time) |
| **Functions** (runtime) | `DATABASE_URL`, `DIRECT_URL`, `ADMIN_SECRET`, `ELECTION_PLAN_PASSWORD`, API keys your routes actually read at runtime |

Also check **Team settings → Environment variables** for shared vars scoped to **All** or **Functions**.

**Note:** Build logs may show `FEATURE_FLAGS` (~9 KB) — Netlify-internal platform JSON. On **Lambda compatibility mode** that alone exceeds AWS’s 4 KB env cap. Modern Netlify Functions runtime (June 2026+) removed the limit — if scoping vars does not fix deploy, ask Netlify support to confirm the site is not stuck on compatibility mode.

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

## 6. Build green, deploy red (`Invalid AWS Lambda parameters`)

Symptom: log shows `Starting to deploy site from '.next'` then `Failed to upload file: ___netlify-server-handler` with HTTP 400.

**Root cause:** AWS Lambda rejects the function when **environment variables** injected into `___netlify-server-handler` exceed **4,096 bytes** total (keys + values), or when **`NODE_OPTIONS=--max-old-space-size=6144`** reaches the function (invalid for Lambda memory). Netlify **Lambda compatibility mode** also counts internal **`FEATURE_FLAGS`** (~9 KB) toward that cap — modern Functions runtime (June 2026+) removes the limit.

**GitHub Actions (automated scoping):** Add repo secrets `NETLIFY_AUTH_TOKEN` (personal access token) and `NETLIFY_SITE_ID`. The `Netlify production deploy gate` workflow runs `npm run netlify:env:scopes` on each push to `main` when both secrets are set.

### Fix in Netlify UI (do this first)

Site configuration → **Environment variables** → for **each** row below, click **Edit** → **Scopes** → choose **Builds** only (uncheck Functions / All):

**Or automate (recommended):** from `RedDirt/` after `npx netlify login` or with a personal access token:

```bash
NETLIFY_AUTH_TOKEN=your_token NETLIFY_SITE_ID=your_site_id npm run netlify:env:scopes:dry
NETLIFY_AUTH_TOKEN=your_token NETLIFY_SITE_ID=your_site_id npm run netlify:env:scopes
```

Then **Clear cache and deploy site**.

| Variable | Scope |
|----------|--------|
| All `NEXT_PUBLIC_*` (including from `netlify.toml`) | **Builds only** |
| `NODE_OPTIONS`, `NODE_VERSION`, `NPM_CONFIG_PRODUCTION` | **Builds only** (heap is set in `scripts/netlify-build.sh` during `next build` only — not in `netlify.toml`) |
| `PRISMA_MIGRATE_RETRIES`, `PRISMA_MIGRATE_RETRY_DELAY_SECONDS` | **Builds only** |
| `ALLOW_PRISMA_P1001_BYPASS`, `ALLOW_PRISMA_SEED_P2022_BYPASS` | **Builds only** |
| `SKIP_DB_SEED` | **Builds only** |

Keep on **Functions** (or **All** if you accept the size budget):

| Variable | Scope |
|----------|--------|
| `DATABASE_URL`, `DIRECT_URL` | Functions |
| `ADMIN_SECRET`, `ELECTION_PLAN_PASSWORD` | Functions |
| `OPENAI_*`, `SENDGRID_*`, `TWILIO_*`, `GOOGLE_CALENDAR_*`, `ELEVENLABS_*` | Functions (only keys your live routes use) |

Also check **Team settings → Environment variables** for shared vars scoped to **All** — those count toward every function.

After scoping: **Deploys → Clear cache and deploy site**.

### Build log checks

1. **`Lambda env check`** — runtime user env should be **under ~3 KB**; worst-case line includes build-only leak if `NEXT_PUBLIC_*` are scoped to All. Build should **fail** before deploy when worst-case ≥ 4 KB.
2. **`Prune server handler (pre-deploy)`** — measured size must stay **under 245 MB**.
3. **`Lambda deploy env check`** (plugin) — repeats the scoping checklist before upload. A green build followed by `Failed to upload file: ___netlify-server-handler` means scopes were not applied or the site is on Lambda compat mode — run `npm run netlify:env:scopes` and redeploy.

### If scoping is correct and deploy still fails

1. Open a Netlify support ticket: ask to confirm **modern Functions runtime** (not Lambda compatibility mode) for `___netlify-server-handler` — `FEATURE_FLAGS` alone exceeds 4 KB on compat mode.
2. **Base directory** — repo root should be the RedDirt app; **Publish** = `.next` (empty override is fine).
3. **Clear cache and deploy site**.

## 7. After the site is up

- Smoke public routes (`/`, `/privacy`, `/get-involved`, etc.).
- Optional: run search ingest from a secure context (`npm run ingest`) — **not** part of Netlify build by design (see `deployment.md`).
- Intake: see `docs/KELLY_SOS_INTAKE_SMOKE.md` for a safe POST test (fake data).
