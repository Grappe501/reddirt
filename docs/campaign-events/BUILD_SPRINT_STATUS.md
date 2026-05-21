# Build Sprint Status

**Lane:** `RedDirt/`  
**Last updated:** Sprint 5 (May 2026)  
**Companion:** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md)

This is the **live control board**. Update at the end of every sprint slice.

---

## Summary dashboard

| Sprint | Name | Status | Demo readiness | Production / paid readiness |
|--------|------|--------|----------------|----------------------------|
| 0 | Master system map | **Complete** | N/A | N/A |
| 1 | Reimbursement go-live | **Complete** | ~92% | ~72% |
| 2 | Intake → ledger bridge | **Complete** | ~85% | ~70% |
| 3 | Google Calendar truth | **Complete** | ~80% | ~55% |
| 4 | Approval package email + 4A AI tools | **Complete** (gated send + toolchain) | ~85% | ~55% |
| 5 | Controlled GCal promotion (human + gated write) | **Complete** (dry-run default; live gated) | ~75% | ~45% |
| 5A | Agent Intelligence 1 (user anticipation + writing) | **Complete** (V1 deterministic) | ~70% | ~50% |
| 5B | Agent Intelligence 2 (live observation + orchestration) | **Complete** (V1 functional) | ~78% | ~55% |
| 6 | Event planning drilldown | Partial | ~50% | ~35% |
| 7 | Hot wash + media intel | Partial | ~40% | ~20% |
| 8 | FIN / compliance bridge | Not started | — | — |
| 9 | Dashboard + nav polish | Partial | ~55% | ~40% |
| 10 | Client productization | Not started | — | — |

**AI catalog maturity (whole repo catalog):** ~65% average points — see `buildCommandCenterSnapshot()`; not the same as Sprint 1 reimbursement readiness.

---

## Sprint 0 — Master system map + build control

**Purpose:** Shared source of truth for build order and dependencies.

**Deliverables**

| Artifact | Path | State |
|----------|------|-------|
| Master roadmap | `docs/campaign-events/MASTER_CAMPAIGN_OS_ROADMAP.md` | ✅ |
| Sprint status | `docs/campaign-events/BUILD_SPRINT_STATUS.md` | ✅ |
| AI tool build map | `docs/campaign-events/AI_AGENT_TOOL_BUILD_MAP.md` | ✅ |
| System dependency graph | `docs/campaign-events/SYSTEM_DEPENDENCY_GRAPH.md` | ✅ |

**Success:** Steve, ChatGPT, and Burt share one sprint order and touch list.

**Exit criteria:** Sprint 1 packet can start without re-discovering routes/models.

---

## Sprint 1 — Reimbursement go-live completion

**Status:** **Complete** (May 2026 pass). Travel reimbursement workflow for **March, April, May MTD** includes month status store, print-grade official request, checklist, queue verification script, dashboard status cards, and AI tool catalog updates.

**Current status:** Operators can run travel-log → approval wizard → travel report → reimbursement page; set **Draft / Needs review / Ready / Finalized**; print and download CSV/JSON.

**Build next**

| Item | Priority | Notes |
|------|----------|-------|
| Missing mileage / city / county queues | P0 | `focus=missing_mileage`, county inference partial |
| Official reimbursement report polish | P0 | `/admin/campaign-events/reimbursement` |
| Print-grade layout | P0 | Browser print; server PDF optional scaffold |
| Edit / correct flow | P0 | `?from=travel&month=` on drilldown |
| Reimbursement status: Draft / Ready / Finalized | P0 | Extend `factCard` / review meta — **not full enum on row yet** |
| Signature / review block | P1 | UI block on reimbursement page |
| PDF scaffold | P2 | Keep if server PDF not ready |

**Key routes:** `travel-log`, `review?mode=travel_needs_approval`, `travel-report`, `reimbursement`, `month-readiness`.

**Key files (expected touch)**

- `src/components/admin/campaign-events/*` (report, reimbursement, travel log)
- `src/lib/campaign-events/travel-*`, `review-meta.ts`, `persistence/*`
- `docs/campaign-events/OFFICIAL_REIMBURSEMENT_REPORT.md`

