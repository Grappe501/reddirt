# Manual Pass 3H — completion report

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Date:** 2026-04-28  
**Pass name:** *Manual Pass 3H — Financial Baseline, Burn-Rate, Fundraising Progression, and Budget-to-Field Calibration*  
**Constraints:** Markdown / manual only; no app code changes; no DB/schema/migrations/auth/deps changes; no commit (per user).

**Public vocabulary:** Campaign Companion, Guided Campaign System, Workbench, Field Intelligence — not “AI.”

**Honesty:** No dollar totals were invented. **Prisma** seed in this repo snapshot does **not** include `FinancialTransaction` or `BudgetPlan` fixture amounts. **CONFIRMED** ledger rows + **bank**/**FEC**/**treasurer** are the operational truth hierarchy per `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`.

---

## Files read (mission + evidence)

**Manuals (as requested):** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`, `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md`, `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md`, `GOOGLE_CALENDAR_AND_EVENT_PIPELINE_OPERATING_SYSTEM.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`, `SYSTEM_READINESS_REPORT.md` (spot checks / cross-walk).

**Repo financial evidence (read-only):**

| Source | Finding |
|--------|---------|
| `prisma/schema.prisma` | `FinancialTransaction`: `amount`, `transactionType` (incl. `CONTRIBUTION`), `category`, `relatedEventId`, `status` `DRAFT`/`CONFIRMED`; model note: internal ledger, not bank feed. `BudgetPlan` + `BudgetLine` for planned amounts by `costBearingWireKind`. |
| `src/lib/campaign-engine/budget-queries.ts` | `getBudgetActualsByWire`: **only** `CONFIRMED`; **excludes** `CONTRIBUTION` from spend-actual sums. |
| `src/lib/campaign-engine/budget.ts` | `CostBearingWireKind`, `DEFAULT_LEDGER_CATEGORY_TO_WIRE` for category slugs. |
| `src/lib/campaign-engine/truth-snapshot.ts` | `FinancialTransaction` DRAFT vs CONFIRMED counts; draft-heavy ledger flagged as not full fiscal truth. |
| `prisma/seed.ts` | **No** `FinancialTransaction` or `BudgetPlan` create/upsert — **no** **fixture** **dollars** for Pass 3H to cite. |

---

## Financial repo evidence found (summary)

- **Data model** supports: weekly aggregation by `transactionDate`, category→wire rollups, optional **`CampaignEvent`** link for travel/event ROI, planned-vs-actual via `BudgetPlan` windows.  
- **Factual** **spend/raise** **history** **is** **not** **in** **this** **Git** **snapshot** as **seeded** **rows** **—** **operators** **use** **production** **DB** or **treasurer** **export** to **populate** **tables** **described** **in** `FINANCIAL_BASELINE_...` **§**2**–**6**.  
- **Narrative** **~$55k** / **~$15k** **COH** in **strategy** / **Fundraising** remains **qualitative** **until** **superseded** by **reconciled** **records** **(Part** **H** **rule**).

---

## Files created

| File | Purpose |
|------|--------|
| `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` | 22 **numbered** sections (§1–§22): executive summary through Steve pointer; `MANUAL_INFORMATION` **§**36** **=** **separate** **request** **list** |
| `MANUAL_PASS_3H_COMPLETION_REPORT.md` | This file |

---

## Files updated

| File | Change |
|------|--------|
| `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` | **Part** **H**; **§**2 **money** **bullet** **supersession** **rule;** **§**23 **Pass** **3H** **+** `MANUAL_INFORMATION` **§**1**–**36**; **Last** **updated** **3H** |
| `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` | **Pass** **3H** addendum; **Last** **updated** **3H** |
| `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` | **§**25 **Pass** **3H**; **Last** **updated** **3H** |
| `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` | **§**24 **Pass** **3H**; **Last** **updated** **3H** |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | **§**36**;** **Purpose** line **3H;** **“When** **addressed”** **footer;** **Last** **updated** **3H** |
| `MANUAL_BUILD_PLAN.md` | **Pass** **3H** **complete** **section** |
| `MANUAL_TABLE_OF_CONTENTS.md` | **Version,** **3H** **blurb,** **lifecycle** **bullet,** **appendix** **G/H/S/Y,** **Last** **updated** **3H** |
| `WORKFLOW_INDEX.md` | **Pass** **3H** in **Pass** **3** **paragraph,** **Last** **updated** **3H** |
| `SYSTEM_READINESS_REPORT.md` | **Title,** **key** **artifacts,** **Next,** **appendix** **line** **3H** |

---

## Actual financial-record guidance added

- **Use** `CONFIRMED` **for** “actuals” **in** `getBudgetActualsByWire` **semantics;** **treat** **DRAFT** **as** **preliminary.**  
- **Separate** **CONTRIBUTION** **inflows** from **spend** **wires** **(code** **already** **excludes** **CONTRIBUTION** from **that** **spend** **sum** **).**  
- **When** **numbers** **exist,** they **trump** **~$55k** / **~$15k** **narrative** for **internal** **planning** **(see** **Part** **H** **and** `FINANCIAL_...` **§**1**).**

---

## Early spend categories (from code mapping, not from live data)

- **Default** `category` **→** `CostBearingWireKind` in `budget.ts` governs how **`travel`**, **`event`**, **`digital_ads`**, **`print`**, etc. **rollup** to **governance** **rails** — see **`FINANCIAL_...` §**7**.  
- **Yard** **signs,** **banners,** **postcards** may **land** in **`print_mail`**, **`event_cost`**, or **`other`** **until** **categories** **are** **tightened** in **ops** or **code.**

---

## Fundraising progression findings

- **Not** **computable** **from** **repo** **seed** **—** **framework** in **`FINANCIAL_...` §**5** and **§**6** (weekly + last-three-weeks **separate** **regime** **).**  
- **Steve**-level **$55K** / **$15K** **remains** **the** **documented** **story** **shape** **until** **treasury** **export** **replaces** **it.**

## Last-three-weeks acceleration note

- **Model** as **a** **segment,** not **a** **new** **permanent** **slope** **(§6** `FINANCIAL_...`**,** **simulation** **§**25**).** **Needs** **treasurer** **confirmation** **of** **dates** **and** **regime** **change** **(§**36**).**

## Budget calibration rules

- **Survival** / **base** / **momentum** / **stretch** **names** **aligned** to **strategy** **;** **fill** with **real** **COH** **+** **burn.  
- **Weekly** **review** **rhythm** **and** **fee** **/ **reimbursement** **questions** **in** **`FINANCIAL_...` **§**18** **and** **§**21**.**

## Unresolved treasurer / Steve questions

- **All** of **`MANUAL_INFORMATION_REQUESTS` §**36** (source of truth, refunds, COH, fees, public claims, etc.).**

## Next recommended pass

**Manual Pass 4** — Role playbooks, training, dashboard attachment (`MANUAL_BUILD_PLAN.md`); **treasurer** may **in parallel** provide **a** **redacted** **export** to **name** **actual** **pre/post** **field** **totals** **and** **last-three-weeks** **lift.**

**Last updated:** 2026-04-28 (Pass **3H**)
