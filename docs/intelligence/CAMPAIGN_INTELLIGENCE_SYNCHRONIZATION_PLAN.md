# Campaign Intelligence Synchronization Plan

**Lane:** `RedDirt/` · Kelly SOS statewide campaign OS  
**Companion:** [CAMPAIGN_INTELLIGENCE_SYSTEM_MAP.md](./CAMPAIGN_INTELLIGENCE_SYSTEM_MAP.md)  
**Status:** Planning document only — no autonomous orchestration, no mutation expansion.

---

## Purpose

Define how the future campaign intelligence brain should synchronize governed data domains around narrative state, geographic readiness, and deployment analytics — while preserving human disposition, auditability, and publication gates.

NSI-3 begins this work by:

1. Mapping all major intelligence sources (system map).
2. Computing narrative usage analytics and export fatigue from LIVE Kim Hammer layers.
3. Documenting synchronization principles and future AI orchestration **goals** (not autonomous behaviors).

---

## Data Domains

| Domain | Primary steward | Current NSI touchpoint | Sync priority |
| ------ | --------------- | ---------------------- | ------------- |
| Voter file intelligence | Data stewardship | None (by design) | P4 — after entity graph |
| Turnout analytics | Data ingest / OIS | County profiles (partial) | P3 |
| County governance intelligence | KH-0B / regional desk | NSI-2 overlays | P2 |
| Opposition narratives | Evidence Command | NSI-1 registry | **LIVE** |
| Demographic overlays | Regional strategy | Planned (Census) | P4 |
| Volunteer operations | Field / Power of 5 | None | P4 |
| Event / contact systems | Operations | None | P5 |
| Media ecosystem intelligence | Comms | NSI-2 `localMediaRisk` | P3 |
| Economic indicators | Regional / comms | Planned (BLS) | P4 |
| Public sentiment datasets | Comms / research | None | P5 |
| Export lineage | Export control | NSI-3 deployment history | **LIVE** |
| Geographic narrative state | NSI-2 | County overlays | **LIVE** |
| Citation health | Citation locker | NSI-1/NSI-3 freshness | **LIVE** |
| Audit timelines | V3-B audit browser | Cross-workflow events | **LIVE** |
| AI suggestion routing | V3-D sandbox | NSI-1/NSI-3 pressure | **LIVE** |

**Priority key:** P1 = LIVE today · P2 = partial + next integration · P3–P5 = planned phases

---

## Synchronization Principles

1. **Governed read access first** — Every cross-system link starts as read-only composition over stable identifiers. No domain writes another domain’s artifacts without an explicit workflow.

2. **Auditability everywhere** — Sync events must be traceable: who read what, which version, which export lineage. Append-only audit logs per workflow remain the norm.

3. **No autonomous publishing** — Synchronization may inform operators; it may not trigger exports, posts, ads, or message sends.

4. **Human disposition layers** — AI suggestions, retrieval tasks, citation review, and claim approval stay human-gated. Sync plans route *attention*, not *action*.

5. **Stable identifiers** — `narrativeId`, `countyId`, `cite-*`, `exportId`, FIPS, county slug. NSI-4 will unify these into a cross-system entity graph.

6. **Deterministic composition before LLM reasoning** — NSI-1/2/3 scores are computed without LLM synthesis. Future AI reads governed primitives; it does not invent strategic context.

7. **Regional intelligence overlays** — County and media-market dimensions attach to narratives without voter-level targeting.

8. **Source provenance preservation** — Every composed view links back to originating artifact paths and checksums where applicable.

---

## Synchronization Architecture (Target State)

```text
┌─────────────────────────────────────────────────────────────────┐
│                  Campaign Intelligence Graph (NSI-4)             │
│  narratives ↔ counties ↔ citations ↔ exports ↔ datasets        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ read-only edges
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   NSI-1 State            NSI-2 Geographic        NSI-3 Usage/Fatigue
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                    Governed primitives (JSON + audit)
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
   Citation     Export      Audit       AI         Field/Voter
   Locker       History     Browser     Sandbox    (future read)
```

**Phase sequence**

| Phase | Deliverable | Mutation surface |
| ----- | ----------- | ---------------- |
| NSI-3 (current) | Usage analytics + source map + sync plan | None |
| NSI-4 | Unified entity resolution graph | None (read-only graph) |
| SYNC-1 | Turnout + election results read adapters | Read-only |
| SYNC-2 | CountyWorkbench cross-links by slug/FIPS | Read-only |
| SYNC-3 | Media market + DMA overlay artifact | Curated JSON only |
| SYNC-4 | Volunteer aggregate signals (no PII) | Read-only |

---

## Future AI Orchestration Goals

