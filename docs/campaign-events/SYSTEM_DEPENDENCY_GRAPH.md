# System Dependency Graph

**Lane:** `RedDirt/`  
**Purpose:** Show what depends on what for the Campaign OS master build.  
**Companion:** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md), [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md)

---

## 1. Master data flow (target state)

```mermaid
flowchart TB
  subgraph public [Public surfaces]
    PF[POST /api/forms]
    PS[POST /api/forms/schedule-campaign-event]
    PU[campaign-events/upload token]
  end

  subgraph intake [Intake layer]
    SUB[Submission]
    WI[WorkflowIntake]
    ER[EventRequest]
  end

  subgraph ledger [Event OS truth]
    CEL[CampaignEventLedgerRecord]
    FC[factCard JSON]
  end

  subgraph calendar [Calendar external]
    GCR[GoogleCalendarEventRecord]
    CS[CalendarSource]
    JSON[data/calendar-items.normalized.json]
  end

  subgraph travel [Travel / reimb]
    TL[Travel log / review / report]
    REIM[Reimbursement page]
  end

  subgraph approval [Approval]
    AP[Approval package]
    EM[Email send gated]
    DEC[Decision on factCard]
  end

  subgraph finance [Finance]
    FT[FinancialTransaction]
    COMP[data/compliance + ComplianceDocument]
  end

  subgraph media [Media / memory]
    OMA[OwnedMediaAsset]
    SCH[SearchChunk / RAG]
  end

  PF --> SUB
  PS --> SUB
  PS --> WI
  PS --> ER
  WI -.->|Sprint 2 bridge| CEL
  ER -.->|Sprint 2 bridge| CEL
  JSON -->|seed idempotent| CEL
  GCR -.->|Sprint 3 sync| CEL
  CEL --> FC
  CEL --> TL
  TL --> REIM
  CEL --> AP
  AP --> EM
  EM --> DEC
  DEC -.->|Sprint 5| GCR
  REIM -.->|Sprint 8| FT
  FT --> COMP
  PU --> OMA
  OMA -.->|Sprint 7 approve| SCH
```

**Solid arrows:** implemented today. **Dotted:** planned sprint deliverables.

---

## 2. Sprint dependency chain

```mermaid
flowchart LR
  S0[Sprint 0 Map]
  S1[Sprint 1 Reimbursement]
  S2[Sprint 2 Intake bridge]
  S3[Sprint 3 GCal read]
  S4[Sprint 4 Approval email]
  S5[Sprint 5 GCal write]
  S6[Sprint 6 Drilldown]
  S7[Sprint 7 Hot wash]
  S8[Sprint 8 FIN bridge]
  S9[Sprint 9 Dashboards]
  S10[Sprint 10 Product]

  S0 --> S1
  S0 --> S2
  S1 --> S8
  S2 --> S4
  S3 --> S5
  S4 --> S5
  S2 --> S6
  S5 --> S6
  S6 --> S7
  S1 --> S8
  S4 --> S9
  S6 --> S9
  S8 --> S9
  S9 --> S10
```

| Sprint | Hard depends on | Soft depends on |
|--------|-----------------|-----------------|
| 1 | 0 | Ledger seeded months |
| 2 | 0 | `WEBSITE_ENTRY` enum |
| 3 | 0, 2 (ledger rows exist) | GCal OAuth env |
| 4 | 2, 3 (stable ledger + package) | SendGrid / comms hub |
| 5 | 3, 4 | Human promote UX |
| 6 | 2 | — |
| 7 | 6 | Owned media ingest |
| 8 | 1 | FIN-1 models |
| 9 | 1, 4, 6 | — |
| 10 | 9 | Auth/tenant design |

---

## 3. Source-of-truth tiers

```mermaid
flowchart TB
  T1[Tier A: PostgreSQL / Prisma]
  T2[Tier B: Normalized JSON seed]
  T3[Tier C: Parallel JSON stores]
  T4[Tier D: Agent report JSON]
  T5[Tier E: localStorage]

  T2 -->|npm run campaign-events:seed-month| T1
  T3 -.->|compliance / legacy travel-ledger| T1
  T4 -.->|advisory only| T1
  T5 -.->|never authoritative| T1

  UI[Admin UI] --> T1
  AI[AI tools advisory] --> T1
  AI -.-> T4
```

| Tier | Examples | Rule |
|------|----------|------|
| A | `CampaignEventLedgerRecord`, `WorkflowIntake`, `FinancialTransaction` | Wins on conflict |
| B | `calendar-items.normalized.json` | Bootstrap only; idempotent seed |
| C | `data/travel-ledger/`, `data/compliance/*` | Domain-specific; migrate to A when bridged |
| D | `data/agent/*-latest.json` | Operator hints only |
| E | Franklin planner, month review toggles | Per-browser UX |

---

## 4. Integration boundaries (do not cross without packet)

