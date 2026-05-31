# PASS P3 — Opposition Archive Closure MVP Inventory

**Active lane:** RedDirt/  
**Generated:** 2026-05-31  
**Status:** INTERNAL / NON_PUBLISHABLE / HUMAN_REVIEW_REQUIRED

## Archive files inspected

| Path | Role |
|------|------|
| `data/opposition/kim-hammer-profile/kim-hammer-authored-writings.json` | 3 authored writings with URLs |
| `data/opposition/kim-hammer-profile/kim-hammer-debate-archive-index.json` | 1 direct Kim Hammer clip + 2 SOS reference debates |
| `data/opposition/kim-hammer-profile/kim-hammer-background-deep-profile.json` | Biographical profile (mixed evidence status) |
| `data/opposition/kim-hammer-profile/kim-hammer-management-capacity-assessment.json` | SOS readiness assessment (NEEDS_REVIEW) |
| `data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json` | 7 retrieval tasks (0 COMPLETE) |
| `data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json` | Claim graph + export tiers |
| `data/opposition/kim-hammer-profile/kim-hammer-citation-locker.json` | KH-4 citation locker |
| `data/opposition/kim-hammer-election-record-bill-index.json` | 29 bills indexed |
| `data/intelligence/claims/claim-ledger.json` | P2 claim ledger |
| `data/intelligence/claims/citation-sources.json` | P2 citation sources |
| `data/intelligence/claims/citation-anchors.json` | P2 citation anchors |
| Admin routes under `/admin/intelligence/kim-hammer/*` | 60+ intelligence modules |

## Current counts (post-ingest baseline)

| Metric | Count |
|--------|------:|
| Opposition archive sources | 6 |
| Archive items | 40 |
| Direct quotes (normalized) | 0 |
| Usable quotes | 0 |
| Direct Kim Hammer clips | 1 |
| Reference SOS debate clips | 2 |
| Authored writings | 3 |
| Bill records | 29 (+ 1 rollup item) |
| Export-ready claims | 2 |
| Kim Hammer claims in ledger | 12 |
| Retrieval tasks | 7 |
| Retrieval tasks COMPLETE | 0 |
| Retrieval tasks PARTIAL | 6 |
| Opposition brief confidence (computed) | **62/100** |

## Retrieval task status (7 open)

| ID | Status | Closure |
|----|--------|---------|
| kh3b-pre-legislative-authored-writings | IN_PROGRESS | PARTIAL — 3 writings indexed, archive incomplete |
| kh3b-long-tail-video-forum-record | ASSIGNED | PARTIAL — 1 media clip only |
| kh3b-management-readiness-evidence | IN_PROGRESS | PARTIAL — assessment exists, hard validation missing |
| kh3b-biographical-validation-education-civic | ASSIGNED | PARTIAL — profile fields NEEDS_REVIEW |
| kh3b-business-employment-chronology | NOT_STARTED | PARTIAL — partial background entries |
| kh3b-wayback-campaign-page-capture | IN_PROGRESS | PARTIAL — sweep queued |
| kh3b-local-radio-tv-quote-normalization | NOT_STARTED | OPEN — no local quote cards |

**None closed** — local evidence does not satisfy citation requirements for any task.

## Claim ledger coverage

- Export-ready claims ingested as archive items with `claimIds`
- Citation binding links writings (3), clips (3), and claim archive items to P2 citation sources/anchors
- UNSUPPORTED / NEEDS_REVIEW claims flagged in rollup `topUnusableClaims`

## Biggest evidence gaps

1. **Film room:** Only 1 direct opponent clip (media coverage, not formal debate)
2. **Quotes:** Zero normalized direct-quote records with citation anchors
3. **Writings:** 3 indexed but pre-legislative archive explicitly incomplete
4. **Retrieval closure:** 0/7 COMPLETE — cannot claim research closure
5. **Management readiness:** Internal analysis only — no primary committee/procurement validation

## Implementation plan (P3)

1. `oppositionArchiveTypes.ts` + `oppositionArchiveStore.ts` — JSON-first store
2. `oppositionArchiveIngest.ts` — migrate existing KH datasets without duplication
3. `oppositionCitationBinder.ts` — bind to P2 citation engine + claim ledger
4. `oppositionBriefConfidence.ts` — computed confidence (not hardcoded)
5. Admin panel `/admin/intelligence/kim-hammer/archive`
6. Wire archive rollup into debate command + AI Brain orchestrator
7. Validation script `agents:test-opposition-archive-closure-mvp` (24 tests)
8. Retrieval closure report + build report

**Confidence target 75+:** Not achievable without closing retrieval tasks and adding direct quotes/clips. System reports **62** honestly.
