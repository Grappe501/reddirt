# NSI AI Tooling Status Report

**Program:** National Strategic Intelligence (NSI)  
**Lane:** `RedDirt/`  
**Audit date:** 2026-05-29  
**Core rule:** Deterministic composition first; LLM is optional, gated, and never autonomous.

---

## AI TOOLING STATUS REPORT

### 1. Current AI capabilities

| Capability | Implementation | Autonomy |
| ---------- | -------------- | -------- |
| Deterministic copilot tools (36) | `aiCopilotOrchestrator.ts` + registry JSON | None — outputs INTERNAL_DRAFT |
| LLM draft synthesis | `llmDraftGateway.ts` + OpenAI env | None — queue + human review |
| Deterministic morning brief composition | `intelligenceBrainCoordinator.ts` | None — read-only synthesis |
| Scenario simulation | `strategicScenarioSimulation.ts` | None — rule-based scoring |
| Human action recommendations | `strategicDecisionSupport.ts` | None — RECOMMENDATION_ONLY |
| Opposition suggestion candidates | `kimHammerSuggestionSandbox.ts` | None — sandbox disposition |
| Media intelligence ranking | `mediaIntelligenceCopilot.ts` | None — routing hints |
| Writing toolbox | `aiWritingToolbox.ts` | None — template-driven drafts |
| Compliance AI briefs (adjacent) | `compliance:ai-*` scripts | Separate lane; governed |

**Not present (by design):** autonomous posting, auto-export, auto-claim approval, voter-level scoring, unsourced opponent attack generation.

---

### 2. Prompt infrastructure

| Component | Location | Status |
| --------- | -------- | ------ |
| LLM prompt template registry | `data/intelligence/llm-prompt-template-registry.json` | LIVE |
| Governance headers on drafts | `llmDraftGateway.ts` | INTERNAL_DRAFT / NON_PUBLISHABLE / HUMAN_REVIEW_REQUIRED |
| Copilot tool purpose strings | `ai-copilot-tool-registry.json` | Per-tool operator next actions |
| Template categories | opposition_research, debate_prep, briefing_papers, writing_tools | 36 tools mapped |

**Gap:** No centralized prompt version diff UI; templates are JSON-edited.

---

### 3. Model orchestration

| Layer | Behavior |
| ----- | -------- |
| NSI-11 default | **GOVERNED_DETERMINISTIC** — no model call |
| NSI-12 optional | OpenAI via `OPENAI_API_KEY` / `OPENAI_MODEL` / `OPENAI_EMBEDDING_MODEL` |
| Copilot → LLM bridge | `runCopilotWithLlmDraftQueue` routes tool output to review queue |
| Embeddings | Used where ingest/RAG paths exist; not voter microtargeting |

**Gap:** No multi-model router (Claude/Gemini failover), no cost/latency budget dashboard.

---

### 4. Routing systems

| Router | Routes to |
| ------ | --------- |
| Copilot `routedSystems` | evidence_command, debate_prep, writing_toolbox, media_intake, etc. |
| NSI-15 `actionQueueRouting` | Owner roles + workflow types from copilot hints |
| Media copilot | High-relevance findings → intake review (not auto-task) |
| LLM promoted drafts | `llm-promoted-workflow-drafts.json` after human promote |

---

### 5. Intelligence copilots (NSI-11)

**Registry:** `data/intelligence/ai-copilot-tool-registry.json`  
**Tool count:** 36  
**Categories:**

| Category | Count (approx) | Examples |
| -------- | -------------- | -------- |
| opposition_research | 10 | vulnerability-finder, contradiction-scout, bill-impact-analyzer |
| debate_prep | 8 | trap-question-detector, rebuttal-builder, what-not-to-say-detector |
| briefing_papers | 6 | morning-brief-synthesizer, executive-summary-builder |
| writing_tools | 8 | candidate-talking-point-builder, press-statement-draft-builder |
| intelligence_gathering | 4 | media-signal-scanner, registration-pathway-auditor, etc. |

**Surfaces:** `/admin/intelligence/ai-tools`, `/admin/intelligence/kim-hammer/ai-opposition-copilot`, debate-ai-workbench.