**AI tools (Sprint 1):** See [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md#sprint-1--reimbursement).

**Success:** Steve produces clean reimbursement forms for March, April, May MTD.

**Blockers**

- Legacy `/admin/travel-ledger/*` still parallel — operators must use **campaign-events** path for SOS reimbursement.
- FIN-1 bridge explicitly out of scope (Sprint 8).

---

## Sprint 2 — Website intake → ledger bridge

**Status:** **Complete** (May 2026 pass).

**Delivered**

- `bridgeWebsiteIntakeToLedger` on public schedule persist (idempotent `website_entry:{workflowIntakeId}`)
- Synthetic calendar + workbench load for `WEBSITE_ENTRY` rows
- Deterministic inference + duplicate/conflict assist (`factCard._intake`)
- Month review modes: `website_intake_only`, `needs_intake_review`, `duplicate_risk`, `intake_conflict`
- Workbench filters + badges; `IntakeAiSummaryCard` on event review
- Dashboard intake queue stats (candidate + CM)
- `npm run campaign-events:test-intake-bridge`
- Docs: `SPRINT2_INTAKE_TRACE.md`, `WEBSITE_INTAKE_LEDGER_BRIDGE.md`, `TENTATIVE_EVENT_WORKFLOW.md`, `EVENT_OS_INTAKE_AI_WORKFLOW.md`

**Not built (by design):** GCal write, approval email send, legacy intake backfill automation.

**Success:** Public event request → tentative ledger row → workbench / month review / travel (excluded from finalized reimbursement until approved).

---

## Sprint 3 — Google Calendar truth layer

**Status:** **Complete** (May 2026 pass).

**Delivered**

- Ledger calendar truth model + `matchCalendarTruthToLedger`
- `/admin/campaign-events/calendar-sync` operator dashboard
- Normalized JSON freshness (mtime, months, stale warnings)
- Workbench / drilldown / campaign calendar alerts + sync filters
- Candidate + CM dashboard sync summary cards
- CLI instructions (read-only): `calendar:google:sync-kelly`, `campaign-events:seed-month`
- `npm run campaign-events:verify-calendar-sync
npm run campaign-events:test-approval-email -- --dry-run`
- Docs: `SPRINT3_GOOGLE_CALENDAR_TRACE.md`, `GOOGLE_CALENDAR_TRUTH_LAYER.md`, `CALENDAR_SYNC_OPERATOR_GUIDE.md`, `TENTATIVE_OFFICIAL_CALENDAR_READINESS.md`

**Not built:** Google write/promote from ledger UI, server-side auto-sync button, auto ledger upsert from GCal ingest.

**Success:** Operators see website vs JSON vs Google matched/stale/conflict per row and know safe refresh commands.

---

## Sprint 4 — Approval package automation

**Status:** **Complete** (May 2026). Product email workflow + **Sprint 4A AI tool foundation** (15 V1 contracts, observations, command center tab).

## Sprint 4A — Approval email AI tool foundation

**Status:** **Complete** (May 2026 pass).

| Deliverable | State |
|-------------|-------|
| `ai-tools/tool-contract.ts` standard shape | ✅ |
| `ai-tools/observations.ts` + `_aiObservations` persist | ✅ |
| 15 Sprint 4 V1 tool contracts + catalog lifecycle | ✅ |
| `/admin/campaign-events/ai-tools` Sprint 4 tab + pipeline | ✅ |
| Observation hooks on send/preview/token/decision | ✅ |
| `SPRINT4_AI_TOOLCHAIN.md` + human-control rules | ✅ |

**Build rule (all future sprints):** feature + V1 tool + observation + V2 path + human guardrail — see `CAMPAIGN_OS_SPRINT_BUILD_RULE` in `master-build-docs.ts`.

---

### Sprint 4 product (email)

Gated SendGrid send, HTML+text template, JSON approval tokens, public `/campaign-events/approval/[token]`, operator send panel, `_approvalEmailLog` audit, dashboard inbox status, dry-run script.

**Delivered**

| Item | State |
|------|-------|
| `approval-email/*` transport + template + tokens | ✅ |
| `EMAIL_SEND_ENABLED` gate (default off) | ✅ |
| Operator send / resend / dry-run / test-to-self | ✅ |
| Token approve / deny / hold / request_info → ledger | ✅ |
| Google Calendar write on approval | ❌ by design (Sprint 5) |
| CM email send | ❌ not configured |
| Reply-by-email | ❌ future |

**Docs:** `SPRINT4_EMAIL_TRACE.md`, `SPRINT4_AI_TOOLCHAIN.md`, `APPROVAL_PACKAGE_EMAIL_WORKFLOW.md`, `APPROVAL_TOKEN_SECURITY.md`, `CANDIDATE_APPROVAL_INBOX.md`

**Commands:** `npm run campaign-events:test-approval-email -- --dry-run`

**Success:** With send enabled + SendGrid env, operator sends package; candidate uses secure links; decisions land on ledger only.

---

## Sprint 5 — Controlled Google Calendar promotion

**Status:** **Complete** (May 2026). First Event OS write lane; human click only.

**Depends on:** Sprint 3 (sync truth) + Sprint 4 (approval, write blocker on approve path).

**Delivered**

| Area | Path / route | State |
|------|--------------|-------|
| Write trace doc | `SPRINT5_GOOGLE_WRITE_TRACE.md` | ✅ |
| Promotion workflow docs | `GOOGLE_CALENDAR_PROMOTION_WORKFLOW.md`, `TENTATIVE_OFFICIAL_PROMOTION_RULES.md`, `GOOGLE_PROMOTION_SAFETY.md` | ✅ |
| Lane model + meta | `calendar-promotion/promotion-meta.ts`, `promotion-types.ts` | ✅ factCard `_calendarPromotion` |
| Readiness checker | `promotion-readiness.ts` | ✅ READY / WARNING / BLOCKED |
| Payload preview | `build-google-payload.ts` + workbench UI | ✅ |
| Safe write | `promote-ledger-event.ts` + `GOOGLE_CALENDAR_WRITE_ENABLED` | ✅ gated |
| Workbench | `/admin/campaign-events/calendar-promotion` | ✅ |
| Audit + observations | `promotion-audit.ts`, `record-promotion-observation.ts` | ✅ |
| AI toolchain (15 tools) | `sprint5-promotion-tools.ts`, AI tab Sprint 5 | ✅ |
| Dashboard visibility | candidate + CM promotion stat cards | ✅ |

**Commands:** `npm run campaign-events:test-calendar-promotion -- --dry-run`

**Live writes:** Set `GOOGLE_CALENDAR_WRITE_ENABLED=true` and healthy Kelly tentative/official `CalendarSource` OAuth. Use staging calendars first.

**Not built (by design):** background promotion, autonomous AI writes, reply-by-email promote, tentative→official dedupe on Google.

**Success:** Operator reviews readiness + payload, explicitly promotes to tentative or official, audit + sync surfaces update, failures retry safely.

---

## Sprint 6 — Event planning full drilldown

**Build:** Run of show, materials, volunteer plan, cost/budget, contacts, maps, candidate/CM briefings, one-page execution sheet.

**Today:** Drilldown `[recordId]` partial; inference functional; some tabs placeholder.

**Success:** Every event has a complete operational command page.

---

## Sprint 7 — Hot wash + media intelligence

**Today:** `/admin/campaign-events/media-approval`; owned media models; upload token route scaffold.

**Build:** Public upload link, host/volunteer flow, transcription, chunking, event/county memory, metadata enrichment.

**Success:** Approved media becomes searchable campaign intelligence.

---

## Sprint 8 — Finance / FIN-1 / compliance bridge

**Today:** `FinancialTransaction` + `/admin/financial-transactions` read-only; compliance JSON under `data/compliance/`.

**Build:** Approved reimbursement → draft transaction; packet export; receipt/event link; treasurer review; audit trail.

**Success:** Travel reimbursement is official campaign finance data.

---

## Sprint 9 — Dashboard + navigation polish

**Build:** Single Campaign OS command center; simplify nav; current-month defaults; edge-to-edge candidate/CM views; treasurer scaffold; mobile-friendly; dedupe routes.

**Today:** Candidate + CM dashboards exist with month query params; main hub still `/admin/workbench`.

**Success:** Non-technical CM can run the system without guidance.

---

## Sprint 10 — Market / client productization

**Build:** Client config, branding, role portals, external dashboard, deployment checklist, demo seed, onboarding, SaaS docs.

**Success:** Sellable campaign service, not only Kelly internal OS.

---

## Commands (lane)

Run from `RedDirt/`:

```bash
npm run check
npm run campaign-events:seed-month -- 2026-05
# lane preflight when assigned — stop if it fails
```

---

## Completion report template (every sprint)

Copy into PR or handoff:

```text
Active lane: RedDirt/
Sprint: N — <name>
Files changed: <list>
Commands run: <cmd> → <pass|fail>
WorkflowIntake → ledger: <yes|no|n/a>
Operator path: <routes>
Remaining blockers: <bullets>
Days 4–7 compression safe: <yes|no + why>
```

---

## Cross-links

- Dependency graph: [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md)
- AI tools per sprint: [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md)
