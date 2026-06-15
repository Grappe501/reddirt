# Chapter 4 — Democratic Drop-Off Opportunity

> **Status:** Generated from official SOS data (75 counties)
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** II — The Electoral Math
> **Generated:** 2026-06-14

---

## Core message

> We do not need to persuade everyone.  
> We need to bring our own people back.

This chapter is the **county motivation engine**. It turns "we can't win here" into "here are the exact voters we need to bring back."

---

## Statewide summary

**Comparison:** 2024 Presidential Democratic vote vs 2022 Midterm (Secretary of State) Democratic vote

| Metric | Votes |
| ------ | ----: |
| 2024 Presidential D (statewide) | 397,420 |
| 2022 Midterm SOS D (statewide) | 295,350 |
| **Raw drop-off** | **102,070** |
| Recovery at 50% (Lane 2 working goal) | **51,051** |
| Recovery at 75% (Lane 2 stretch) | **76,563** |

*Machine-readable rollup:* [`statewide-drop-off-summary.json`](./statewide-drop-off-summary.json)

**Regenerate:** `npm run strategic-plan:chapter-04:build` (requires `npm run election:history:build` first)

---

## Top 10 counties by Lane 2 recovery (50%)

| Rank | County | Hope Index | Raw drop-off | Recovery @ 50% |
| ---- | ------ | ---------: | -----------: | -------------: |
| 1 | Pulaski | 74 (Moderate) | 22,481 | 11,241 |
| 2 | Benton | 56 (Moderate) | 15,239 | 7,620 |
| 3 | Washington | 43 (Building) | 11,576 | 5,788 |
| 4 | Saline | 28 (Building) | 5,608 | 2,804 |
| 5 | Faulkner | 24 (Building) | 4,974 | 2,487 |
| 6 | Sebastian | 21 (Limited) | 3,904 | 1,952 |
| 7 | Garland | 20 (Limited) | 3,847 | 1,924 |
| 8 | Craighead | 19 (Limited) | 3,712 | 1,856 |
| 9 | Jefferson | 18 (Limited) | 3,589 | 1,795 |
| 10 | White | 17 (Limited) | 3,421 | 1,711 |

---

## Per-county files

Each county file in [`counties/`](./counties/) includes:

1. **Historical vote table** — 2016/2018/2020/2022/2024 (D/R/Total)
2. **Drop-off analysis** — presidential peak, midterm floor, raw loss, % loss
3. **Recovery opportunity** — 25% / 50% / 75% scenarios
4. **Hope Index** — county morale metric (0–100, statewide rank)
5. **Field plan hooks** — Lane 2 goals for Power of 5 / volunteer planning

Template: [`_county-profile-template.md`](./_county-profile-template.md)

---

## Hope Index methodology

| Component | Weight | Description |
| --------- | -----: | ----------- |
| Recoverable pool @ 50% | 45% | Relative to largest county recovery pool |
| Drop-off share | 35% | Raw loss as % of 2024 presidential D |
| Absolute scale | 20% | Raw drop-off magnitude |

| Tier | Score |
| ---- | ----- |
| High | 75–100 |
| Moderate | 50–74 |
| Building | 25–49 |
| Limited | 0–24 |

---

## Data sources

- `data/election/arkansas-county-election-history.normalized.json` (SOS official JSON, v2)
- Midterm proxy: Secretary of State (2018, 2022)
- Presidential: 2016, 2020, 2024

---

## What this chapter feeds

- County goals and volunteer targets
- Registration goal prioritization (Phase 2)
- Top 40 city routing (Phase 3)
- Four Lanes dashboard (Phase 4)
- 20-week city-pair schedule (Phase 5)
