# Orchestration domain map

**Code source of truth:** `src/lib/agents/orchestration/orchestration-domains.ts` (`ORCHESTRATION_DOMAINS`)

20 domains · each maps to signal → context → reasoning → workflow → UX.

---

## Domain summary table

| Domain | Source of truth | Key route | Tool lifecycles | Top KPIs | Typical blockers | Human gates | Orchestration output |
|--------|-----------------|-----------|-----------------|---------|------------------|-------------|----------------------|
| Campaign Management | OS control + unified context | `/admin/ai-command-center` | `agent_os_control`, `campaign_orchestration_intelligence` | systemHealthScore, blockers | Stale period, unreviewed workflows | Prepared actions only | CM daily plan, top 3 moves |
| Candidate | Role copilot + briefing | `/admin/ai-command-center/copilots` | `kelly_os_copilot_tooling` | briefingReady | Missing run-of-show | No auto comms send | Candidate daily briefing |
| Calendar | Ledger + GCal sync | `/admin/campaign-calendar` | `calendar_intake`, `sprint5_calendar_promotion` | syncStale | Unpromoted tentative | GCal write human | Promotion queue workflow |
| Event Planning | Workbench + factCard | `/admin/campaign-events/workbench` | `event_planning_sprint6` | readinessScore | Incomplete fact card | Budget approval | Event execution package |
| Approvals | Review queues | `/admin/campaign-events/review` | `tentative_approval`, `sprint4_approval_email` | pendingApprovals | Held events | Recipient click | Approval chase workflow |
| Travel | Travel ledger | `/admin/campaign-events/travel` | `travel_ledger` | openTrips | Missing receipts | Treasurer review | Travel fix chain |
| Reimbursement | Ops JSON + packet | `/admin/campaign-events/reimbursement` | `mileage_reimbursement` | printReady | Open mileage | Print/export human | Close month workflow |
| Finance | Finance V2 | `/admin/campaign-events/finance` | `campaign_finance_sprint8` | burnRate | Unreconciled costs | No auto post | Finance-event fusion |
| Compliance | Readiness + receipts | `/admin/compliance` | `compliance_receipts` | filingReadiness | Receipt gaps | Filing human | Compliance gap workflow |
| County | countyWorkbench bridge | `/admin/county-intelligence` | `county_intelligence_bridge` | weakCounties | No field plan | Memory approval | Activate weak county |
| Field | County + field copilot | `/admin/county-intelligence` | copilot + county | fieldDailyPlan | Unassigned counties | No voter export | Field priority orchestration |
| Volunteer | Volunteer CRM | `/admin/volunteers` | `volunteer_system` | underusedSegments | Unstaffed events | Assignment confirm | Volunteer push workflow |
| Communications | Comms intelligence | `/admin/communications/intelligence` | `communications_system`, `email_os_suite` | fatigueRisk | Draft backlog | Mass send blocked | Comms sequence plan |
| Social Media | Comms + hot wash | `/admin/communications` | `communications_system` | postCadence | No recap | Publish human | Post-event comms chain |
| Host | Host workflows | workbench | `host_dashboard` | hostPipeline | Unconfirmed host | Invite list human | House party program |
| Hot Wash | hot-wash-intelligence | media routes | `hot_wash_learning`, sprint7 | learningCaptured | No hot wash filed | Memory approval | Hot wash → county router |
| Training | training-modules-data | `/admin/training` | `kelly_os_intelligence` | modulesComplete | Missing modules | Supervisor sign-off | Training → unlock router |
| Dashboard UX | dashboard-builder | dashboard-builder | sprint9, hardening | moduleUsage | Role mismatch | Safety guard | Simplification plan |
| Memory | memory review store | command center | agent_user_intelligence | pendingReviews | Unreviewed | All writes approved | Memory packages |
| Tool Builder | tool-builder-queue | tool-builder | kelly_os_intelligence | openTickets | UX friction | Human prioritize | Sprint recommender |

---

## Cross-domain fusion edges

```text
County ←→ Volunteer ←→ Communications   (activate weak county, volunteer push)
Event ←→ County ←→ Volunteer            (prepare county visit)
Finance ←→ Event ←→ Compliance        (close month, event costs)
Hot Wash → County → Memory              (strategy router)
Training → Dashboard UX                 (unlock router)
Communications → Volunteer              (retention router)
County → Calendar                       (event proposals, tentative only)
Section map → Dependency graph → Tool router → Playbooks → Action packets (Phase 4B)
```

**Phase 4B implementation:** `src/lib/agents/orchestration/cross-domain/`

Canonical sections: executive_command, county_intelligence, communications, email_os_ecc, events_calendar, volunteer_field, finance_reimbursement, compliance, content_media, donor_fundraising, scheduling, research_strategy, ask_kelly, tool_builder, training_copilots, memory_observations, public_site, deployment_readiness.

---

## Observation prefixes by domain

| Domain | Prefix examples |
|--------|-----------------|
| Campaign Management | `os_`, `agent_`, `system_`, `orchestration_` |
| County | `county_` |
| Communications | `comms_`, `communications_` |
| Copilot | role-specific (partial) |
| Training | `training_` |
| Dashboard | `dashboard_` |

---

## Domain map completeness

**Domains defined:** 20 / 20  
**Progress:** `[██████████] 100%` (planning)

---

*Implementation: extend `AgentDomain` in `cross-domain-context-composer.ts` to align with `CampaignDomainId` in Phase 2.*
