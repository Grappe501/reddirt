# AI Tool-Builder Intelligence Roadmap

**Doctrine:** AI proposes and drafts; humans approve; developers implement. **No autonomous production code changes.**

---

## Maturity levels

| Level | AI can | Human |
|-------|--------|-------|
| L0 | Observe friction via `user-observations` | — |
| L1 | Detect gaps (`ai-tool-gap-detector`, `campaign-gap-analyzer`) | Acknowledge |
| L2 | Draft tool contract + spec (`tool-contract-drafter`, `workflow-to-tool-spec-converter`) | Review |
| L3 | Generate build ticket + test plan + Cursor prompt (`tool-build-ticket-generator`) | Prioritize sprint |
| L4 | Scaffold file suggestions under `src/lib/agents/` | Merge PR |
| L5 | Implement with CI green | Ship (developer-owned) |

**Current:** L1–L2 partial. **Target before SaaS:** solid L3.

---

## Pipeline

```text
Observations + OS control loop
        ↓
  ai-tool-gap-detector
        ↓
  workflow-to-tool-spec-converter
        ↓
  tool-contract-drafter → tool-risk-reviewer
        ↓
  tool-build-ticket-generator (+ tool-test-plan-generator)
        ↓
  Human sprint slot → Cursor agent → npm run check
```

---

## Ticket template (markdown)

```markdown
## Tool: {id}
**Friction:** {observation summary}
**Proposed contract:** lifecycle, risk, routes
**Data reads/writes:** {tables, factCard paths}
**UI module:** {registry block or new route}
**Tests:** npm run …
**Guardrails:** human approval required: yes/no
**Cursor prompt:** (attached)
```

---

## Inputs

- `factCard._aiObservations`  
- Global observations JSON  
- OS control bundle recommendations  
- Sprint gap lists from command center  
- Operator palette queries that fail `routePaletteQuery`

---

## Outputs (allowed)

- Tool contract drafts in `sprint-*-tools.ts` (PR only)  
- Docs in `docs/campaign-events/`  
- `scripts/test-*.ts` stubs  
- Backlog entries — not Netlify deploy config

---

## Forbidden

- Auto-commit to `main`  
- Auto-enable `EMAIL_SEND_ENABLED`, `GOOGLE_CALENDAR_WRITE_ENABLED`  
- Auto-modify Prisma schema without migration review  
- Cross-lane imports

---

## AI tools (planning lifecycle)

`ai-tool-gap-detector`, `tool-contract-drafter`, `workflow-to-tool-spec-converter`, `tool-build-ticket-generator`, `tool-test-plan-generator`, `tool-risk-reviewer`

---

## Tie-in to “build the system that builds the system”

Each shipped sprint follows Sprint 4A rule: feature + tool + observation + V2 path. Tool-builder closes the loop when friction repeats **without** a catalog entry — turning ops pain into the next sprint slice.