**Test:** `npm run agents:test-ai-intelligence-copilot-tools` (36 tools).

---

### 6. Advisory systems

| System | Role |
| ------ | ---- |
| NSI-15 Human Action Queue | Cross-slice “what to do next” |
| NSI-14 Scenario outputs | Risk/opportunity/debate-trap advisories |
| NSI-13 Memory signals | Drift/staleness warnings |
| Evidence Command panels | Multi-slice operator summary |
| Morning Brief sections | Daily leadership advisory |

---

### 7. Review systems

| Queue | Gate |
| ----- | ---- |
| LLM draft review | Human disposition per draft |
| Public media intake | NEEDS_REVIEW / NON_PUBLISHABLE |
| AI suggestion sandbox | Accept / dismiss / archive |
| Claim review | V2-A status machine |
| Citation locker | Source health + review band |

---

### 8. Governance systems

| Mechanism | Enforcement |
| --------- | ----------- |
| `llmGovernanceSafety.ts` | Header validation, prohibited patterns |
| `kimHammerPublicationSafety.ts` | Export tiers, blockers |
| Copilot `prohibitedActions` | auto_publish, create_claim, export, voter_targeting |
| NSI-15 labels | HUMAN_ACTION_REQUIRED, RECOMMENDATION_ONLY |
| Audit logs | Append-only per workflow |

**Human approval layer maturity:** effectively **100%** for anything public-facing.

---

### 9. Confidence systems

| Signal | Source |
| ------ | ------ |
| Research confidence score | Kim Hammer workbench |
| Scenario confidence bands | NSI-14 registry |
| Citation source health | Citation locker |
| Claim review status | supported / partial / needs research |
| Narrative readiness | NSI-1 state machine |

**Gap:** No unified calibrated confidence model across slices (0–1 Bayesian).

---

### 10. Evidence systems

| System | Function |
| ------ | -------- |
| Evidence Command | Claim index + export-ready filter |
| Citation locker | Cards, health, workflow |
| Bill civic intelligence | Statutory anchors |
| Arkleg generated reports | Legislative source grounding |

**Rule enforced:** people-vs-government framing; no unsourced opponent claims in export paths.

---

### 11. Source-grounding systems

- Arkleg bill ingest + dry-run artifacts
- Citation locker URLs and source types
- Media intake source registry (NSI-9)
- Public meeting watchlist
- Doctrine registry (SDI-1) for alignment checks

**Gap:** No automated live fact-check API against opponent statements in real time.

---

### 12. Hallucination-prevention systems

| Control | Status |
| ------- | ------ |
| Deterministic-first copilots | STRONG |
| LLM drafts marked NON_PUBLISHABLE | STRONG |
| Export safety tiers | STRONG |
| Claim/citation mutation blocked from AI | STRONG |
| RAG with governed corpus only | PARTIAL — depends on ingest coverage |

---

### 13. Uncertainty systems

- Scenario “confidence band” labels
- `blockedBy` / `evidenceDependencies` on action queue items
- Intelligence gaps workbench
- Research gaps and retrieval task suggestions

**Gap:** No explicit epistemic uncertainty UI (e.g. “we don’t know X yet” dashboard widget).

---

### 14. Briefing systems

| Surface | Engine |
| ------- | ------ |
| Morning Brief | `intelligenceBrainCoordinator` + NSI-7 paper |
| Briefing papers | `strategicBriefingPaperEngine` |
| County briefings | NSI-5 |
| Debate prep papers | debate command + KH workbench |
| Compliance executive briefs | Adjacent compliance lane |

---

### 15. Recommendation systems

| System | Type |
| ------ | ---- |
| NSI-15 Action Queue | Human action recommendations |
| Copilot `operatorNextAction` | Per-tool guidance |
| Scenario `recommendedHumanReviewActions` | Post-simulation |
| LLM draft action hints | REVIEW_LLM_DRAFT, etc. |

---

### 16. Simulation systems

