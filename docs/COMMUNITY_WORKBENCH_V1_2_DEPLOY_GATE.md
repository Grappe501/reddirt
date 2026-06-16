# Community Workbench v1.2 — Production deploy gate

Use this checklist before telling a local team the workbench is live. Scoped to **RedDirt** `/election-plan/workbenches` only.

**Related:** [`NETLIFY_FIRST_DEPLOY.md`](./NETLIFY_FIRST_DEPLOY.md) (full Netlify wiring), [`COMMUNITY_WORKBENCH_FIELD_TRAINING.md`](./COMMUNITY_WORKBENCH_FIELD_TRAINING.md) (operator walkthrough).

---

## 1. Netlify environment scoping

Before deploy, confirm in **Site configuration → Environment variables**:

| Scope | Variables |
|-------|-----------|
| **Builds only** | All `NEXT_PUBLIC_*`, `NODE_OPTIONS`, `NODE_VERSION`, `NPM_CONFIG_*`, `PRISMA_*`, `ALLOW_*`, `SKIP_DB_SEED` |
| **Functions** | `DATABASE_URL`, `DIRECT_URL`, `ADMIN_SECRET`, `ELECTION_PLAN_PASSWORD`, runtime API keys |

Also check **Team settings → Environment variables** for shared rows scoped to **All** — those inflate the Lambda env budget.

**Pass criteria:** Deploy log shows `Lambda env check` under ~3 KB and no `Invalid AWS Lambda parameters` at upload.

---

## 2. Migration verification

Build runs `prisma migrate deploy` via `scripts/netlify-build.sh`.

In the deploy log, confirm:

1. `Applying migration` includes `20260616140000_community_workbench_framework`
2. `Applying migration` includes `20260616150000_community_workbench_event_ops`
3. No `P3009` / migration ordering errors

**Local preflight (from `RedDirt/`):**

```bash
node scripts/run-with-h-drive-env.cjs npx prisma migrate status
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:qa
```

---

## 3. First live smoke test path

Use **fake data only** — no real voter or volunteer PII.

1. Open `https://<your-netlify-site>/election-plan` and sign in with Election Plan password.
2. Set operator initials (e.g. test operator from seed — `KGR`, `SGR`, or `ERN`).
3. Go to **Community Workbenches** → open **Sherwood** (or your pilot city).
4. **Leadership:** confirm Community Lead slot is visible; save a test name if empty.
5. **Events:** create event `Smoke Test Town Hall` → add 3 run-of-show rows → assign 2 volunteer roles → set event lead.
6. **Readiness:** note Events dimension % before and after saving event detail.
7. **Status:** set event to **Executed** → add actual attendance → write short AAR → set **After-action complete**.
8. **Readiness:** confirm Events (and overall) % increased.
9. **Cleanup:** delete the smoke test event or mark **Cancelled**.

**Pass criteria:** All steps complete without 401/500; readiness responds to event completion.

---

## 4. Hub validation (v1.2)

On `/election-plan/workbenches`:

- [ ] Field QA panel shows all checks green (or documented exceptions)
- [ ] Filters work: kind, owner, upcoming event, readiness band
- [ ] Missing-owner banner count matches workbenches without Community Lead
- [ ] Election Plan search finds an event title or leader name inside a workbench

---

## 5. Explicitly out of scope for this gate

- Executive Book readiness rollup
- County intelligence pages
- Cross-lane integrations (sos-public, ajax, phatlip, countyWorkbench)

---

## 6. Rollback

If deploy succeeds but workbench routes error:

1. Check Functions logs for Prisma / `DATABASE_URL` errors.
2. Confirm migrations applied on the **same** DB as `DATABASE_URL`.
3. Do **not** delete migrations — fix forward only per coordination rules.
