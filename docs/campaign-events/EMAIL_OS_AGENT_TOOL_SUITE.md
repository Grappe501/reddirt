# Email OS Agent Tool Suite

**Lane:** `RedDirt/` · Kelly single-campaign
**Lifecycle:** `email_os_suite` (Sprint 15)
**Catalog:** `src/lib/campaign-events/ai-tools/sprint-email-os-agent-tools.ts` (~58 tools)

## What this package covers

| Layer | Tools | Code roots |
|-------|-------|------------|
| ECC cockpit | Readiness, snapshot, launch room, migration | `src/lib/email-command-center/` |
| Audiences | Import, health, sync, strategist | `contact-import.ts`, `audience-list-health.ts` |
| Message Studio | Templates, drafts, deterministic critic, voice | `message-templates.ts`, `ai-draft-critic.ts` |
| Send execution | Preflight, human gate, mass block | `send-execution*.ts` |
| SendGrid | Foundation, mail send guard, events | `sendgrid/`, ECC reconciliation |
| Inbox workflow | Gmail watch, queue, interpretation | `email-workflow/` |
| Campaign OS comms | Bundle, store, intelligence bridge | `communications/`, `campaign-events/communications/` |
| Approval email | Path trace, readiness bridge | `sprint4_approval_email` lifecycle |

## Agent runtime

- **Helpers:** `email-os-tool-helpers.ts` — deterministic, no send
- **Router:** `email-os-agent-tool-router.ts` — maps tool id → helper result
- **Human rules:** `CAMPAIGN_AI_HUMAN_CONTROL_RULES` in `tool-contract.ts`

## Rails (operator paths)

1. **ECC** — `/admin/workbench/email-command-center` (governed SendGrid)
2. **Message Studio** — draft + critique + revisions
3. **Communications center** — JSON contacts + templates
4. **Communications intelligence** — `/admin/communications/intelligence`
5. **Message Studio (Campaign OS)** — `/admin/communications/studio`
6. **Approval tokens** — `/campaign-events/approval`

## Test

```bash
npm run agents:test-email-os-suite
npm run campaign-events:test-communications
npm run communications:test-intelligence
```

## Stack totals (approx.)

- `email_os_suite`: ~58 new tools
- `communications_system`: ~66 (Sprint 13 + 14 V2)
- `sprint4_approval_email`: 17

Agents should prefer **Email OS suite** tools for ECC/Message Studio/send paths and **communications_system** for relationship/sequence/county messaging.
