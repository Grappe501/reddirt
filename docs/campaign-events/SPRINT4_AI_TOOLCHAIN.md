# Sprint 4 AI toolchain

**Protocol:** Every sprint objective ships **feature + V1 AI tool + observation events + V2 path + human guardrail**.

## V1 tools (15)

| ID | Status | Helper |
|----|--------|--------|
| `email-architecture-tracer` | functional | `sprint4-tool-helpers.ts` |
| `approval-email-config-checker` | functional | `approval-email-config.ts` |
| `approval-email-template-builder` | functional | `approval-email-template.ts` |
| `approval-email-subject-writer` | functional | `approval-email-assist.ts` |
| `approval-email-summary-writer` | functional | `approval-email-assist.ts` |
| `approval-token-builder` | functional | `approval-token-store.ts` |
| `approval-token-validator` | functional | `load-approval-public-page.ts` |
| `approval-action-writer` | functional | `approval-token-actions.ts` |
| `approval-send-guard` | functional | `approval-email-send.ts` |
| `approval-send-audit-logger` | functional | `approval-email-persist.ts` |
| `approval-inbox-router` | functional | `load-campaign-events-dashboard.ts` |
| `approval-email-risk-scanner` | functional | `approval-package.ts` |
| `approval-followup-recommender` | scaffolded | `sprint4-tool-helpers.ts#recommendApprovalFollowUp` |
| `approval-human-review-gate` | functional | `tool-contract.ts` policy |
| `approval-google-write-blocker` | functional | `sprint4-tool-helpers.ts#assertApprovalPathNoGoogleWrite` |

Contracts: `src/lib/campaign-events/ai-tools/tool-contract.ts`  
Catalog lifecycle: `sprint4_approval_email` (supplement)  
Command center: `/admin/campaign-events/ai-tools` → **Sprint 4 email** tab

## Observations

Stored append-only on `factCard._aiObservations` (max 200 per event).

Examples: `approval_email_sent`, `token_opened`, `decision_approved`, `approval_email_send_blocked`.

Utilities: `ai-tools/observations.ts`, `ai-tools/observations-persist.ts`, `record-approval-observation.ts`

## Human control

- AI may suggest, draft, summarize, score, route.
- AI may **not** send, approve, deny, hold, promote GCal, or post financial transactions without human action.
- `EMAIL_SEND_ENABLED` remains the transport gate.

## V2 pathways (summary)

| Tool | V2 |
|------|-----|
| Template builder | Learn tone from edited email bodies |
| Risk scanner | Predict packages needing more info pre-send |
| Follow-up recommender | Optimal resend timing from observation history |
| Summary writer | Candidate preference adaptation |
| Action writer | Reply-by-email parser |
| Inbox router | Urgency prioritization |
| Token builder | Prisma + per-recipient binding |
| Config checker | Deploy preflight webhook |

## Pipeline order

Config → architecture trace → package/summary → risk → subject/template → tokens → human gate → send guard → audit → inbox → validate → decision → GCal blocker → follow-up hint

See command center pipeline UI for live status.
