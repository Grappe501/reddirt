# Kim Hammer Opposition Research & Debate Prep — System Baseline

**Baseline ID:** KH-BASELINE-1  
**Frozen at:** 2026-05-27  
**Active lane:** `RedDirt/`  
**Purpose:** Stable inventory and operational status snapshot before KH-5 build sequence.  
**Rule:** Do not mutate this file during active build passes except at explicit baseline refresh steps.

---

## 1. Executive snapshot

| Metric | Value |
|--------|-------|
| Primary admin routes (intelligence lane) | 43 |
| Legacy admin routes (`/admin/opposition/*`) | 8 |
| Workbench loaders | 6 |
| JSON/TXT data artifacts | 44 |
| Markdown research reports | 17 |
| Validation test scripts | 5 |
| API export routes | 0 |
| Prisma opposition models | Present (INTEL-3); **not wired** to Kim Hammer JSON UI |
| Public debate board claims | 4 |
| Export-ready debate claims (Tier 1 filter) | 2 |
| KH-3B retrieval tasks | 7 |

**Export filter (current):** `READY_WITH_CITATION` + `CITED` + `TIER_1_PUBLIC_DEPLOYABLE` + `LOW` legal risk.

**Export-ready claim IDs:**
- `pdeb-001-election-integrity-record`
- `pdeb-003-debate-question-patterns`

---

## 2. Architecture layers (KH-0 → KH-4)

| Layer | Loader | Status | Notes |
|-------|--------|--------|-------|
| KH-0 Election record | `kimHammerWorkbench.ts` | **Operational** | Bills, themes, timeline, claims review, debate drill queue |
| KH-1 Public profile | `kimHammerProfileWorkbench.ts` | **Usable** | Biography, electoral history, media, timeline, controversies |
| KH-2 Contrast & debate | `kimHammerKh2Workbench.ts` | **Usable** | Website corpus, contrast, rebuttals, debate profile, gaps |
| KH-3 Deep + operational | `kimHammerKh3Workbench.ts` | **Mixed** | Useful base modules + scaffolded operational pages |
| KH-3B Retrieval queue | `kim-hammer-intelligence-gaps.json` | **Usable display** | Ranked queue; no task execution workflow |
| KH-4 Evidence governance | `kimHammerKh4Workbench.ts` | **Prototype** | Agent catalog, claim graph, risk register, export filter |
| Debate command | `debateCommandCenter.ts` | **Usable** | Executive priorities, readiness scores, drill links |

---

## 3. Workbench loaders

| File | Loads |
|------|-------|
| `src/lib/opposition/kimHammerWorkbench.ts` | `data/opposition/kim-hammer-election-record-*.json`, election-record markdown dossiers |
| `src/lib/opposition/kimHammerProfileWorkbench.ts` | `data/opposition/kim-hammer-profile/kim-hammer-{biography,electoral-history,media-footprint,public-timeline,public-controversies,source-index}.json` |
| `src/lib/opposition/kimHammerKh2Workbench.ts` | KH-2 JSON set + website corpus under `kim-hammer-profile/website/` |
| `src/lib/opposition/kimHammerKh3Workbench.ts` | KH-3 JSON set + public debate evidence board |
| `src/lib/opposition/kimHammerKh4Workbench.ts` | KH-4 JSON set + KH-3 debate board (export filter) |
| `src/lib/opposition/debateCommandCenter.ts` | Aggregates KH-0/KH-2 for executive debate command center |

---

## 4. Primary route inventory (`/admin/intelligence/*`)

### Hub routes

| Route | Page file | Layer | Status |
|-------|-----------|-------|--------|
| `/admin/intelligence` | `intelligence/page.tsx` | Hub | Usable |
| `/admin/intelligence/debate-command` | `intelligence/debate-command/page.tsx` | Debate OS | Usable |
| `/admin/intelligence/kim-hammer` | `kim-hammer/page.tsx` | Command center | Usable |

### KH-0 / legislative

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/themes` | `themes/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/timeline` | `timeline/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/claims-review` | `claims-review/page.tsx` | Operational |
| `/admin/intelligence/kim-hammer/research-gaps` | `research-gaps/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/bills/[billNumber]` | `bills/[billNumber]/page.tsx` | Operational |

### KH-1 / profile

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/profile` | `profile/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/electoral-history` | `electoral-history/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/media-footprint` | `media-footprint/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/public-timeline` | `public-timeline/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/public-controversies` | `public-controversies/page.tsx` | Usable |

### KH-2 / contrast & debate prep

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/website` | `website/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/message-analysis` | `message-analysis/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/strengths-weaknesses` | `strengths-weaknesses/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/contrast-vs-kelly` | `contrast-vs-kelly/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/debate-profile` | `debate-profile/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/rebuttal-prep` | `rebuttal-prep/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/debate-prep` | `debate-prep/page.tsx` | Operational |
| `/admin/intelligence/kim-hammer/intelligence-gaps` | `intelligence-gaps/page.tsx` | Usable |

### KH-3 / deep research

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/writings` | `writings/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/background-deep` | `background-deep/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/management-capacity` | `management-capacity/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/debate-archive` | `debate-archive/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/response-model` | `response-model/page.tsx` | Prototype |

