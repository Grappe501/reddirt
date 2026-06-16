# Community Workbench — pilot operator runbook (Steve)

**Purpose:** Deploy and validate Sherwood + Jacksonville before any new architecture.  
**After v1.3 commit:** Do not build new features until this runbook is complete.

**Full reference:** [`COMMUNITY_WORKBENCH_V1_3_PILOT.md`](./COMMUNITY_WORKBENCH_V1_3_PILOT.md)

---

## 1. Netlify env scoping

Netlify UI → **Site configuration → Environment variables**.

Set **Builds only** (uncheck Functions / All) for:

- All `NEXT_PUBLIC_*`
- `NODE_OPTIONS`, `NODE_VERSION`, `NPM_CONFIG_PRODUCTION`
- `PRISMA_MIGRATE_*`, `ALLOW_PRISMA_*`, `SKIP_DB_SEED`

Keep on **Functions**:

- `DATABASE_URL`, `DIRECT_URL`
- `ADMIN_SECRET`, `ELECTION_PLAN_PASSWORD`
- Runtime API keys your live routes use

Also check **Team settings → Environment variables** for rows scoped to **All**.

Local preflight (from `RedDirt/`):

```bash
node scripts/verify-netlify-lambda-env-budget.cjs
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-preflight
```

---

## 2. Deploy verification

Trigger **Clear cache and deploy site** in Netlify.

In the deploy log, confirm:

- Build completes (`npm run build` green)
- No `Invalid AWS Lambda parameters` at upload
- `Lambda env check` estimate under ~3 KB

---

## 3. Confirm migration

In the same deploy log, confirm:

- `Applying migration \`20260616140000_community_workbench_framework\``
- `Applying migration \`20260616150000_community_workbench_event_ops\``
- `Applying migration \`20260616160000_community_workbench_pilot_defects\``

Local check:

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:migration-verify
```

---

## 4. Open the workbench hub

1. Go to `https://<your-site>/election-plan` and sign in.
2. Set operator initials (seed: KGR, SGR, or ERN).
3. Open **`/election-plan/workbenches`**.
4. Confirm **Pilot validation status** panel loads (deploy checks, Sherwood, Jacksonville).
5. Confirm **Field QA** shows 14/14 (structural checks).

---

## 5. Run Sherwood smoke path

1. Open **`/election-plan/workbenches/sherwood#pilot-smoke`**.
2. Follow the 6-step path (use fake training data only — e.g. `PILOT — Sherwood town hall`).
3. Complete:
   - **Community Lead** assigned
   - **First live event** created (run-of-show + roles)
   - **First AAR** complete (`aar_complete` + body)
4. Click **Refresh validation checks** — hub should show ✓ for Sherwood auto-checks.

---

## 6. Run Jacksonville smoke path

1. Open **`/election-plan/workbenches/jacksonville#pilot-smoke`**.
2. Same three auto-checks: lead, event, AAR.
3. Optional: link a committee to the pilot event.
4. Refresh — Jacksonville auto-checks should pass.

---

## 7. Log defects

If anything blocks a step:

1. Hub → **Pilot validation** → **Field defect log**, or use the defect form on the pilot workbench page.
2. Record: title, steps to reproduce, severity (blocker/high if smoke stopped).
3. **No real PII** in defect bodies.

CLI status:

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-smoke
```

---

## 8. Decide next move

| Outcome | Action |
|---------|--------|
| Both cities pass, zero blockers | Wider rollout; **then** consider Executive Book rollup (v1.4+ from defect log only) |
| Minor defects, smoke completable | Fix forward from defect log — **no new architecture** until cleared |
| Blockers prevent smoke | Fix deploy/DB/API first; do not add features |

**The defect log tells us what v1.4 should be.** Do not guess.

---

## Quality gate (before telling Burt “pilot complete”)

```bash
cd RedDirt
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:qa
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-smoke
```

Pilot smoke CLI should show **ALL PASS** for Sherwood and Jacksonville after live steps.
