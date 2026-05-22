# Master Campaign OS Roadmap

**Lane:** `RedDirt/` only  
**Audience:** Steve, ChatGPT, Cursor (Burt)  
**Canonical path:** `RedDirt/docs/campaign-events/MASTER_CAMPAIGN_OS_ROADMAP.md`  
**Status:** Sprint 0 complete (May 2026) — master build control  
**Supersedes:** ad-hoc feature docs for *ordering* only; feature truth remains in sibling `docs/campaign-events/*` and code.

---

## North star

RedDirt becomes a **fully integrated AI-driven campaign operating system** where every surface reads and writes through shared rails:

1. **Database truth** — Prisma/Postgres is canonical for operational state.
2. **AI agent tools** — advisory, catalogued, human-gated (`/admin/campaign-events/ai-tools`).
3. **Calendar / event workflow** — `CampaignEventLedgerRecord` + lanes (tentative → official).
4. **Travel / reimbursement / compliance** — finance operations engine live (Sprint 8); FIN-1 mapper V2.
5. **Candidate + campaign manager dashboards** — decision and readiness surfaces.
6. **Public intake / host / volunteer** — forms → intake → ledger (Sprint 2).
7. **Market-ready client product** — tenant config, branding, onboarding (Sprint 10).

**Doctrine:** Build the system that builds the system. Safe tracks in touched files (types, hooks, empty states) — no silent behavior changes.

**Sprint build rule (from Sprint 4A):** Every major objective must ship together:

1. Product feature  
2. V1 AI agent tool (`tool-contract.ts` + catalog entry)  
3. Deterministic helper where practical  
4. Observation event(s) on `factCard._aiObservations`  
5. Documented V2 automation pathway  
6. Human guardrail — AI may not send, approve, deny, promote GCal, or post financial transactions without explicit human action  

See `SPRINT4_AI_TOOLCHAIN.md` and `/admin/campaign-events/ai-tools` → **Sprint 4 email** tab.

---

## Seven pillars (dependency order)

```text
[Public + GCal intake] ──► [Ledger + Workbench] ──► [Approval + Email]
         │                         │                        │
         └────────────► [Travel / Reimbursement] ◄──────────┘
                                    │
                    [Hot wash / Media intel] ──► [FIN / Compliance]
                                    │
              [Dashboards + Nav polish] ──► [Client productization]
```

| Pillar | Primary models / stores | Operator home |
|--------|-------------------------|---------------|
| DB truth | `CampaignEventLedgerRecord`, `WorkflowIntake`, `EventRequest`, `FinancialTransaction`, … | Prisma + `database-table-inventory.md` |
| AI tools | Catalog only (no autonomous send) | `/admin/campaign-events/ai-tools`, `/admin/ai-command-center` |
| Agent intelligence | User anticipation, writing voice, UX pathways (V1 deterministic) | `src/lib/agents/*`, Sprint 1 tools |
| Calendar OS | Ledger + `GoogleCalendarEventRecord`, `CalendarSource` | `/admin/campaign-calendar/*`, workbench |
| Travel / compliance | Ledger `factCard`, `data/compliance/*`, legacy `data/travel-ledger/` | travel-log → review → report → reimbursement |
| Dashboards | Read models over ledger + open work | `/admin/candidate-dashboard`, `/admin/campaign-manager-dashboard` |
| Public intake | `POST /api/forms`, `/api/forms/schedule-campaign-event` | Public schedule form → **WorkflowIntake** (not ledger yet) |
| Product | Future `campaign/client` config layer | Sprint 10 |

---

## Sprint map (0–10)

| Sprint | Name | Readiness (honest) | Success criterion |
|--------|------|-------------------|-------------------|
| **0** | Master system map + build control | **Complete** | Four docs in `docs/campaign-events/` |
| **1** | Reimbursement go-live completion | Demo ~80%, paid ~45% | Clean March/April/May MTD reimbursement packets |
| **2** | Website intake → ledger bridge | Gap: intake ≠ ledger | Public schedule appears in workbench / month review |
| **3** | Google Calendar truth layer | Partial read; no approved write | Ledger sync status; manual sync; stale warnings |
| **4** | Approval package automation | Package preview only; send gated | Secure approve/deny/hold; inbox on dashboards |
| **5** | Approval → official GCal | Blocked on 3+4 | Human-confirmed promote; `googleEventUrl` saved |
| **6** | Event planning full drilldown | Partial drilldown | Run of show, materials, briefings, execution sheet |
| **7** | Hot wash + media intelligence | Admin queue exists; public upload future | Searchable event/county memory after approval |
| **8** | Finance / FIN-1 / compliance bridge | FIN-1 list exists; no reimb bridge | Reimbursement → `FinancialTransaction` + audit trail |
| **9** | Dashboard + navigation polish | Dashboards scaffolded | One command center; CM can run without guide |
| **10** | Market / client productization | Internal Kelly only today | Sellable multi-tenant campaign service |

