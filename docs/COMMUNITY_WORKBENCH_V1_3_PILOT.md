# Community Workbench v1.3 — Live Pilot Smoke Test + Netlify Deploy Readiness

**Goal:** Prove Sherwood and Jacksonville can operate the workbench in production — no new architecture.

**Prior commits:** v1.0–v1.2 through `cd2e796`.  
**Pilot cities:** Sherwood, Jacksonville (Pulaski County).

**Related:** [`COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md`](./COMMUNITY_WORKBENCH_V1_2_DEPLOY_GATE.md), [`NETLIFY_FIRST_DEPLOY.md`](./NETLIFY_FIRST_DEPLOY.md), [`COMMUNITY_WORKBENCH_FIELD_TRAINING.md`](./COMMUNITY_WORKBENCH_FIELD_TRAINING.md).

**Explicitly deferred:** Executive Book readiness rollup, county intelligence changes, statewide rollup.

---

## 1. Netlify env scoping — implementation notes

Steve applies this in **Netlify UI** before the pilot goes live. Agents cannot change Netlify settings from the repo.

### Step-by-step (Site configuration → Environment variables)

For each variable below, **Edit → Scopes → Builds only** (uncheck Functions and All):

| Variable | Why Builds only |
|----------|-----------------|
| All `NEXT_PUBLIC_*` | Inlined at build time; duplicates in Functions blow Lambda env budget |
| `NODE_OPTIONS`, `NODE_VERSION` | Build memory only; invalid on Lambda handler |
| `NPM_CONFIG_PRODUCTION` | Install-time |
| `PRISMA_MIGRATE_RETRIES`, `PRISMA_MIGRATE_RETRY_DELAY_SECONDS` | Used during `netlify-build.sh` migrate step |
| `ALLOW_PRISMA_P1001_BYPASS`, `ALLOW_PRISMA_SEED_P2022_BYPASS` | Build bypass flags |
| `SKIP_DB_SEED` | Build seed control |

**Keep on Functions** (runtime):

| Variable | Why |
|----------|-----|
| `DATABASE_URL`, `DIRECT_URL` | Prisma at request time |
| `ADMIN_SECRET` | Admin middleware |
| `ELECTION_PLAN_PASSWORD` | Election Plan session |
| API keys your live routes read | OpenAI, SendGrid, etc. — only if used in production routes |

### Team-level variables

Check **Team settings → Environment variables** for rows scoped to **All** — they count toward every function.

### Local verification (before push)

```bash
cd RedDirt
node scripts/verify-netlify-lambda-env-budget.cjs
npm run election-plan:community-workbench:pilot-preflight
```

### Pass criteria

- Build log: `Lambda env check` estimate under ~3 KB
- Deploy: no `Invalid AWS Lambda parameters` / `Failed to upload file: ___netlify-server-handler`
- If scoping is correct and deploy still fails: Netlify support — confirm **modern Functions runtime** (not Lambda compatibility mode)

---

## 2. Migration verification checklist

Build runs `prisma migrate deploy` via `scripts/netlify-build.sh`.

### Required migrations (Community Workbench stack)

| Migration | Purpose |
|-----------|---------|
| `20260616120000_election_plan_field_entry` | Operator initials + field log |
| `20260616140000_community_workbench_framework` | Workbench tables |
| `20260616150000_community_workbench_event_ops` | Event status, run-of-show, AAR |
| `20260616160000_community_workbench_pilot_defects` | Pilot defect log |

### Local verification

```bash
cd RedDirt
node scripts/run-with-h-drive-env.cjs npx prisma migrate status
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:migration-verify
```

### Deploy log verification

After trigger deploy, confirm:

- [ ] `Applying migration \`20260616140000_community_workbench_framework\``
- [ ] `Applying migration \`20260616150000_community_workbench_event_ops\``
- [ ] `Applying migration \`20260616160000_community_workbench_pilot_defects\``
- [ ] No `P3009` or ordering errors

---

## 3. Sherwood smoke-test path

**URL:** `/election-plan/workbenches/sherwood#pilot-smoke`

| Step | Action | Pass |
|------|--------|------|
| 1 | Sign in + operator initials | Initials visible; edits enabled |
| 2 | Assign Community Lead | Leadership row persists |
| 3 | Create first live event | Event + run-of-show + roles saved |
| 4 | KPI check | Sherwood template metrics respond |
| 5 | Complete first AAR | `aar_complete` + body text |
| 6 | Log defect if blocked | Defect on hub defect log |

Use **fake training data** only (e.g. `PILOT — Sherwood town hall`).

---

## 4. Jacksonville smoke-test path

**URL:** `/election-plan/workbenches/jacksonville#pilot-smoke`

| Step | Action | Pass |
|------|--------|------|
| 1 | Sign in + operator initials | Same as Sherwood |
| 2 | Assign Community Lead | Lead persists |
| 3 | Create first live event | Ward meeting / petition event saved |
| 4 | Link committee (optional) | Committee name on event |
| 5 | Complete first AAR | After-action complete |
| 6 | Log defect if blocked | Jacksonville slug on defect |

---

## 5–7. Core pilot tests (both cities)

These auto-verify on the hub **Pilot validation status** panel:

1. **First Community Lead assignment** — `leadership.community_lead.personName` set  
2. **First live event creation** — at least one non-cancelled event  
3. **First AAR completion** — event with `aar_complete` status and `aarBody`

Hub shows ✓/○ per city with links to the failing section.

---

## 8. Field defect log

- **Hub:** `/election-plan/workbenches#defect-log`
- **API:** `POST /api/election-plan/workbenches/defects`
- **Pilot slugs only:** `sherwood`, `jacksonville`
- **Severity:** low, medium, high, blocker
- **Status workflow:** open → triaged → fixed / won't fix

No real PII in defect bodies.

---

## 9. Pilot validation hub panel

On `/election-plan/workbenches`:

- Deploy readiness (local file checks)
- Sherwood + Jacksonville auto-checks
- Open defect count
- Defect log form

Refresh workbench page after each smoke step to update auto-checks.

---

## Commands (quality gate)

```bash
cd RedDirt
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:qa
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-preflight
node scripts/run-with-h-drive-env.cjs npm run election-plan:community-workbench:pilot-smoke
```

---

## Decision after v1.3

The next question is not “what should we build?” — it is:

**Can Sherwood and Jacksonville users operate this without us explaining it?**

If yes → consider Executive Book rollup and wider rollout.  
If no → fix defects from the log; do not add architecture.
