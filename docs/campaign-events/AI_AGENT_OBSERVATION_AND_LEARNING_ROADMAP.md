# AI agent observation and learning roadmap

**Goal:** Learn from **operator behavior** and **outcomes** without autonomous policy changes or hidden training on PII.

---

## Agent Intelligence Sprint 1 (May 2026)

- **22 UX events** in `user-observations.ts` — global log at `data/campaign-events/user-observations.json`
- **Union type** `AiObservationEvent` on ledger `factCard._aiObservations`
- **Writing style log** at `data/campaign-events/writing-style-observations.json`
- Panel labels in `AiObservationsPanel` for common UX events

## Agent Intelligence Sprint 2 (May 2026) — live capture

### What is logged

- Event name, role, pathname, optional `recordId`, optional `toolId`, safe `meta` keys (alphanumeric, max 200 chars/value)
- Admin session required (`recordAgentObservationAction`)
- Append-only file: `data/campaign-events/user-observations.json` (cap 500 entries)

### What is NOT logged

- Full email bodies, phone numbers, SSN, or arbitrary freeform PII
- Meta keys containing `email`, `phone`, or `ssn`
- External/public analytics — internal admin only

### Writing observations

- Metadata in `data/campaign-events/writing-style-observations.json` (cap 200)
- Optional snippet hint max 80 chars — no full drafts by default

### Clear / disable

- Delete or trim JSON files under `data/campaign-events/` to reset
- Remove `AgentObservationTracker` from a page to stop capture there
- Future: `AGENT_OBSERVATIONS_ENABLED=false` env (not wired yet)

### Test

`npm run agents:test-observations` — dry-run append + context/friction/memory summary

## 1. Signals to capture (V1 — partial today)

| Signal | Source today | Storage today | V2 target |
|--------|--------------|---------------|-----------|
| AI tool invoked | Event OS observation hooks | `factCard._aiObservations` | Central observation store |
| Promotion attempted/succeeded/failed | Sprint 5 | audit log + observations | Same + metrics |
| Approval email drafted/sent/blocked | Sprint 4 | `_approvalEmailLog` + observations | Same |
| Operator approve/deny/hold | Month review | `_review.decision` | Decision timing model |
| Operator edited fact card fields | Drilldown save | factCard version diff | Field-level edit log |
| Operator overrode readiness warning | Promotion workbench | `operator_overrode_warning` | Risk calibration |
| Mileage/city/county accepted | Month review assist | factCard travel/where | County/host memory |
| Sync stale / promotion blocked | Sync dashboard | UI + audit | Alerting |
| Ask Kelly missed feedback | CampaignGuideDock | feedback form (beta) | Public feedback store |
| Kelly Agent recommend viewed | recommend API | (minimal) | Trace log |

---

## 2. Acceptance / rejection (planned)

| Event | Meaning | Implementation sketch |
|-------|---------|------------------------|
| `suggestion_accepted` | Operator clicked “accept” on AI assist | Button hooks on inference assists |
| `suggestion_rejected` | Operator dismissed or edited away | Compare pre/post field on save |
| `suggestion_edited` | Operator used partial assist | Diff assist output vs saved value |

**Rule:** Never train on rejected suggestions as positive examples.

---

## 3. Outcome-linked learning (planned)

| Outcome | Link |
|---------|------|
| Event held / cancelled | `eventStatus` + hot wash notes |
| Hot wash quality | media + notes after event |
| Reimbursement finalized | reimbursement month status |
| Approval turnaround time | `approvalTimeline` timestamps |
| Promotion retry success | `_calendarPromotionLog` sequences |

Use outcomes for **ranking** suggestions, not auto-approval.

---

## 4. Pattern mining (`observation-pattern-miner`)

Batch jobs (future scripts):

1. Aggregate `_aiObservations` by period → top event types.
2. Repeated `missingItems` from promotion readiness → doc/checklist updates.
3. County-specific missing county fields → county memory prioritization.
4. Host-specific gaps on house meet & greets → host memory tool.
5. Volunteer staffing warnings vs actual outcomes → calibrate `volunteer-capacity-tool`.

**Output:** Weekly ops markdown report — no auto schema change.

---

## 5. Knowledge / RAG learning path

| Tier | Content | Tool |
|------|---------|------|
| T0 | Prompts (`openai/prompts.ts`) | Manual edit |
| T1 | SearchChunk ingest (`npm run ingest*`) | `knowledge-chunk-router` |
| T2 | Operator-approved Q&A pairs | Future “approved answers” table |
| T3 | County field records (verified) | countyWorkbench import adapter |

**No** fine-tuning on voter PII. **No** embedding raw email bodies without redaction policy.

---

## 6. Governance

- Learning adjusts **ranking** and **wording** of suggestions only until Steve approves automation expansions.
- `human-approval-gate-enforcer` remains default deny for writes.
- All observation payloads must pass **no real PII in smoke tests** rule.

---

## 7. Milestones

| Milestone | Deliverable |
|-----------|-------------|
| L1 (now) | Shared observation types across Sprint 4/5; this roadmap |
| L2 | `suggestion_accepted/rejected` on month review assists |
| L3 | Weekly `observation-pattern-miner` script |
| L4 | Central observation Prisma table (optional) |
| L5 | Router learns domain weights from acceptance rates |

---

*Companion: [`ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md`](./ALL_KNOWING_CAMPAIGN_AGENT_ARCHITECTURE.md)*