Detail per sprint: [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md).  
AI tool mapping: [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md).  
Dependencies: [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md).

---

## Current route inventory (Campaign OS slice)

### Admin — campaign calendar & events

| Route | Purpose |
|-------|---------|
| `/admin/campaign-calendar` | Calendar OS hub |
| `/admin/campaign-calendar/timeline` | Now → election |
| `/admin/campaign-calendar/month` | Month grid |
| `/admin/campaign-calendar/week` | Week + travel lane |
| `/admin/campaign-calendar/day` | Day ops + Franklin planner notes (localStorage) |
| `/admin/campaign-calendar/agenda` | Dense execution list |
| `/admin/campaign-calendar/approval-package/[recordId]` | Approval package preview |
| `/admin/campaign-events/workbench` | Batch review queue |
| `/admin/campaign-events/review` | Month review wizard |
| `/admin/campaign-events/[recordId]` | Event drilldown |
| `/admin/campaign-events/travel-log` | Tentative travel log |
| `/admin/campaign-events/travel-report` | Monthly travel report |
| `/admin/campaign-events/reimbursement` | Official reimbursement request |
| `/admin/campaign-events/month-readiness` | Month readiness score |
| `/admin/campaign-events/ai-tools` | AI tool command center |
| `/admin/campaign-events/media-approval` | Hot wash / media approval queue |
| `/admin/campaign-events/march-2026` | Legacy month entry (redirects pattern) |
| `/admin/candidate-dashboard` | Candidate reimbursement + approval cards |
| `/admin/campaign-manager-dashboard` | CM readiness + queues |
| `/admin/counties/[slug]` | County ops bridge → countyWorkbench |

### Admin — related (not Campaign OS core but coupled)

| Route | Coupling |
|-------|----------|
| `/admin/workbench` | Unified open work (UWR); truth snapshot |
| `/admin/calendar-command-center/*` | Legacy command center; WorkflowIntake shadow items |
| `/admin/travel-ledger/*` | **Legacy** JSON travel ledger (parallel path) |
| `/admin/compliance/*` | Compliance workbench (JSON + Prisma docs) |
| `/admin/financial-transactions` | FIN-1 read-only list |
| `/admin/(board)/events/*` | `CampaignEvent` HQ (distinct from ledger) |

### Public

| Route / API | Purpose |
|-------------|---------|
| `(site)/events`, `(site)/campaign-calendar` | Public events |
| `ScheduleCampaignEventForm` → `POST /api/forms/schedule-campaign-event` | Schedule request → **WorkflowIntake** + **EventRequest** |
| `POST /api/forms` | General forms → **Submission** (+ WorkflowIntake for selected types) |
| `/campaign-events/upload/[eventToken]` | Event-scoped upload (hot wash scaffold) |

### APIs (Campaign OS–relevant)

| API | Role |
|-----|------|
| `/api/forms/schedule-campaign-event` | Public schedule persist + optional AI assistant |
| `/api/calendar/google/*` | OAuth, webhook, cron-sync (read path; write gated) |
| `/api/admin/google-calendar/connect` | Admin GCal connect |
| `/api/admin/campaign-events/media/[mediaId]` | Media metadata |

Full public map: [`../public-site-system-map.md`](../public-site-system-map.md).  
Full workbench map: [`../workbench-build-map.md`](../workbench-build-map.md).

---

## Data sources (truth hierarchy)

| Tier | Source | Role today |
|------|--------|------------|
| **A — Canonical ops** | PostgreSQL via Prisma | Ledger, intake, finance, comms, voter file |
| **B — Bootstrap / refresh** | `data/calendar-command-center/calendar-items.normalized.json` | Idempotent month seed → ledger |
| **C — Parallel / staging** | `data/travel-ledger/*`, `data/compliance/*`, `data/calendar-command-center/*.staged.json` | Legacy or compliance packets; not ledger canon |
| **D — Advisory / agent output** | `data/agent/*.json` | Reports; never authoritative |
| **E — Browser-only** | `localStorage` (month review prefs, Franklin planner, Message Studio drafts) | UX prefs; not shared across devices |

**Ledger seed:** `npm run campaign-events:seed-month -- YYYY-MM` (see `TRAVEL_REIMBURSEMENT_WORKFLOW.md`).

**Intake gap (Sprint 2):** `WEBSITE_ENTRY` exists on `CampaignEventLedgerCreatedFrom` enum but bridge from `WorkflowIntake` / `EventRequest` is **not wired**.

---

## Prisma models (Campaign OS core)