The AI layer should eventually **support** (not automate):

| Capability | Input domains | Guardrails |
| ---------- | ------------- | ---------- |
| County-aware narrative prioritization | NSI-2, turnout overlays, export fatigue | Read-only ranking; operator selects action |
| Turnout-sensitive messaging analysis | Election results, geographic state | Aggregate only; no voter-level scoring |
| Demographic narrative overlays | Census ACS (aggregate) | No household inference |
| Geographic debate prep | NSI-2, debate frames, export history | Human export gate unchanged |
| Volunteer intelligence routing | Power of 5 aggregates, county readiness | No contact PII in prompts |
| Field-operation synchronization | Field completion metrics, NSI-3 fatigue | Suggest shifts in research focus only |
| Media saturation awareness | NSI-3 OVEREXPOSED/STALE, DMA map | No auto ad placement |
| Adaptive strategic readiness analysis | Full NSI stack + sync graph | Deterministic scores first; LLM explains only |

### Explicitly prohibited

- Autonomous campaign decisions
- Autonomous publishing (web, social, email, SMS)
- Autonomous persuasion targeting
- Voter-level microtargeting from opposition intel
- Auto-mutation of claims, citations, tasks, or exports from AI disposition
- Prisma writes triggered by NSI/analytics layers

---

## NSI-3 Operational Graph Extension

```text
Narrative
→ Claims
→ Citations
→ Retrieval Tasks
→ Export Usage
→ AI Suggestions
→ County Exposure
→ Geographic Readiness
→ Deployment Frequency      ← NSI-3
→ Narrative Fatigue         ← NSI-3
→ Campaign Intelligence Synchronization
→ Strategic Doctrine              ← SDI-1
→ Philosophy Alignment            ← SDI-1
→ Campaign Priority Coherence     ← SDI-1
→ Unified Campaign Intelligence Graph   ← NSI-4
```

---

## NSI-4 Unified Campaign Intelligence Graph (current)

NSI-4 unifies governed entity relationships across bills, narratives, doctrines, counties, exports, philosophy, and civic impact layers:

- `data/intelligence/campaign-intelligence-graph.json` — 60+ linked entities
- `data/intelligence/campaign-philosophy-graph.json` — civic values and principles
- `src/lib/intelligence/kimHammerBillCivicIntelligence.ts` — bill civic Q&A and briefing sections
- `src/lib/intelligence/campaignMessagingIntelligence.ts` — doctrine-safe messaging guidance
- `/admin/intelligence/campaign-intelligence-graph` — graph explorer
- Bill briefings + debate command — civic intelligence integration

Future campaign brain composition:

```text
Civic Philosophy + Strategic Doctrine + County Reality + Voter Intelligence (aggregate)
+ Narrative State + Operational Governance + Debate Messaging + Export History
```

CountyWorkbench, voter files, turnout, Census/BLS, volunteer, field ops, and media ecosystem remain **planned read adapters** (NSI-5 regional modeling next).

### SDI-1 Strategic Doctrine Layer (LIVE)

- `data/strategy-doctrine/campaign-strategic-doctrine-registry.json` — discovered campaign planning assets
- `src/lib/intelligence/campaignStrategicAlignment.ts` — narrative × doctrine alignment engine
- `/admin/intelligence/strategy-alignment` — operator dashboard

Alignment evaluates: operational readiness (NSI-1) + geographic fit (NSI-2) + deployment fatigue (NSI-3) + campaign doctrine (SDI-1).

---

## Exact Next Step

**NSI-7 only: Strategic Simulation + Narrative Stress Testing** — doctrine-safe scenario simulation, narrative stress testing, county cluster sensitivity analysis, export saturation forecasting, strategic resilience modeling — human authority, governance, auditability, and aggregate-only discipline preserved.

### NSI-6 Aggregate Campaign Intelligence (LIVE)

- `data/intelligence/campaign-intelligence-read-adapters.json` — read-only adapter registry
- `src/lib/intelligence/aggregateCampaignIntelligence.ts` — operational environment composition
- `src/lib/intelligence/countyWorkbenchSynchronization.ts` — CountyWorkbench + NSI-5 sync layer
- `src/lib/intelligence/regionalStrategicModeling.ts` — regional clusters and deployment conditions

### NSI-5 County Briefing Intelligence (LIVE)

- `src/lib/intelligence/countyBriefingIntelligence.ts` — county briefing engine
- `/admin/intelligence/kim-hammer/county-briefings` — county index dashboard
- `/admin/intelligence/kim-hammer/counties/[countyId]` — localized strategic operating briefings

---

*NSI-6 synchronization planning artifact. Update when Census/BLS and DMA adapters achieve LIVE status.*
