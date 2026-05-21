# AI Agent Tool Build Map

**Lane:** `RedDirt/`  
**Catalog source of truth:** `src/lib/campaign-events/ai-tools-master-catalog.ts` (+ `ai-tools-supplement.ts`)  
**UI:** `/admin/campaign-events/ai-tools`  
**Deep doc:** [`AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md`](./AI_AGENT_OPERATIONAL_TOOL_SYSTEM.md)  
**Roadmap:** [`MASTER_CAMPAIGN_OS_ROADMAP.md`](./MASTER_CAMPAIGN_OS_ROADMAP.md) · **Sprint status:** [`BUILD_SPRINT_STATUS.md`](./BUILD_SPRINT_STATUS.md)

---

## Catalog snapshot (code-grounded)

| Metric | Value |
|--------|-------|
| Lifecycle groups | 22 |
| Tools (master + supplement, deduped) | ~100 |
| Status: **functional** | ~31 |
| Status: **partial** | ~37 |
| Status: **scaffolded** | ~18 |
| Status: **idea** | ~45 |
| Human approval required (majority of write paths) | Yes |

**Rule:** New tools → edit catalog only. Wire runtime in sprint packets; update `ai-tools-operational-meta.ts` when files exist.

**Maturity score** on AI tools page = average of status points (functional=100, partial=65, scaffolded=30, idea=5). **Not** month reimbursement readiness.

---

## Sprint → AI tools matrix

Tools below are **named in the master build plan**. Map to catalog `id` for implementation and status updates.

### Sprint 0 — Build control

| Planned agent | Catalog id (closest) | Status | Sprint action |
|---------------|---------------------|--------|---------------|
| *(none — docs only)* | — | — | Keep catalog in sync with this map |

---

### Sprint 1 — Reimbursement

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Reimbursement readiness checker | `mr-reimburse-dollar` + month-readiness | partial / functional | Extend `month-readiness` scoring for reimb finalization |
| Mileage anomaly detector | `mr-rt-miles` | functional | Add anomaly rules module (deterministic first) |
| Missing city/county resolver | `cri-infer-county`, `fc-zip-county` | partial | Queue on travel-log + review `focus=` params |
| Reimbursement summary writer | `tl-month-report` | functional | Add narrative export block on travel-report / reimbursement |
| Final packet checklist agent | *(new id recommended)* `mr-final-packet-checklist` | idea | Add to catalog; checklist UI on reimbursement page |

**Related functional tools:** `mr-origin-rule`, `mr-rt-miles`, `appr-month-wizard` (travel mode), `tl-month-report`.

---

### Sprint 2 — Intake → ledger

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Intake-to-ledger bridge | `intake-to-ledger-bridge` | **functional** | `intake-ledger-bridge.ts` on persist |
| Intake duplicate detector | `intake-duplicate-detector` | **functional** | `_intake.duplicateRisk` |
| Intake conflict detector | `intake-conflict-detector` | **functional** | `_intake.scheduleConflict` |
| Tentative event router | `tentative-event-router` | **functional** | `calendar-lane.ts` + `TENTATIVE_CALENDAR` |
| Intake summary builder | `intake-summary-builder` | **functional** | `intake-inference.ts` |
| Tentative review assistant | `tentative-review-assistant` | **functional** | `IntakeAiSummaryCard.tsx` |
| Website intake normalizer | `website-intake-normalizer` | **functional** | fact card seed from form |
| Schedule risk scanner | `schedule-risk-scanner` | **partial** | assistant flags + overlap |
| Intake classifier | `intake-classify-type` | functional | Used in bridge inference |
| Missing-info detector | `fc-missing-gaps` | functional | `inferred.missingFields` |
| Approval package builder | `appr-package-build` | partial | Existing scaffold; intake rows eligible |

---

### Sprint 3 — Google Calendar truth

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| GCal read status checker | `gcal-read-status-checker` | **functional** | `resolve-ledger-calendar-sync.ts` |
| GCal ledger match assistant | `gcal-ledger-match-assistant` | **functional** | `match-calendar-truth-to-ledger.ts` |
| Normalized JSON freshness monitor | `normalized-json-freshness-monitor` | **functional** | `normalized-json-freshness.ts` |
| Website-only event router | `website-only-event-router` | **functional** | truth `WEBSITE_ENTRY_ONLY` |
| Imported-only event router | `imported-only-event-router` | **functional** | truth `IMPORTED_FROM_NORMALIZED_JSON` |
| Stale calendar warning agent | `stale-calendar-warning-agent` | **functional** | workbench banner + dashboard |
| Tentative calendar readiness | `tentative-calendar-readiness-checker` | **partial** | lane + truth status |
| Official calendar readiness | `official-calendar-readiness-checker` | **partial** | lane + truth status |
| Calendar sync command advisor | `calendar-sync-command-advisor` | **functional** | calendar-sync dashboard CLI block |
| Conflict detector | `conf-schedule`, `conf-work-hours` | functional | GCal title/date conflict |
| Calendar freshness monitor | `intake-gcal-read` | partial | Extended via truth layer |

---

### Sprint 4 — Approval package automation

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Approval summary writer | `appr-package-build` | partial | Email body generator (draft only until send on) |
| Missing-info email drafter | `email-draft-scaffold` | partial | Tie to approval package gaps |
| Decision parser scaffold | `appr-parse-reply` | idea | MIME parser stub + human audit UI |
| Approval risk checker | `conf-schedule` + inference | partial | Package risk section |
| Hold/deny reason summarizer | `appr-month-wizard` | functional | Post-decision summary on factCard |