**NSI-14:** `strategicScenarioSimulation.ts`  
- Opponent response, narrative collision, debate traps, media escalation, county reaction, turnout/registration risks  
- Feeds NSI-15 and Evidence Command  
- **Not** Monte Carlo election forecasting

---

### 17. Forecasting systems

| Type | Status |
| ---- | ------ |
| Qualitative scenarios (NSI-14) | LIVE |
| Registration pathway math (NSI-7) | LIVE (assumption-based) |
| Turnout/election probabilistic models | NOT BUILT |
| Resource allocation forecasting (phase 4o agents) | Adjacent campaign-engine |

---

### 18. Strategy systems

- SDI-1 doctrine alignment
- NSI-4 intelligence graph
- Strategic target pathway audit
- Regional strategic modeling
- Campaign messaging intelligence

---

### 19. Debate systems

- Debate Command Center (`debateCommandCenter.ts`)
- Debate prep routes + debate-ai-workbench
- NSI-14 debate trap scenarios
- Debate memory (NSI-13)
- Debate packet export (governed)

---

### 20. Opposition systems

- Full Kim Hammer stack (KH-0 through KH-4)
- Election record builder
- Legislative narratives + bill graph
- Opposition copilot category (10 tools)

**Maturity:** highest in the entire OS.

---

### 21. Rapid response systems

| Element | Status |
| ------- | ------ |
| Media intake + promotion | PARTIAL |
| Scenario escalation warnings | LIVE |
| Action queue urgent tier | LIVE |
| Real-time alert desk | **NOT BUILT** |
| Counter-message auto-draft to publish | **BLOCKED BY DESIGN** |

---

### 22. Executive briefing systems

- Morning Brief (multi-section)
- Evidence Command executive panels
- Executive summary copilot tool
- **Missing:** weekly intelligence packet PDF factory, CEO single-screen KPI wall

---

### 23. Knowledge graph systems

**NSI-4:** `campaign-intelligence-graph.json` + `campaignIntelligenceGraph.ts`  
Links bills, narratives, counties, citations, debate frames, civic values.

**Gap:** Graph is file-backed; no interactive graph explorer UI at scale.

---

### 24. Memory systems (NSI-13)

| Tracker | Signal |
| ------- | ------ |
| narrativeEvolutionTracker | Narrative drift |
| opponentMessagingDrift | Opponent message change |
| citationAgingEngine | Staleness |
| countyNarrativeShift | County-level shift |
| doctrineDriftTracker | Doctrine tension |
| mediaCycleMemory | Media cycle patterns |
| debateMemorySystem | Debate prep memory |

---

### 25. Lesson-learning systems

- Intelligence memory registry (longitudinal)
- Audit browser (institutional record of decisions)
- Export lineage (what was used when)
- **Gap:** No formal “after action review” capture from field outcomes

---

### 26. Institutional memory systems

| Artifact | Role |
| -------- | ---- |
| Audit logs (multiple) | Who changed what |
| Export history | Deployment lineage |
| NSI-13 memory registry | Trend storage |
| Campaign events county memory | Adjacent ops memory |

---

## Test coverage matrix

| Script | Slice |
| ------ | ----- |
| `agents:test-ai-intelligence-copilot-tools` | NSI-11 |
| `agents:test-llm-governed-drafting` | NSI-12 |
| `agents:test-intelligence-memory-system` | NSI-13 |
| `agents:test-strategic-scenario-simulation` | NSI-14 |
| `agents:test-human-action-queue` | NSI-15 |
| `agents:test-strategic-briefing-ai-tools` | NSI-7 |
| `agents:test-public-media-intake` | NSI-8 |
| `agents:test-scheduled-media-intake` | NSI-10 |
| `agents:test-campaign-intelligence-graph` | NSI-4 |

---

## AI tooling verdict

**Strengths:** Governance-first stack, 36 copilots, LLM gate, evidence/export safety, opposition depth.  
**Weaknesses:** Fragmented operator UX, no unified war room, limited probabilistic forecasting, file-backed persistence on serverless, no multi-model ops layer.

**Recommended NSI-16 focus:** unify existing AI outputs into one **human-paced** command center — not new autonomy.
