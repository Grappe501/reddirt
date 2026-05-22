# AI Agent Operational Tool System

**Route:** `/admin/campaign-events/ai-tools`  
**Lane:** `RedDirt` campaign-events only  
**Last pass:** Operational command center (inventory → operating system)

**Master build (Sprint 0–10):** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) · [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md) · [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md) · [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md) — linked from the AI tools page banner.

---

## Purpose

Steve and operators use one page to see:

- What tools exist and their maturity (functional / partial / scaffolded / idea)
- What each tool reads, writes, and whether automation is blocked
- Which tools to build next for April completion and travel ledger
- The agent runbook for event/travel end-to-end

This doc mirrors the UI and lib layer; do not put secrets or real PII here.

---

## Catalog structure

| Layer | File | Role |
|-------|------|------|
| Master lifecycles | `src/lib/campaign-events/ai-tools-master-catalog.ts` | 22 lifecycle groups, baseline 73 tools |
| Supplement | `src/lib/campaign-events/ai-tools-supplement.ts` | ~27 additional tools merged at runtime (no duplicate ids) |
| Operational meta | `src/lib/campaign-events/ai-tools-operational-meta.ts` | Per-tool files, routes, test checklist, automation flags |
| Snapshot | `src/lib/campaign-events/ai-tools-command-center.ts` | `buildCommandCenterSnapshot()` — sections, readiness, build-next |
| Runbook | `src/lib/campaign-events/ai-agent-runbook.ts` | 13 process stages |
| UI | `src/components/admin/campaign-events/AiToolsCommandCenter.tsx` | Dashboard, matrix, runbook, catalog, `?tool=id` drawer |

### Tool entry fields (catalog)

- `id`, `name`, `purpose`, `lifecycleId`
- `status`: `functional` | `partial` | `scaffolded` | `idea`
- `priority`: P0–P3
- `trigger`, `reads`, `writes`, `guardrails`, `futureRoute`
- `humanApprovalRequired`

### Enriched fields (runtime)

From `deriveOperationalMeta()` plus `TOOL_OPERATIONAL_META` overrides:

- `implementationFiles`, `relatedRoutes`
- `inputData`, `outputData`
- `availableNow`, `blocksAutomation`
- `nextBuildStep`, `testChecklist`

---

## Tool maturity scoring

System readiness % on the command center dashboard:

```
readinessScore = average(maturityPoints(status)) over all merged tools
```

| Status | Points |
|--------|--------|
| functional | 100 |
| partial | 65 |
| scaffolded | 30 |
| idea | 5 |

This is a **catalog maturity** score, not April month completion. April operational % lives on `/admin/campaign-events/month-readiness`.

---

## Next-build logic

`rankBuildNext()` in `ai-tools-command-center.ts` scores non-functional tools:

| Factor | Weight |
|--------|--------|
| P0 priority | +40 |
| P1 | +28 |
| P2 | +12 |
| partial status | +25 |
| scaffolded | +18 |
| idea | +5 |
| not automation-blocked | +15 |
| automation-blocked | −10 |
| April-useful id set | +12 |
| Travel-ledger-useful id set | +8 |
| Approval automation (send blocked) | +6 |

Top 5 appear on the **Build next** panel.

### April-useful tool ids (examples)

`cri-city-county-assist`, `mr-mileage-assist`, `appr-month-wizard`, `rpt-month-readiness`, `tl-month-report`, `intake-dup-cal-id`, `conf-schedule`, `email-draft-scaffold`

### Travel-useful tool ids (examples)

`mr-mileage-assist`, `mr-rt-miles`, `tl-month-report`, `rpt-travel-summarizer`, `rpt-csv-export`, `mr-anomaly-detector`

---

## How future tools become real

1. **Add or extend catalog** — master lifecycle and/or `ai-tools-supplement.ts` (unique `id`).
2. **Set honest status** — `idea` → `scaffolded` (UI/route stub) → `partial` (deterministic logic, human gates) → `functional`.
3. **Wire operational meta** — add `TOOL_OPERATIONAL_META[id]` with real files, routes, test checklist.
4. **Implement in lane** — ledger save path, month review, or travel report; never cross-lane imports.
5. **Verify on command center** — tool appears in correct section; drawer shows files/routes; runbook stage lists tool id.
6. **Document** — one line in this file if operator-facing behavior changes.

### Explicitly not in this pass

Email send, Google Calendar sync, SMS, voter-file matching, FIN-1 bridge, PDF export, May seed, host portal.

---

## Agent runbook (13 stages)

Defined in `ai-agent-runbook.ts`. UI: **Agent runbook** tab.

| # | Stage |
|---|--------|
| 1 | Calendar intake |
| 2 | Tentative event review |
| 3 | Conflict detection |
| 4 | City/county/ZIP inference |
| 5 | Travel/mileage calculation |
| 6 | Approval package generation |
| 7 | Candidate/CM decision |
| 8 | Host prep |
| 9 | Run of show |
| 10 | Event execution |
| 11 | Hot wash |
| 12 | Reimbursement report |
| 13 | Compliance handoff |

Each stage: agent goal, tool ids, data needed, human decision, failure states, next action.

---

## Implemented tools (accurate mapping)

| Tool id | Status | Operator entry |
|---------|--------|----------------|
| `fc-infer-assumptions` | functional | Month review / workbench inference panel |
| `cri-city-county-assist` | functional | Review `focus=missing_city` / county |
| `mr-mileage-assist` | functional | Review `focus=missing_mileage` |
| `rpt-readiness-score` / `rpt-month-readiness` | functional | `/admin/campaign-events/month-readiness` |
| `appr-month-wizard` | functional | `/admin/campaign-events/review` |
| `tl-month-report` / `rpt-travel-summarizer` | functional | Travel report |
| `rpt-csv-export` | functional | Travel report CSV |
| `appr-package-build` | partial | Approval package preview (no send) |
| `appr-summary-build` | functional | Month review summary text |
| `cri-county-link` | functional | County workbench links |
| `cal-views-os` | functional | Campaign calendar views |
| `saas-planner-scaffold` / `cm-planner-notes` | scaffolded | Franklin planner localStorage |
| `intake-dedupe` / `intake-dup-cal-id` | partial/functional | Readiness duplicates |
| `conf-schedule` / `conf-work-hours` | functional/partial | Review conflict modes |
| `email-draft-scaffold` | partial | Draft modal, no send |

---

## Steve workflow

1. Open **`/admin/campaign-events/ai-tools`**
2. **Command center** tab — readiness %, build-next 5, functional / needs-build / blocked
3. **Capability matrix** — sort/filter; click tool name
4. **Agent runbook** — process stage → click tool id
5. **Full catalog** — browse by lifecycle; filter status
6. **`?tool=<id>`** — shareable detail drawer (implementation files, tests)

Quick ops links from banner: April readiness, month review, travel report, workbench.

---

## Related docs

- `docs/campaign-events/AI_AGENT_TOOL_PACKAGE_MASTER.md` (original inventory)
- `docs/campaign-events/MONTHLY_TRAVEL_LEDGER_REPORT.md`
- `docs/campaign-events/APRIL_COMPLETION_WORKFLOW.md`

---

## Maintenance

After adding tools, run from `RedDirt/`:

```bash
npm run typecheck
```

Update supplement count in this doc if the merge set changes materially.