**Gated:** `appr-email-send` (idea) — enable only with `EMAIL_SEND_ENABLED`.

---

### Sprint 5 — Official GCal promote

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Promotion eligibility checker | `appr-promote-official` | idea | Pre-flight blockers list |
| Google Calendar payload builder | `intake-gcal-read` | partial | Outbound payload builder (no auto POST) |
| Conflict-before-promote checker | `conf-schedule` | functional | Run before promote confirm modal |
| Calendar write audit agent | *(new)* `gcal-write-audit` | idea | Log to `EventSyncLog` / factCard |

---

### Sprint 6 — Event planning drilldown

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Run-of-show generator | `ros-generator` (supplement) | idea | Drilldown tab + template |
| Pack-list generator | materials lifecycle tools | idea/scaffolded | Link `campaign-materials-inventory.json` |
| Volunteer estimator | `vol-estimate` | partial | Already in inference |
| Candidate briefing writer | `cb-daily-agenda` | scaffolded | Server draft optional |
| CM briefing writer | `cm-planner-notes` | scaffolded | Same |
| Event risk scanner | `conf-*` + inference | partial | Single “risk” panel on drilldown |

---

### Sprint 7 — Hot wash + media

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Speech transcriber | hot_wash lifecycle | idea | OwnedMediaTranscript pipeline |
| Quote extractor | OwnedMediaQuoteCandidate | partial schema | Wire after ingest |
| Event memory builder | `hot-wash-event-memory` (supplement) | idea | Chunk → SearchChunk or dedicated store |
| County memory builder | county intel tools | partial | Post-approval archive |
| Media approval assistant | media-approval route | partial | Queue AI assist (advisory) |
| Post-event learning extractor | `hot-wash-learning` (supplement) | idea | After approval only |

**Docs:** `HOT_WASH_*` in `docs/campaign-events/`.

---

### Sprint 8 — Finance / compliance

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Compliance category suggester | compliance lifecycle | idea | Map to `FinancialTransaction` categories |
| Reimbursement-to-FIN mapper | `tl-event-link` | idea | **Core Sprint 8** |
| Receipt matcher | compliance/receipts JSON + FIN | idea | Link `ComplianceDocument` |
| Audit packet builder | compliance exports | idea | Align `data/compliance/` exports |
| Finance anomaly detector | `mr-reimburse-dollar` | functional | Cross-check ledger vs FIN rows |

---

### Sprint 9 — Dashboards

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Dashboard priority agent | CM/candidate briefing tools | scaffolded | Command center widget |
| Next-action recommender | `ai-agent-runbook` stages | functional doc | Surface on dashboards |
| Campaign health summarizer | BRAIN-OPS truth snapshot | partial | Reuse `getTruthSnapshot` |
| Candidate daily brief agent | `cb-daily-agenda` | scaffolded | Email/print brief (no auto send) |
| CM daily ops brief agent | `cm-planner-notes` | scaffolded | Same |

---

### Sprint 10 — Client product

| Planned agent | Catalog id | Status | Build action |
|---------------|------------|--------|--------------|
| Client onboarding agent | `saas_client_dashboard` group | idea | Tenant setup wizard |
| Campaign setup wizard | `saas-planner-scaffold` | scaffolded | Generalize Franklin planner |
| Product demo narrator | *(new)* | idea | Demo mode only |
| Tenant config checker | *(new)* | idea | Preflight for client env |
| Client health report agent | `saas-*` | idea | Weekly ops PDF/email draft |

---

## Implementation order (AI layer)

Across sprints, prefer this **tooling** sequence:

1. **Deterministic** helpers (queues, counts, conflicts) — no OpenAI required.
2. **Draft / scaffold** outputs saved on `factCard` or `metadataJson` — human publishes.
3. **OpenAI optional** paths behind `OPENAI_API_KEY` — same guardrails as email AI / intake classify.
4. **Outbound** tools last — always behind config flags + human approval.

---

## Files to touch when wiring a tool

| Concern | File |
|---------|------|
| Register tool | `ai-tools-master-catalog.ts` or `ai-tools-supplement.ts` |
| Files + routes + checklist | `ai-tools-operational-meta.ts` |
| Dashboard sections | `ai-tools-command-center.ts` |
| Operator runbook | `ai-agent-runbook.ts` |
| UI | `AiToolsCommandCenter.tsx` |

---

## Agent runbook (13 stages)

End-to-end process stages live in `src/lib/campaign-events/ai-agent-runbook.ts`. Align sprint work to stages:

1. Intake → 2. Classify → 3. Ledger row → 4. Review → 5. Travel → 6. Reimbursement → 7. Approval → 8. Calendar promote → 9. Execute event → 10. Hot wash → 11. Finance → 12. Report → 13. Learn

Update runbook stage notes when a sprint closes.

---

## Maintenance checklist

After each sprint:

- [ ] New tools added to catalog with unique `id`
- [ ] `deriveOperationalMeta()` picks up routes from `implementationFiles`
- [ ] Status bumped (`idea` → `scaffolded` → `partial` → `functional`)
- [ ] This map’s sprint table updated
- [ ] No duplicate catalog in deprecated `ai-tools-catalog.ts`
