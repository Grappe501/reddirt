# Compliance AI Orchestrator pass

## Delivered

### Orchestration layer (`src/lib/compliance/ai/orchestrator/`)

- **Global next-best-action engine** — ranks safe actions from brain, reconciliation, rules, queue, and filing state.
- **Impact forecasting** — heuristic per-action impact (launch points, recon items, filing blockers).
- **Decision guard** — blocks unsafe recommendations (batch rule_review, fake filing green, auto-approve, unverified production bank).
- **Role plans** — Treasurer, Operator, Steve, AI assist, Engineer, Compliance officer.
- **Delta tracking** — compares to prior `orchestrator.json` by commit and metrics.
- **Zod validation** — all JSON outputs schema-validated in `compliance:ai-orchestrator:qa`.

### Commands

| Command | Output |
|---------|--------|
| `npm run compliance:ai-orchestrator` | All artifacts + briefs |
| `npm run compliance:ai-orchestrator:qa` | Regenerate + Zod assert |
| `npm run compliance:ai-delta` | `delta.json` |
| `npm run compliance:ai-impact-forecast` | `impact-forecast.json` |
| `npm run compliance:ai-role-plans` | `role-plans.json` |
| `npm run compliance:ai-decision-guard` | `decision-guard.json` |
| `npm run compliance:ai-executive-brief` | `COMPLIANCE_AI_EXECUTIVE_BRIEF.md` |

### Command center

AI Orchestrator panel: next best action, owner, impact, today's plan, unsafe shortcuts, changes since last pass.

### Docs

- `COMPLIANCE_AI_ORCHESTRATOR_BRIEF.md` (operator)
- `COMPLIANCE_AI_EXECUTIVE_BRIEF.md` (executive, no PII)

## Safety

- No auto-approve
- No fake filing green
- Confidence threshold unchanged
- No batch rule_review
- Production bank not assumed unless `COMPLIANCE_BANK_PRODUCTION_VERIFIED=true` or non-Netlify validated chunks
- AI JSON gitignored — not committed

## Regenerate full stack

```bash
npm run compliance:ai-orchestrator
npm run compliance:ai-orchestrator:qa
npm run compliance:qa-full
```
