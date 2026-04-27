# Data model inventory — **Pass 2A** (cross-wired)

**Source:** `prisma/schema.prisma` + `SYSTEM_CROSS_WIRING_REPORT.md`. **100+** models total — this file lists **major** cross-wiring. **Privacy:** H high, M medium, L low (public aggregate safe).

## Core identity and intake

| Model | Purpose | Feature | Public | Admin | Routes / pages | Sens | WF | Mat | Missing policy |
|-------|---------|-----------|--------|-------|----------------|-----|----|-----|----------------|
| **User** | CRM person | All | Indirect | Yes | forms, admin | H | Y | 5 | Access matrix; voter link |
| **VolunteerProfile** | Vol fields | Field | No | Yes | volunteer form | M | Y | 4 | Full P5 fields?
| **Submission** | Content + form data | Intake | No | Yes | handlers | M | Y | 5 | Retention |
| **WorkflowIntake** | **Master queue** | **OS spine** | No | Yes | workbench | M | **Y** | 5 | SLA; `metadata` display policy |
| **WorkflowAction** | Audit on intake | Ops | No | Yes | — | M | Y | 4 | |
| **EventRequest** | Schedule bridge | Events | No | Yes | — | M | Y | 4 | |
| **CampaignTask** | Work | Ops | No | Yes | tasks, open-work | M | Y | 4 | |
| **SignupSheetDocument/Entry** | Paper intake | V.C. | No | Yes | volunteers/intake | H | Y | 4 | Match quality SOP |

## County + elections

| Model | Purpose | Public | Admin | Sens | Mat |
|-------|---------|--------|-------|------|-----|
| **County** | Geography hub | Yes (aggregate) | Yes | L/M | 5 |
| **CountyVoterMetrics** | Stats | Aggregate | Yes | L | 5 |
| **CountyCampaignStats** | Program | Partial | Yes | M | 4 |
| **CountyStrategyKpi** | Strategy | Maybe | Yes | M | 3 |
| **Election\*** results | History | Aggregate | Yes | L | 4 |
| **VoterFileSnapshot** | Import batch | No | Yes | **H** | 4 |
| **VoterRecord** | Person row | **No** public | Yes | **H** | 4 |
| **VoterModelClassification** | Model | No | Yes | **H** | 4 |
| **RelationalContact** | REL-2 graph | No | Yes | **H** | 4 |
| **VoterVotePlan** | GOTV | No | Staff | **H** | 3–4 |

## Comms + narrative

| Model | Purpose | WF | Mat |
|-------|---------|----|-----|
| **CommunicationPlan** | **MCE/NDE** container | source intake | 5 |
| **CommunicationDraft** / **Variant** | Copy | Y | 5 |
| **CommunicationSend** | Execution | Y | 4–5 |
| **CommunicationCampaign** | Tier-2 rail | Y | 4 |
| **EmailWorkflowItem** | Gmail rail | intake | 4 |
| **MediaOutreachItem** | Press | intake | 4 |

## Social + owned media + orchestrator

| Model | Purpose | Mat |
|-------|---------|-----|
| **SocialContentItem** | Post / work | 4 |
| **ConversationOpportunity** | Monitor → intake | 4 |
| **OwnedMediaAsset** | Brain / media | 4 |
| **InboundContentItem** | Orchestrator | 4 |
| **ContentDecision** | Audit | 4 |

## Field + finance + compliance

| Model | Purpose | Mat |
|-------|---------|-----|
| **FieldUnit** / **FieldAssignment** | FIELD-1 | 4 |
| **PositionSeat** | Org seat | 3–4 |
| **FinancialTransaction** | FIN-1 | 4 |
| **BudgetPlan** | BUDGET-2 | 3–4 |
| **ComplianceDocument** | COMP-2 | 4 |

## Special: `WorkflowIntake.metadata`

- May include **`ai`** key from `classifyIntake` — **internal** use; **manual** requires **UI** mapping to **non-AI** staff labels before any **volunteer** visibility.

**Last updated:** 2026-04-27 (Pass 2A). **Full list:** `docs/database-table-inventory.md` (DBMAP-1).