### KH-3 operational (scaffolded)

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/kh3-operational` | `kh3-operational/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/network-influence` | `network-influence/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/pattern-analysis` | `pattern-analysis/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/vulnerability-matrix-kh3` | `vulnerability-matrix-kh3/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/narrative-testing` | `narrative-testing/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/county-exposure` | `county-exposure/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/modern-sos-contrast` | `modern-sos-contrast/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/rapid-response` | `rapid-response/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/bill-relationship-graph` | `bill-relationship-graph/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/timeline-heatmap` | `timeline-heatmap/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/direct-democracy` | `direct-democracy/page.tsx` | Prototype |

### KH-4 / evidence governance

| Route | Page | Status |
|-------|------|--------|
| `/admin/intelligence/kim-hammer/public-debate-evidence` | `public-debate-evidence/page.tsx` | Usable |
| `/admin/intelligence/kim-hammer/debate-packet-export` | `debate-packet-export/page.tsx` | Prototype (HTML only) |
| `/admin/intelligence/kim-hammer/kh4-agent-tools` | `kh4-agent-tools/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/attack-surface` | `attack-surface/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/intel-heat-map` | `intel-heat-map/page.tsx` | Prototype |
| `/admin/intelligence/kim-hammer/narrative-drift-monitor` | `narrative-drift-monitor/page.tsx` | Prototype |

### Legacy duplicate routes (not primary)

| Route prefix | Files | Note |
|--------------|-------|------|
| `/admin/opposition/kim-hammer/*` | 7 pages + hub | Older mirror; prefer `(board)/intelligence` routes |

---

## 5. Data artifact inventory

### KH-0 election record (`data/opposition/`)

- `kim-hammer-election-record-bill-index.json`
- `kim-hammer-election-record-theme-matrix.json`
- `kim-hammer-election-record-timeline.json`

### KH-1 profile (`data/opposition/kim-hammer-profile/`)

- `kim-hammer-biography.json`
- `kim-hammer-electoral-history.json`
- `kim-hammer-media-footprint.json`
- `kim-hammer-public-timeline.json`
- `kim-hammer-public-controversies.json`
- `kim-hammer-source-index.json`

### KH-2 contrast & website

- `kim-hammer-contrast-vs-kelly.json`
- `kim-hammer-debate-profile.json`
- `kim-hammer-strengths-matrix.json`
- `kim-hammer-vulnerability-matrix.json`
- `kim-hammer-likely-arguments.json`
- `kim-hammer-rebuttal-prep.json`
- `kim-hammer-intelligence-gaps.json` (also KH-3B queue)
- `kim-hammer-message-analysis.json`
- `kim-hammer-public-claims-index.json`
- `kim-hammer-source-confidence-map.json`
- `website/kim-hammer-website-pages.json`
- `website/kim-hammer-website-message-index.json`
- `website/kim-hammer-website-claims-review.json`
- `website/kim-hammer-website-fulltext.txt`

### KH-3 deep research

- `kim-hammer-authored-writings.json`
- `kim-hammer-background-deep-profile.json`
- `kim-hammer-management-capacity-assessment.json`
- `kim-hammer-debate-archive-index.json`
- `kim-hammer-kh3-response-model.json`

### KH-3 operational modules

- `kim-hammer-kh3-network-influence-map.json`
- `kim-hammer-kh3-legislation-patterns.json`
- `kim-hammer-kh3-vulnerability-matrix.json`
- `kim-hammer-kh3-narrative-testing.json`
- `kim-hammer-kh3-media-statements-archive.json`
- `kim-hammer-kh3-county-exposure-map.json`
- `kim-hammer-kh3-modern-sos-contrast.json`
- `kim-hammer-kh3-rapid-response-appendix.json`
- `kim-hammer-kh3-bill-relationship-graph.json`
- `kim-hammer-kh3-timeline-heatmap.json`
- `kim-hammer-kh3-direct-democracy-file.json`

### KH-3B / KH-4 / debate governance

- `kim-hammer-intelligence-gaps.json` (queueVersion: KH-3B)
- `kim-hammer-public-debate-evidence-board.json`
- `kim-hammer-kh4-agent-tools.json`
- `kim-hammer-kh4-claim-graph.json`
- `kim-hammer-kh4-risk-register.json`
- `kim-hammer-kh4-publication-safety.json`

---

## 6. Documentation inventory (`docs/opposition/`)

- `KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md`
- `KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md`
- `KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md`
- `KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md`
- `KIM_HAMMER_PUBLIC_PROFILE_DOSSIER.md`
- `KIM_HAMMER_ELECTORAL_HISTORY.md`
- `KIM_HAMMER_MEDIA_FOOTPRINT.md`
- `KIM_HAMMER_PUBLIC_CONTROVERSIES_REVIEW.md`
- `KIM_HAMMER_PROFILE_BUILD_REPORT.md`
- `KIM_HAMMER_KH2_BUILD_REPORT.md`
- `KIM_HAMMER_CONTRAST_VS_KELLY.md`
- `KIM_HAMMER_DEBATE_PROFILE.md`
- `KIM_HAMMER_STRENGTHS_AND_WEAKNESSES.md`
- `KIM_HAMMER_LIKELY_ARGUMENTS_AND_RESPONSES.md`
- `KIM_HAMMER_WEBSITE_MESSAGE_ANALYSIS.md`
- `KIM_HAMMER_INTELLIGENCE_GAPS.md`
- `KIM_HAMMER_KH3_DEEP_RESEARCH.md`
- `KIM_HAMMER_SYSTEM_BASELINE.md` (this file)

---

## 7. Test inventory

| Script | npm command | Scope |
|--------|-------------|-------|
| `scripts/test-kim-hammer-election-record-research.ts` | `agents:test-kim-hammer-election-record-research` | KH-0 bills, themes, claims safety |
| `scripts/test-kim-hammer-profile-research.ts` | `agents:test-kim-hammer-profile-research` | KH-1 profile safety and sourcing |
| `scripts/test-kim-hammer-contrast-debate-profile.ts` | `agents:test-kim-hammer-contrast-debate-profile` | KH-2 structure and banned language |
| `scripts/test-kim-hammer-kh3-deep-research.ts` | `agents:test-kim-hammer-kh3-deep-research` | KH-3 artifacts and pages exist |
| `scripts/test-kim-hammer-kh4-copilot-layer.ts` | `agents:test-kim-hammer-kh4-copilot-layer` | KH-4 artifacts and pages exist |

**Baseline verification (2026-05-27):** All five scripts passed. `npm run typecheck` passed.

---

## 8. Orchestration registry

KH-2 tools registered in `county-intelligence-copilot-registry.ts`:
- `kimHammerWebsiteReader`, `websiteMessageAnalyzer`, `publicClaimsIndexer`, `candidateStrengthsAnalyzer`, `candidateWeaknessesAnalyzer`, `contrastVsKellyBuilder`, `debateProfileBuilder`, `likelyArgumentPredictor`, `rebuttalPrepBuilder`, `intelligenceGapPrioritizer`, `sourceConfidenceMapper`, `websiteClaimRiskChecker`, `electoralWeaknessAnalyzer`, `mediaFootprintAnalyzer`, `candidateFrameAnalyzer`

**Not registered at baseline:** KH-3B task execution, KH-4 runtime agents, debate export API.

---

## 9. Database layer (INTEL-3)

Prisma models exist: `OppositionEntity`, `OppositionSource`, `OppositionBillRecord`, `OppositionVoteRecord`, `OppositionFinanceRecord`, `OppositionMessageRecord`, `OppositionVideoRecord`, `OppositionNewsMention`, `OppositionElectionPattern`, `OppositionAccountabilityItem`.

Helpers: `src/lib/campaign-engine/opposition-intelligence.ts`

**Baseline gap:** Kim Hammer workbench reads JSON at runtime; no sync to Prisma for claims, tasks, or review state.

---

## 10. Publication safety and export state

### Tier definitions (debate board)

- `TIER_1_PUBLIC_DEPLOYABLE`
- `TIER_2_NEEDS_CORROBORATION`
- `TIER_3_INTERNAL_ONLY`
- `TIER_4_HIGH_CAUTION`

### Current claim disposition

| Claim ID | Tier | External use | Export pass |
|----------|------|--------------|-------------|
| `pdeb-001-election-integrity-record` | TIER_1 | READY_WITH_CITATION | Yes |
| `pdeb-002-management-readiness` | TIER_2 | USE_WITH_CAUTION | No |
| `pdeb-003-debate-question-patterns` | TIER_1 | READY_WITH_CITATION | Yes |
| `pdeb-004-civic-affiliation-claims` | TIER_4 | DO_NOT_USE_EXTERNALLY | No |

### KH-3B retrieval queue

All 7 tasks: `externalMessageReadiness` = `NOT_READY` or `NEEDS_CONTEXT`; none export-ready.

---

## 11. Known limitations at baseline

1. No unified Evidence Command Center page
2. No debate export API (`/api/opposition/kim-hammer/debate-export` missing)
3. No claim lifecycle or human review workflow in UI
4. KH-4 agents are metadata catalogs only (no runtime)
5. No search/filter across claims or tasks
6. Legacy `/admin/opposition/*` routes duplicate primary intelligence routes
7. Export-ready corpus is thin (2 of 4 debate claims)

---

## 12. Master build sequence reference

Next steps per master plan (do not skip):

1. ~~Freeze baseline~~ (this document)
2. Normalize evidence and claim types
3. Build unified evidence index
4. Build Evidence Command Center
5. Upgrade KH-3B to executable task board
6. Build debate packet export API
7. Add downloadable debate packet formats
8. Add runtime publication-safety gate module
9. Add claim lifecycle and review status
10. Add search and filtering
11. Register KH-4 copilot tools as read-only suggestion agents
12. Polish command-center UX and analytics

**Exact next step:** Step 2 — `src/lib/opposition/types/kimHammerEvidence.ts`

---

*End KH-BASELINE-1*