| Model | Role |
|-------|------|
| `CampaignEventLedgerRecord` | Month-bucketed event + travel + `factCard` JSON |
| `WorkflowIntake` | Ops queue (incl. public schedule) |
| `EventRequest` | 1:1 schedule detail linked to intake |
| `Submission` | All `/api/forms` payloads |
| `CampaignEvent` | Legacy/public event HQ (separate from ledger) |
| `GoogleCalendarEventRecord` | Synced GCal rows |
| `CalendarSource` / `CalendarWatchChannel` | OAuth + watch metadata |
| `KellyCalendarDecision` / `KellyCalendarPromotion` | Decision/promotion scaffolding |
| `FinancialTransaction` | FIN-1 (Sprint 8 target for reimbursement) |
| `OwnedMediaAsset` + transcript/quote models | Hot wash / media (Sprint 7) |
| `EmailWorkflowItem` | Comms queue (adjacent; not event approval send yet) |

Full inventory (**126 models**): [`../database-table-inventory.md`](../database-table-inventory.md).

---

## Blocked automations (global)

No outbound automation runs without explicit config + human gate:

| Automation | Blocker |
|------------|---------|
| Approval package email | `EMAIL_SEND_ENABLED = false` (`approval-recipients.ts`) |
| Google Calendar write | Product rule: no write without human approval (Sprint 5) |
| GCal auto-sync → ledger promotion | Read partial; write not approved |
| FIN-1 from reimbursement | No mapper (Sprint 8) |
| Email sequences (prep, volunteer, hot wash) | `CE_LEDGER_AUTOMATION_NEEDS.md` — not implemented |
| Inbound approve/deny reply parser | Idea only |
| Server PDF reimbursement | Browser print only; PDF scaffold OK |

---

## Work style (master build)

When touching files that matter in upcoming sprints:

- Add **TODO-safe types** and enums already in schema (`WEBSITE_ENTRY`, sync status).
- Add **neutral config hooks** (`approval-recipients.ts`, feature flags).
- Add **empty states** and route-ready placeholders.
- Add **shared utilities**; do not fork second catalogs.
- **Do not** overbuild hidden systems or change working flows silently.

---

## Go-live checklist (Kelly SOS production)

Use before treating a month “closed” for reimbursement + events:

- [ ] `npm run check` green in `RedDirt/`
- [ ] `npm run lane:preflight` (or documented lane preflight) passes
- [ ] DB migrations applied on target environment (`DIRECT_URL` + `DATABASE_URL`)
- [ ] Month seeded or GCal-synced for target `period`
- [ ] Travel approval queue empty or explicitly held with reason
- [ ] Reimbursement report totals match approved lines
- [ ] Official reimbursement page: print/CSV/JSON reviewed
- [ ] No real PII in smoke tests or docs
- [ ] Approval recipients configured (CM/treasurer when available)
- [ ] Hosted DB gate documented separately from local Docker

---

## Market-readiness checklist (Sprint 10 target)

- [ ] Campaign/client config layer (branding, roles, feature flags)
- [ ] Tenant isolation story (DB + auth)
- [ ] External dashboard + upload portal
- [ ] Demo seed data + onboarding flow
- [ ] Deployment + SaaS readiness runbook
- [ ] AI tools: client health + tenant config checker agents
- [ ] No Kelly-specific PII/strategy in template extraction

---

## Related docs (do not duplicate)

| Topic | Doc |
|-------|-----|
| Calendar OS architecture | [`CAMPAIGN_CALENDAR_OPERATING_SYSTEM.md`](./CAMPAIGN_CALENDAR_OPERATING_SYSTEM.md) |
| Travel reimbursement | [`TRAVEL_REIMBURSEMENT_WORKFLOW.md`](./TRAVEL_REIMBURSEMENT_WORKFLOW.md) |
| AI tool catalog UI | [`AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md`](./AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md) |
| Sprint status / AI map / deps | [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md), [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md), [`SYSTEM_DEPENDENCY_GRAPH.md`](./SYSTEM_DEPENDENCY_GRAPH.md) |
| Blueprint / divisions | [`../PROJECT_MASTER_MAP.md`](../PROJECT_MASTER_MAP.md), [`../DIVISION_MASTER_REGISTRY.md`](../DIVISION_MASTER_REGISTRY.md) |
| Coordination | [`../../CURSOR_CODEX_COORDINATION_PROTOCOL.md`](../../CURSOR_CODEX_COORDINATION_PROTOCOL.md) |

---

## Maintenance

Update this file when:

- A sprint closes (move readiness % in `BUILD_SPRINT_STATUS.md`).
- A new canonical route or model appears.
- An automation moves from blocked → gated → live.

**Owners:** Steve (priority), Burt (code + docs sync), ChatGPT (packet design).
