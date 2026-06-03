# Debate week — intelligence live on Netlify (fast path)

## One site, intelligence-only profile (current production setup)

`netlify.toml` sets:

```toml
NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE = "opposition_debate"
```

That enables:

- Smaller server handler (excludes campaign-events/county JSON from the function bundle)
- Sidebar = **Debate week** links only (no legacy site nav)
- Middleware sends non-intelligence `/admin/*` → `/admin/intelligence`
- Login default → `/admin/intelligence`

## Operator URLs (after deploy)

| Surface | URL |
|---------|-----|
| Login | `/admin/login` |
| Start here | `/admin/intelligence` |
| Debate command | `/admin/intelligence/debate-command` |
| Debate prep | `/admin/intelligence/kim-hammer/debate-prep` (not `/admin/kim-hammer/...`) |

## Netlify checklist

1. **Base directory** = `RedDirt` (if GitHub repo is SOSWebsite monorepo).
2. **Production branch** = `main`.
3. **Env (required):** `DATABASE_URL`, `DIRECT_URL`, `ADMIN_SECRET`.
4. **Env (already in toml):** `NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE=opposition_debate` — do not unset during debate week.
5. Optional faster build: `SKIP_DB_SEED=1` if DB already seeded.

## Verify locally before push

```bash
cd RedDirt
npx tsx scripts/test-opposition-workbench-debate-prep.ts
npx tsx scripts/test-debate-week-readiness.ts
```

## Turn off after debate

Remove or comment `NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE` in `netlify.toml` and redeploy to restore full Campaign OS admin.

Multi-site chunking (later): `docs/NETLIFY_MULTI_SITE_CHUNKING.md`.
