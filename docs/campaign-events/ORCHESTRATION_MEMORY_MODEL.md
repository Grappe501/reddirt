# Orchestration memory model

**Principle:** Memory makes the campaign brain **smarter over time** — never autonomous or creepy.

---

## Memory types

| Type | Example | Auto-suggest | Human approval | Affects recommendations |
|------|---------|--------------|----------------|-------------------------|
| Campaign pattern | “March reimbursements always slip after travel backlog” | Yes | **Required** | Workflow priority |
| County pattern | “Washington County responds to house parties” | Yes | **Required** | County activation |
| Volunteer pattern | “Weekend shift volunteers churn without follow-up” | Yes | **Required** | Volunteer push timing |
| Communications pattern | “Kelly tone: short thank-yous outperform long asks” | Yes | **Required** | Writing router hints |
| Event pattern | “House parties need host confirm 7 days out” | Yes | **Required** | Event readiness |
| Workflow friction | “Operators abandon reimbursement after mileage step” | Yes (from observations) | Optional ticket | Tool-builder queue |
| User preference | “CM prefers county view first” | Yes | **Required** | Dashboard adaptation |
| Training gap | “Treasurer skipped module FIN-3” | Yes | No (guidance only) | Training router |
| Dashboard need | “Field manager needs Power of 5 block” | Yes | No | Dashboard builder |
| Tool gap | “Need bulk county export (forbidden → ticket)” | Yes | Human prioritize | Sprint recommender |
| Strategic insight | “Momentum counties cluster in NW” | Yes | **Required** | Opportunity detector |
| Risk pattern | “Near mass-send threshold on draft X” | Yes | **Required** | Risk detector |
| Opportunity pattern | “3 counties ready for activation” | Yes | No | Opportunity cards |

---

## What can be auto-suggested

- Memory **candidates** from `orchestration-memory-candidate-builder`
- Observation-derived **friction tickets** (tool-builder, not long-term memory)
- **Training gap** lines (no persistent store without supervisor)
- **Opportunity** cards (ephemeral per session)

---

## What requires human approval

- All writes to **approved campaign memory**
- County memory enrichments (`county-memory-enricher.ts`)
- Hot wash → county strategy promotions
- Any memory implying **voter/contact PII** or outreach list content

---

## What must never be stored

- Raw voter file rows, full contact PII, inbox bodies
- Unsourced opponent claims
- Secrets, API keys, tokens
- Autonomous “send approved” flags set by AI
- Medical, financial account numbers beyond campaign compliance needs

---

## Storage surfaces

| Surface | Path / module |
|---------|----------------|
| Observations | `user-observations.json` |
| Memory review queue | `runtime/memory-review-store.ts` |
| County memory | `campaign-events/county-memory/` |
| Comms memory | `communications/memory/` |
| Tool-builder | `ai-tool-builder-queue.json` |

---

## Orchestration memory flow

```text
Signals (observations + hot wash + friction + CampaignState)
    → orchestration/knowledge/campaign-observation-intake
    → orchestration/knowledge/campaign-knowledge-graph
    → orchestration/knowledge/campaign-lessons-engine
    → CampaignState.knowledge (human review for sensitive/strategic)
    → next orchestration reasoning (Phase 3A live)
```

**Phase 3A live:** `src/lib/agents/orchestration/knowledge/`  
**Handoff:** `ORCHESTRATION_PHASE_3A_KNOWLEDGE_GRAPH_LESSONS_HANDOFF.md`

---

## Tool contracts (learning layer)

- `orchestration-memory-candidate-builder`
- `orchestration-observation-miner`
- `hotwash-to-county-strategy-router`

**Progress:** `[████████░░] 75%` model defined; **Phase 3A knowledge graph live**

---

*Aligns with `CAMPAIGN_MEMORY_EVOLUTION.md` and OS control “no autonomous writes” doctrine.*
