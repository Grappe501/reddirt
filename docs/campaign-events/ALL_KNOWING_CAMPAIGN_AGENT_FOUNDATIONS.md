# All-Knowing Campaign Agent Foundations (Sprint 10)

## UnifiedCampaignContextAssembler

**Path:** `src/lib/agents/campaign-intelligence/unified-campaign-context-assembler.ts`

Synthesizes in one load:

- Active tenant + settings
- Campaign events snapshot
- Finance intelligence V2
- Learning loop V2
- OS control state (read-only, no extra observations)
- Dashboard navigation bundle
- Operator intelligence V2
- Agent psychology
- Campaign memory synthesis

**Outputs:** `campaignReadinessIndex`, `situationSummary`, `recommendedCampaignMoves`

Powers **AI Command Center V3** (`CampaignIntelligenceV3Panel`).

## V2 pathway

- LLM narrative layer on same structured context
- Cross-tenant intelligence boundaries enforced at tenant resolver
- Prepared actions from OS control layer wired to strategic ranker
