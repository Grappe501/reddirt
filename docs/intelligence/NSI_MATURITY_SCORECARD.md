# NSI Maturity Scorecard

**Audit date:** 2026-05-29  
**Scoring method:** 0–100% = production-ready for governed campaign use, not “code exists.”  
**Bias:** Deliberately conservative — inflated scores help no one before a statewide race.

---

## Overall program maturity

**NSI stack (NSI-1 through NSI-15):** **74%**  
**Campaign Intelligence OS (including Kim Hammer + governance):** **78%**  
**Elite-tier war-room ambition:** **42%**

---

## Capability scorecard

| Capability | Score | Bar |
| ---------- | ----- | --- |
| Intelligence Collection | 68% | `████████░░` |
| Opposition Research | 88% | `█████████░` |
| Citation & Evidence Governance | 90% | `█████████░` |
| Claim Review & Retrieval Tasks | 85% | `█████████░` |
| Knowledge Graph (NSI-4) | 82% | `████████░░` |
| Geographic / County Intelligence | 75% | `████████░░` |
| Strategic Doctrine Alignment (SDI-1) | 80% | `████████░░` |
| Aggregate Operational Intelligence (NSI-6) | 65% | `███████░░░` |
| Executive Briefings (NSI-7) | 72% | `███████░░░` |
| Public Media Intake (NSI-8–10) | 62% | `██████░░░░` |
| AI Copilot Infrastructure (NSI-11) | 84% | `████████░░` |
| LLM Draft Review Layer (NSI-12) | 80% | `████████░░` |
| Institutional Memory (NSI-13) | 68% | `███████░░░` |
| Strategic Forecasting / Scenarios (NSI-14) | 58% | `██████░░░░` |
| Human Decision Support (NSI-15) | 76% | `████████░░` |
| Debate Intelligence | 83% | `████████░░` |
| Rapid Response | 48% | `█████░░░░░` |
| Election / Turnout Forecasting | 38% | `████░░░░░░` |
| Governance Layer | 93% | `█████████░` |
| Human Approval Layer | 98% | `██████████` |
| Operator Command Center (NSI-16) | 32% | `███░░░░░░░` |
| Cross-System Daily Workflow | 40% | `████░░░░░░` |
| Production Persistence (hosted) | 55% | `██████░░░░` |
| Test & Acceptance Automation | 77% | `████████░░` |

---

## Slice-by-slice maturity

| Slice | Score | Notes |
| ----- | ----- | ----- |
| V2-A Claim review | 85% | Workflow solid; scale testing on large claim sets |
| V3-A Tasks | 82% | No auto-create from AI (correct) |
| V3-B Audit browser | 80% | Unified timeline; growing event kinds |
| V3-C Citations | 88% | Locker + workflow + aging signals |
| V3-D AI sandbox | 84% | Disposition workflow mature |
| V3-E Export control | 90% | Lineage + safety tiers strong |
| NSI-1 Narrative state | 80% | Registry + dashboards |
| NSI-2 Geographic narrative | 78% | County overlays live |
| NSI-3 Usage / fatigue | 75% | Export pressure visible |
| SDI-1 Doctrine | 80% | Alignment scoring integrated |
| NSI-4 Graph | 82% | Read-only graph; limited viz |
| NSI-5 County briefings | 76% | 75 counties — depth varies |
| NSI-6 Operational intel | 65% | Adapters exist; not all feeds live |
| NSI-7 Briefing OS | 72% | Morning brief strong; packet factory weak |
| NSI-8 Media intake | 60% | Queue live; production feeds partial |
| NSI-9 Source registry | 70% | Arkansas catalog; not all feeds active |
| NSI-9B Border media | 65% | Map/matrix docs + engine |
| NSI-10 Scheduled intake | 58% | Dry-run proven; cron governance separate |
| NSI-11 Copilots | 84% | 36 tools tested |
| NSI-12 LLM queue | 80% | Gate strong; operator throughput untested |
| NSI-13 Memory | 68% | Signals composed; trend UI basic |
| NSI-14 Scenarios | 58% | Rich rules; expensive batch; not predictive |
| NSI-15 Action queue | 76% | Recommendations work; not yet daily habit |
| NSI-16 Command center | 0% | **Not started** |

---

## What “100%” would mean (reference)

| Capability | 100% definition |
| ---------- | ----------------- |
| Governance | Zero autonomous publish/export paths; full audit |
| Opposition | Export-ready packet for any debate topic in <30 min human time |
| Command center | Single daily surface: delta, priorities, owners, blockers |
| Forecasting | Scenario probabilities tied to real turnout data |
| Rapid response | <2 hr from signal → governed draft → human approve |
| Persistence | All queues in Postgres; survives serverless |

---

## Critical path to 85% program maturity

1. **NSI-16** — unified operator command center (biggest UX gap)  
2. **Persistence strategy** — queues/memory on hosted DB  
3. **NSI-10 production cron** — scheduled media with secrets + monitoring  
4. **NSI-6 live adapters** — turnout/volunteer feeds into brief  
5. **Scenario performance** — cache/incremental simulation for serverless  

---

## Brutal bottom line

You have built a **governed opposition and intelligence research division** inside a campaign app — not a generic CRM with AI sprinkled on top.

You have **not** yet built the **daily war room** that makes a non-technical campaign manager feel like they are running CNN’s situation room.

That gap is exactly NSI-16.