| From | To | Status | Sprint |
|------|-----|--------|--------|
| `WorkflowIntake` | `CampaignEventLedgerRecord` | **Gap** | 2 |
| Ledger approved travel | `FinancialTransaction` | **Gap** | 8 |
| Ledger | Google Calendar write | **Blocked** | 5 |
| `Submission` (generic forms) | Ledger | Partial / manual | 2+ policy |
| `CampaignEvent` (HQ) | Ledger | Parallel systems | Document only |
| RedDirt | `sos-public/` | **Forbidden** | — |
| RedDirt | `countyWorkbench/` | Link-out only (`NEXT_PUBLIC_COUNTY_WORKBENCH_URL`) | — |

---

## 5. Blocked automations graph

```mermaid
flowchart TB
  H[Human operator]
  CFG[Config flags]
  H --> CFG
  CFG -->|EMAIL_SEND_ENABLED=false| E1[Approval emails BLOCKED]
  CFG -->|no GCal write approval| E2[Calendar promote BLOCKED]
  CFG -->|no FIN mapper| E3[Reimbursement posting BLOCKED]
  CFG -->|CE_LEDGER_AUTOMATION| E4[Sequences BLOCKED]

  E1 --> AP[Approval package preview OK]
  E2 --> RD[GCal read partial OK]
  E3 --> RP[Reimbursement print OK]
```

| Automation | Config / doc gate |
|------------|-------------------|
| Approval email | `approval-recipients.ts` → `EMAIL_SEND_ENABLED` |
| GCal write | Product + Sprint 5 human confirm |
| Auto email sequences | `CE_LEDGER_AUTOMATION_NEEDS.md` |
| Inbound reply parser | Not built |
| SendGrid bulk from event OS | Comms hub governance separate |

---

## 6. AI tools dependency on data

```mermaid
flowchart LR
  CAT[ai-tools-master-catalog]
  META[ai-tools-operational-meta]
  CC[ai-tools-command-center]
  UI[ai-tools page]

  CAT --> CC
  META --> CC
  CC --> UI

  CEL[(CampaignEventLedgerRecord)]
  WI[(WorkflowIntake)]
  GCR[(GoogleCalendarEventRecord)]

  CEL --> CAT
  WI --> CAT
  GCR --> CAT
```

**Rule:** Tools **read** Tier A first; **write** only through existing persistence helpers (`persistence/review-persistence.ts`, `records.ts`, etc.).

---

## 7. Route clusters (dependency for nav polish — Sprint 9)

| Cluster | Routes | Merge target |
|---------|--------|--------------|
| Calendar views | `/admin/campaign-calendar/*` | Campaign OS hub |
| Event ops | `/admin/campaign-events/*` | Same hub |
| Legacy calendar | `/admin/calendar-command-center/*` | Deprecate gradually after Sprint 2–3 |
| Legacy travel | `/admin/travel-ledger/*` | Banner → campaign-events travel |
| Command | `/admin/workbench`, candidate/CM dashboards | Single command center (Sprint 9) |

---

## 8. External services

| Service | Used for | Sprint |
|---------|----------|--------|
| PostgreSQL (Docker / Supabase) | All Tier A | 0+ |
| Google Calendar API | Read/sync/promote | 3, 5 |
| OpenAI | Intake classify, search, optional drafts | Optional all sprints |
| SendGrid | Comms + future approval email | 4 |
| Netlify | Deploy | 10 |
| countyWorkbench | County dashboards (sister lane) | Link only |

---

## 9. Prisma model neighborhood (ledger-centric)

```text
Submission ──► WorkflowIntake ──► EventRequest
                      │
                      ╳ (Sprint 2 bridge)
                      ▼
         CampaignEventLedgerRecord ◄── seed ── calendar-items.normalized.json
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    factCard._review  travel fields  googleSyncStatus
          │                       │
          ▼                       ▼
   EventApproval*          FinancialTransaction (Sprint 8)
   GoogleCalendarEventRecord (Sprint 3–5)
   OwnedMediaAsset (Sprint 7)

* EventApproval model exists for HQ events; ledger uses factCard._review primarily today.
```

---

## 10. Verification queries (operator / dev)

After bridge or sync work, verify in order:

1. Public schedule → `WorkflowIntake` row exists (`source` / metadata).
2. Sprint 2+ → matching `CampaignEventLedgerRecord` with `entrySource = WEBSITE_ENTRY`.
3. Workbench filter shows tentative lane.
4. Month review wizard includes row.
5. Approval package preview renders.
6. Travel/reimbursement paths unchanged for seeded months.

---

## Related generated graphs (self-build lane)

Separate from Campaign OS but same repo:

- `docs/REDDIRT_SELFBUILD_DEPENDENCY_GRAPH.md`
- `data/selfbuild/reddirt_selfbuild_dependency_graph.json`

Do not confuse **nightly self-build** graphs with this **Campaign OS** graph.

---

## Maintenance

Regenerate this doc when:

- A dotted edge in §1 becomes solid (sprint complete).
- A new blocker flag is introduced.
- A legacy route is retired (update §7).
