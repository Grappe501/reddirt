# PHASE 5A Strategy Doctrine Intake Report

## Active lane

- `RedDirt/`

## Scope

- Phase 5A doctrine/source-ingestion build only.
- No final county strategy generation.

## Sources searched

- Internal: campaign brain model/map/orchestration JSONs, prior Rockefeller research doc, existing strategy-oriented docs.
- Public:
  - [Encyclopedia of Arkansas - Winthrop Rockefeller](https://encyclopediaofarkansas.net/entries/winthrop-rockefeller-122/)
  - [Encyclopedia of Arkansas - Rockefeller volunteer badge](https://encyclopediaofarkansas.net/media/rockefeller-winthrop-22638/)
  - [UALR Rockefeller politics archive](https://ualrexhibits.org/rockefeller/politics/) (timed retrieval issue during this run; indexed as `NEEDS_RETRY`)

## Internal files found

- `data/campaign-events/campaign-brain-operating-model.json`
- `data/campaign-events/campaign-brain-operating-system-map.json`
- `data/campaign-events/county-intelligence-copilot-orchestration.json`
- `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md`
- Existing orchestration registries in `src/lib/agents/orchestration/*`

## Steve doctrine themes extracted

- unity over division
- communities organizing themselves
- trust and relationships
- eye-to-eye campaigning
- county/city/precinct grounded operations
- SOS as process-legitimacy office

## Artifacts created

- `data/strategy-doctrine/steve-strategy-doctrine.json`
- `data/strategy-doctrine/arkansas-grassroots-principles.json`
- `data/strategy-doctrine/rockefeller-grassroots-case-study.json`
- `data/strategy-doctrine/relational-organizing-playbook.json`
- `data/strategy-doctrine/gotv-backward-calendar-model.json`
- `data/strategy-doctrine/poll-watcher-coverage-model.json`
- `data/strategy-doctrine/event-visibility-playbook.json`
- `data/strategy-doctrine/county-strategy-source-index.json`
- `data/audit/strategy-doctrine-readiness-table.json`

## TypeScript modules added

- `src/lib/strategy-brain/strategyDoctrineTypes.ts`
- `src/lib/strategy-brain/steveStrategyDoctrineReader.ts`
- `src/lib/strategy-brain/arkansasGrassrootsPrinciples.ts`
- `src/lib/strategy-brain/rockefellerCaseStudyReader.ts`
- `src/lib/strategy-brain/relationalOrganizingPlaybook.ts`
- `src/lib/strategy-brain/gotvBackwardCalendarModel.ts`
- `src/lib/strategy-brain/pollWatcherCoverageModel.ts`
- `src/lib/strategy-brain/eventVisibilityPlaybook.ts`
- `src/lib/strategy-brain/strategyDoctrineReadinessAudit.ts`

## Tools added (registered)

- `steveStrategyDoctrineReader`
- `arkansasGrassrootsPrinciplesReader`
- `rockefellerGrassrootsCaseStudyReader`
- `relationalOrganizingPlaybookReader`
- `gotvBackwardCalendarPlanner`
- `pollWatcherCoveragePlanner`
- `eventVisibilityOpportunityReader`
- `countyStrategySourceIndexer`
- `strategyDoctrineGapExplainer`
- `unityMessageDoctrineReader`

## Orchestration/runtime additions

- Added `strategyDoctrineLayer` to campaign brain model/map/registry surfaces.
- Updated county intelligence orchestration JSON + TS registry with doctrine data sources and tool group.
- Extended runtime context loader to ingest strategy doctrine artifacts.

## Gaps needing Steve review

- County-specific doctrine nuances for all 75 counties remain incomplete.
- UALR Rockefeller archive material requires a follow-up full-source pull.
- Poll watcher coverage is currently template-level (no county row intake yet).

## Compliance/safety gate verification

- Strategy doctrine layer mode: `READ_ONLY_STRATEGY_DOCTRINE_INTAKE`.
- Prohibitions include targeting, contact-list generation, outreach automation, and final strategy without human approval.
- Missing/uncertain data explicitly labeled `MISSING` or `NEEDS_REVIEW`.

## Netlify readiness

- Phase 5A changes are data/module/orchestration focused; final readiness depends on full required command suite results.
- Local build behavior remains subject to known environment constraints.

