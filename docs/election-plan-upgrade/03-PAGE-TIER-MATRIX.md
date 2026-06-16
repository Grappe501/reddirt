# 03 — Page tier matrix

**Tier definitions**

| Tier | Meaning | Operator action |
|------|---------|-----------------|
| **A** | Production-ready: brief + metrics + related links + mobile OK | Maintain |
| **B** | Route works; snapshot or prose; missing brief or thin related links | Level up Phase 1 |
| **C** | Stub, placeholder owner, or “TBD” without honest labeling | Phase 2 or hide from catalog |

Reference standard: **Faulkner county** + **Executive Book doctrine chapter** + **G&G event workbench**.

---

## Tier A (reference quality)

| Route family | Notes |
|--------------|-------|
| `/election-plan` | War Room tabs, coalition hub record-backed |
| `/election-plan/executive-book/*` | 12 chapters + budget dashboard + labor-day gap |
| `/election-plan/counties/faulkner` | v3 intel + v4 ops |
| `/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings` | Pilot event seeded |
| `/election-plan/leadership/responsibility-matrix` | Ownership matrix live |
| `/election-plan/search` | 1282 entries |
| `/admin/election-plan` | Full catalog + smoke doorway |

---

## Tier B (level up — Phase 1 priority)

| Route family | Count | Gap |
|--------------|-------|-----|
| `/election-plan/counties/[countySlug]` | 74 non-Faulkner | v3 intel panel inconsistent |
| `/election-plan/cities/[slug]` | 40 | Thin city brief vs Jacksonville |
| `/election-plan/battlefield/[clusterId]` | 9 | Needs cluster narrative parity |
| `/election-plan/academy/[slug]` | 9 | Training + how-it-helps uneven |
| `/election-plan/campuses/[slug]` | 16 | Captain CTA weak |
| `/election-plan/workbenches/jacksonville` | 1 | Pilot incomplete — ops not content |
| `/election-plan/county-parties/[county]` | 75 | Scrape-dependent |
| `/election-plan/meetings/[meetingId]` | N | Accountability links |
| `/election-plan/platform/[slug]` | planks | Brief coverage partial |

---

## Tier C (honest stub — Phase 2)

| Route | Issue |
|-------|-------|
| `/election-plan/coalition-command` (if linked) | Hub without enrollment — OK if labeled |
| Movement infrastructure subpages | Some prose-only, no metrics |
| `/election-plan/immersion-missions` | Needs field calendar tie-in |
| Executive book GOTV owners | 4 TBD owners — operational not cosmetic |

---

## Leveling checklist (copy per page)

```markdown
## Page: _________________________  Tier: B → A

- [ ] page-briefs.source.json entry exists
- [ ] PageBriefStrip renders (answers, bestFor, keyMetrics)
- [ ] ≥ 3 related links, all pass audit:routes
- [ ] Footer: data source + updated date
- [ ] Mobile: sidebar + tables scroll
- [ ] Contrast: no navy-muted on navy/dark panels
- [ ] Honest labels: planning target / needs assignment
- [ ] Search index rebuilt
```

---

## Batch order for engineering

1. Leadership cluster (4 pages) — operator-facing daily
2. Academy + Po5 (12 pages) — volunteer launch June 28
3. Battlefield + lanes (10 pages) — field planning
4. County rollout (75) — template from Faulkner
5. Cities (40) — after Jacksonville pilot PASS
6. Campuses (16) — after academy pass

---

## Catalog stats (admin hub)

From latest `buildAdminElectionPlanCatalog()`:

- **909** total portal hrefs in catalog
- **75** counties · **40** cities · **40** workbench registry entries
- **16** campuses · **9** academy roles · **12** executive book chapters

Maintaining **909/909 route resolution** is mandatory on every merge.
