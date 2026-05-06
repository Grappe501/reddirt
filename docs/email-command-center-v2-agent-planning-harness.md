# Email Command Center V2 — Agent planning harness

**Packet:** **EMAIL-COMMAND-CENTER-V2-AGENT-PLANNING-HARNESS-1.0** (documentation only)  
**Lane:** `RedDirt/` only  
**Purpose:** Tell **future you / Cursor / ChatGPT** how to use the V2 blueprint **without** improvising scope or violating governance.

---

## Canonical read order

1. **V2 vision + layers:** [`email-command-center-v2-master-blueprint.md`](./email-command-center-v2-master-blueprint.md)  
1b. **RedDirt-wide V2 registry + SoT + consolidation:** [`REDDIRT_V2_MASTER_ARCHITECTURE.md`](./REDDIRT_V2_MASTER_ARCHITECTURE.md) · [`REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md`](./REDDIRT_V2_SOURCE_OF_TRUTH_POLICY.md) · [`REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md`](./REDDIRT_V2_CONSOLIDATION_REVIEW_POLICY.md) · [`../data/architecture/reddirt_v2_layer_registry.json`](../data/architecture/reddirt_v2_layer_registry.json) · [`../develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md`](../develop_notes/REDDIRT_V2_ARCH_REGISTRY_1_0_REPORT.md) (`node scripts/validate-v2-arch-registry.mjs`)  
2. **Shipped email reality (primary bar):** [`campaign-email-command-center-progress-ledger.md`](./campaign-email-command-center-progress-ledger.md)  
3. **Safe vs blocked + commands:** [`email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md)  
4. **AI stack closeout (what exists today):** [`email-ai-intelligence-upgrade-closeout.md`](./email-ai-intelligence-upgrade-closeout.md)  
5. **Handoff for new threads:** [`email-workflow-intelligence-AI-HANDOFF.md`](./email-workflow-intelligence-AI-HANDOFF.md) · [`THREAD_HANDOFF_MASTER_MAP.md`](./THREAD_HANDOFF_MASTER_MAP.md)

---

## Hard rules for any agent executing “self-build” later

- **No secrets** in docs, commits, logs, or suggested env.  
- **No sends** and **no** mass automation activation unless a **named packet** explicitly allows it and governance flags remain coherent (`email:no-send-scan`, `EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM`, hosted DB gates).  
- **No deletes** / **no repo moves** / **no cross-lane imports** unless Steve approves an integration packet (see workspace coordination rules).  
- **Human approval** for anything that changes **external** user-visible commitments, **production** data, or **provider** execution.  
- **Honest readiness:** “operator-proven” and “hosted-ready” labels require **evidence**, not narrative.

---

## What “put V2 in play in 6 hours” can mean (realistic)

The full V2 blueprint describes **years** of governed product evolution. In **six hours** of wall-clock time, a team can credibly:

| Window | Achievable (documentation + alignment) | Not achievable in six hours alone |
|--------|----------------------------------------|-----------------------------------|
| **0–2 h** | Freeze this harness + blueprint as **canonical**; add cross-links from [`campaign-email-command-center-master-plan.md`](./campaign-email-command-center-master-plan.md); align **naming** (V2 layers ↔ existing routes) in a **one-page mapping table** (new doc or section). | Full knowledge graph, RAG ingestion, predictive models, self-build queue execution. |
| **2–4 h** | Produce a **slice backlog template** (10–20 empty rows): layer, mission, allowed paths, forbidden paths, checks, governance touchpoints — **no** implementation. | Calendar AI, executive briefing generation, auto segmentation at scale. |
| **4–6 h** | Run **`npm run typecheck`**, **`npm run check`**, **`npm run email:no-send-scan`**, **`npm run email:ai:eval`** on `RedDirt/`; paste results into a **verification note** linked from the ledger footer; confirm **no** drift in “safe vs blocked” language. | Hosted Kelly-Grappe-App proof, live send proof, worker activation. |

**Interpretation for stakeholders:** “V2 in play” in six hours = **planning system + vocabulary + verification loop live**, not **the entire operating system built**.

---

## What the agent should prepare before writing code

When Steve (or a script) supplies **self-build instructions**, each slice packet should arrive with:

- **Layer IDs** (A–H from the blueprint)  
- **Files allowed to touch** (lane-local paths)  
- **Forbidden paths** (e.g. no `sos-public`, no Prisma in doc-only packets)  
- **Checks** (`typecheck`, `check`, `email:no-send-scan`, migrations policy)  
- **Human approval checkpoints**  
- **Rollback / feature flag / env** notes  

Until those exist, the agent’s job is **planning and documentation**, not expansion.

---

## Suggested next artifacts (future packets — not built here)

- `email-command-center-v2-layer-route-map.md` — table: Layer A–H ↔ routes/libs today ↔ “missing”.  
- `email-command-center-v2-slice-queue.md` — ordered backlog with dependencies.  
- `email-command-center-v2-readiness-matrix.md` — rows = layers, cols = readiness states from §10 of the blueprint.

---

*Last updated: **EMAIL-COMMAND-CENTER-V2-AGENT-PLANNING-HARNESS-1.0** — planning harness for six-hour alignment and future self-build slices; **no** implementation in this packet.*
