# Financial baseline, burn rate, and budget-to-field calibration (Manual Pass 3H)

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Status:** Design + **evidence** guidance; **not** a bank reconciliation, **not** a public finance filing. **No** dollar figures **invented** in this pass.

**Companion chapters:** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (Part H), `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`, `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md`, `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md`, `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md`, `GOOGLE_CALENDAR_AND_EVENT_PIPELINE_OPERATING_SYSTEM.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §**36**

**Vocabulary (public):** Campaign Companion, Guided Campaign System, Workbench, Field Intelligence — not “AI.”

**Honesty (treasurer and counsel):** **Do not** use `FinancialTransaction` **DRAFT** rows or raw exports as public claims without treasurer/counsel sign-off. The **Prisma** ledger is **FIN-1: internal, not a bank feed** (see `prisma/schema.prisma` `FinancialTransaction` description). **Cash on hand** in the real world = **bank / FEC / treasurer records**, not a Git repo.

---

## 1. Executive summary

- **Goal:** Align **field**, **volunteer**, **paid media**, **travel**, **visibility**, **fundraising asks**, and **simulation** with **observed** spend and **observed** raise patterns—**using the database and treasurer truth when they conflict with narrative.**
- **What this pass established from the repo (evidence, not money):**  
  - **`FinancialTransaction`** exists with: `amount` (Decimal 14,2), `transactionType` (`EXPENSE` | `REIMBURSEMENT` | `CONTRIBUTION` | `OTHER`), `category` (string, mapped to “cost-bearing wires” in `src/lib/campaign-engine/budget.ts`), optional `relatedEventId` → `CampaignEvent`, `status` `DRAFT` | `CONFIRMED`.  
  - **`getBudgetActualsByWire` in** `src/lib/campaign-engine/budget-queries.ts` **sums only** `status === CONFIRMED` and **excludes** `transactionType === CONTRIBUTION` for **spend** “actuals” (contributions are inflows, not spend wires).  
  - **`truth-snapshot`:** If only **DRAFT** rows exist, the ledger is **not** “operational truth” for fiscal narrative until **CONFIRMED** rows exist.  
  - **`prisma/seed.ts`:** **No** `FinancialTransaction` or `BudgetPlan` **seeded** in the checked dev seed (no row-level **dollars** in this repository snapshot for a baseline export).  
- **Consequence:** This document **does not** print **total spend**, **totals by week**, or **“last three weeks acceleration”** in dollars. Those require a **treated export** from the **operational** database (or treasurer spreadsheet) and **categorization** rules signed by treasurer. **The framework below** is what to do **when** that export exists.  
- **Narrative baseline elsewhere:** Strategy / fundraising chapters cite **~$55k raised, ~$15k COH** and qualitative spend (lift, materials, visibility, road) as **Steve-facing baseline** (Pass 3/3B). **Pass 3H rule:** **confirmed ledger + bank/FEC** **supersede** those numbers **where** they differ—**do** **not** **blend**rough narrative with DB without labeling sources.

---

## 2. What the financial records show so far (rules + where to read truth)

| Layer | What it is | In repo / app |
|--------|------------|----------------|
| **Internal ledger** | `FinancialTransaction` rows | `prisma/schema.prisma` model; admin UI at `src/app/admin/.../financial-transactions` (pattern from codebase) |
| **Draft vs confirmed** | **DRAFT** = not final for “actuals” in governance helpers | `FinancialTransactionStatus`; `src/lib/campaign-engine/truth-snapshot.ts` messaging |
| **Spend sum by “wire”** | `CONFIRMED` non-`CONTRIBUTION` rows, `category` → `CostBearingWireKind` | `getBudgetActualsByWire` in `budget-queries.ts` |
| **Planned budget** | `BudgetPlan` + `BudgetLine` (plannedAmount per `costBearingWireKind`) | Schema; compare to actuals with `getBudgetVarianceByLine` |
| **Event-linked spend** | `relatedEventId` optional on `FinancialTransaction` | Use for **travel/ROI** when staff link receipts to `CampaignEvent` |
| **Seed / fixture dollars** | **Not present** in `prisma/seed.ts` for this packet | **No** file in repo was used to assert **historical** **totals** in Pass 3H |

**Operator query (conceptual, not run here):** In a connected environment, treasurer or DBA can aggregate **CONFIRMED** rows by `transactionDate` week, `category`, and `transactionType` (e.g. **CONTRIBUTION** for **inflows** on a **separate** **sheet** from **EXPENSE**/**REIMBURSEMENT**/**OTHER** for **outflows**), and join **contributions** to **cash** **logic** per treasurer (see §**21**).

---

## 3. Spending before field launch / volunteer launch

**Definition (operational):** “Before field launch” = **date range** **fixed** with CM/owner (e.g. first **P5** **hub** go-live, first **regional** **tour** week, or first `CampaignEvent` tagged **field_program_start** if ever added). **This manual** does not fix that date.

**Method when data exists:** Filter `FinancialTransaction` where `status === CONFIRMED` and `transactionDate < T0` (field launch), exclude **non-spend** or use **type** **filters** as treasurer directs. **Group** by **mapped** **wire** (`getBudgetWireForTransaction` keys) and raw **category** for sub-detail.

**If sub-$X burn was mostly “setup”:** expect **`software_platform`**, **`print_mail`**, **`content_media`**, early **`event_cost`**, and **`other`** to dominate **before** heavy **`travel_mileage_reimbursement`** and recurring **`text_call_email_vendor`**.

---

## 4. Startup-from-zero-money reality

**Narrative (from existing manuals):** Pass 3 text describes a **one-person** start and **early** **qualitative** **spend**—not a **fully** **credited** **ledger** in the Git repo.

**Discipline:** Any **“zero to first dollar”** story for **volunteer** or **press** use must **match** **treasurer**-approved **facts**; **no** **retroactive** “we always knew” if **DB** and **bank** differ.

---

## 5. Fundraising progression timeline

**Required shape (when data exists):** A **time series**:

- **Week** **bucket** (or reporting period—treasurer)  
- **`CONTRIBUTION` rows** (CONFIRMED) if **inflows** are captured there **+** any **inflows** **only** in **ActBlue/Stripe/WinRed** **exports** (not in repo) — **reconcile** in **one** **document** (treasurer), not in this manual  
- **Cumulative** **raised** and **implied** **COH** **after** **burn** (see §**8**)

**Pass 3H:** No **week-by-week** **plot** in this file—**infrastructure** for plot is **the** `FinancialTransaction` **+** **external** **processor** **reports**.

---

## 6. Last-three-weeks fundraising acceleration

**Modeling rule:** The **trailing 3** **full** **weeks** (or 3 **reporting** **periods**) should be a **separate** **regime** in **simulation** (higher/lower/flat **r_week**) from **earlier** **baseline**—**do** **not** **assume** a **single** **constant** **weekly** **raise** **from** **April** to **August**.

**Detection:** **Compare** **median** or **sum** of **recent** **periods** to **prior** **same-length** **window**; **if** **Steve** or **data** show **a** **lump** (event, end-of-quarter), **label** the **lump** so **simulation** does **not** **annualize** a **one-off**.

---

## 7. Spend categories (manual taxonomy aligned to `CostBearingWireKind` + overfetch)

The **code** default map is in `src/lib/campaign-engine/budget.ts` (`DEFAULT_LEDGER_CATEGORY_TO_WIRE`). The **manual** buckets below are **for** **story** and **board** **review**; **staff** should still **type** a **sensible** `category` **and** **confirm** **rows** so **mapping** **works**.

1. **Campaign lift / setup** — `software_platform`, `consultant_contractor`, part of `content_media` (brand launch), any **`OTHER`** with clear **description** in ledger **notes**  
2. **Travel** — `travel` / `mileage` / `reimbursement` → **`travel_mileage_reimbursement`**  
3. **Materials** — `print` / `mail` → **`print_mail`**, plus **event** handouts that are **print**-like  
4. **Signs / banners / visibility** — usually **`print_mail`** and **`event_cost`**; **if** a **dedicated** **category** (e.g. `yard_signs`) is not in the map, it **falls** **to** **`other`** **until** **added** to `DEFAULT_LEDGER_CATEGORY_TO_WIRE` **in** **a** **future** **code** **change** (outside Pass 3H)  
5. **Events** — `event`, `festival` → **`event_cost`**  
6. **Digital / platform / vendor** — `digital_ad*`, `email_vendor`, `sms_vendor`  
7. **Compliance / finance** — may appear as `OTHER` or `software_platform` (compliance tools); **counsel** **/ treasurer** own **jurisdiction**  
8. **Other** — unmapped `category` keys → **`other`**

**Strategy manual qualitative list** (banners, shirts, cards, tablecloth) **must** **resolve** to **tagged** **ledger** **lines** **or** **be** **explicitly** **rough**.

---

## 8. Burn-rate analysis

**Definitions:**

- **Gross** **burn** **(ops):** **Sum** of **CONFIRMED** **outflow**-type **rows** (typically **EXPENSE** + **REIMBURSEMENT** as applicable—**treasurer** defines whether **reimbursement** **doubles** **with** **expense**; **this** **manual** defers) **per** **period**.  
- **Net** **cash** **change:** **Inflows** **(CONTRIBUTION** **+** **any** **other** **inflow** **types** **+** **bank**) **−** **outflows**. **COH** = **not** **computed** in **this** **repo** without **bank**.

**Output:** **Burn** by **week** and **by** **wire**; **flag** **weeks** with **&gt;1σ** **spike** in **`event_cost` + `digital_advertising`**.

---

## 9. Cash-on-hand discipline

- **COH** in **narrative** = **treasurer** **+** **bank** **(and** **FEC** **as** **applies**).  
- **Do** **not** **equate** **sum( CONFIRMED CONTRIBUTION )** **−** **sum( EXPENSE )** to **COH** **without** **reconciliation** **(fees,** **pending,** **refunds,** **transfers,** **debts**).  
- **Floor** **triggers** (when to **pause** **paid** **media,** **travel,** **merch**): set **in** **simulation** and **governance** with **owner**; **use** **actual** **COH** from **treasurer** **inputs**, **not** **Git**.

---

## 10. What early spending teaches us

**Heuristics (non-numeric):** If **actuals** show **high** **early** **print/visibility** **before** **volunteer** **density,** the **next** **budget** should **either** **fund** **follow-up** **capacity** or **delay** the **next** **print** **wave** **to** **avoid** **tire**-**kicking** **visibility**. If **travel** **spikes** without **`relatedEventId`** or **`WorkflowIntake` follow-up,** **tighten** **SOP** before **increasing** **weekly** **travel** **cap** (align `WEEKLY_TRAVEL...`).

---

## 11. How early spend should guide the field plan

- **$** per **Field**-**touched** **county** (ledger + **OIS** / **ladder** **events**) **&lt;?&gt;** **targets** for **P5** and **hires**-**ish** **volunteer** **leads** **—** **compare** to **ladder** **moves,** not **invented** **precinct** **RPE**.  
- **Reallocate** when **a** **region** has **low** **attributed** **field** **results** and **high** **cost**.

---

## 12. How early spend should guide volunteer-program launch

- **Stagger** **tooling** **and** **training** **costs** (software, comms) **so** they **land** when **V.C.** can **onboard**; **avoid** **SaaS** **sprawl** **before** **first** **triage** **capacity** is **funded** **(qualitative** **correlation,** not **a** **number** **here**).

---

## 13. How early spend should guide paid media

- Compare **`digital_advertising`** and **`print_mail`** (newspaper) **actuals** to **APA** **and** **social** **plan** in `PAID_MEDIA...** **—** if **earned** **/ organic** is **outpacing** **paid** by **KPI,** **shift** **margin**; **if** **COH** is **tight,** **apply** **Pass** **3C** **governance** **(no** **new** **buys** without **follow-up** **owner**).

---

## 14. How early spend should guide travel

- **`travel_mileage_reimbursement` actuals** **÷** **weeks** **with** **trips** **(from** `CampaignEvent` or **calendar) **=** **inputs** to **set** **future** **weekly** **mile** **/** **$** **caps** in `WEEKLY_TRAVEL...` **—** **treasurer** **approves** **the** **cap** **method**.

---

## 15. How early spend should guide signs / banners / postcards

- **Visibility** **spend** **(mapped** **category + wire)** **vs** **donor** **response** **(attribution** **in** **treasurer** **system)**—**if** **unknown** **attribution,** **do** **not** **claim** **efficiency**; **reorder** **tranches** **in** `POSTCARDS_SIGNS...` **per** **available** **cash** **(§3** **strategy** **bands**).

---

## 16. How early spend should guide fundraising asks

- **Tie** **ask** **size** and **tranche** **timing** to **residual** **runway** **(COH** **/ burn)** **and** **two-week** **pace** **rule** **for** **stretch** (strategy §3/Part B). **If** **raising** is **lumpy,** **schedule** **asks** **after** **known** **burn** **weeks,** not **only** **on** **empty** **calendar** **aesthetics**.

---

## 17. Budget scenarios (simulation + planning)

| Scenario | Intention |
|----------|-----------|
| **Survival** | **Minimum** **runway** to **operate** **core** **compliance** + **skeleton** **field;** **cut** **ordered** in **governance** (strategy Part B) |
| **Base** | **$250K** by **Aug** **31** (Pass 3B) — **default** **plan** |
| **Momentum** | **Between** **base** and **stretch;** **scale** **travel** and **pilot** **programs** with **proven** **intake** |
| **Stretch** | **$500K** only **if** **unlock** **rule** met **(two** **consecutive** **periods**); **funds** **earmarked** to **GOTV**-**adjacent** and **infrastructure** per **owner** |

**Pass 3H:** Scenarios are **naming** and **RACI**; **dollar** **fill-ins** = **from** **treasurer** **model,** not **this** **file**.

---

## 18. Weekly budget review rhythm

- **Treasurer** **+** **CM** **(and** **owner** **on** **material** **moves) **: **review** **DRAFT** **backlog,** **confirm** **receipts,** **and** **variance** **vs** **active** `BudgetPlan` **(if** **any).  
- **Escalation** if **&gt;N** **DRAFT** **rows** **&gt;** **X** **days** **old** (set **N,** **X** with **owner**).  
- **Reconcile** **processor** **fees** **(ActBlue,** **Stripe,** **etc.)** **in** **treasury** **system**; **if** **fees** are **a** **separate** **ledger** **category** (`processor_fee` maps to `fundraising_vendor` in `budget.ts`), **track** them **as** **their** **own** **line** **in** **narrative** **budgets**.

---

## 19. Financial dashboard requirements (future product, honest today)

- **Show** **CONFIRMED** **totals** **and** **DRAFT** **count** **(warning)** **as** in **truth-snapshot** **pattern**.  
- **Allow** **filter** by **date,** **wire,** **relatedEventId.**  
- **Do** **not** **export** **PII** **with** **dollar** **rows** **in** **public** **routes** **(admin** **only**).  
- **Link** to **`CampaignEvent`** for **“cost** **per** **event**” when **populated**.

---

## 20. Simulation inputs (Pass 3H adds)

- **r_week[ ]:** **Observed** **weekly** **net** **inflows** **(treasury** **+** **ledger,** **aligned)**  
- **Burn_week[ ]:** **Observed** **confirmed** **outflow** **aggregates**  
- **W_week:** **Field** **load** (events, **counties** **touched**) **—** can **come** from **`CampaignEvent`**, not **from** **this** **manual**  
- **a_last3** **vs** **a_prior:** **last-three-weeks** **acceleration** **flag** **(boolean** or **mult**)  
- **COH_min:** **floor** from **owner/treasurer**  
- **Unlock_stretch** **(boolean):** from **pace** **rule** in **strategy** **Part** **B**  
- **Fee_rate** **(donations):** **assumption** from **actual** **statements**

---

## 21. Data gaps / treasurer questions

- **Is** `FinancialTransaction` **100%** **of** **spend,** or **are** there **unrecorded** **obligations**?  
- **Refunds,** **chargebacks,** **pledges,** **in-kind,** **loans,** **personal** **float** **—** **where** **captured?**  
- **Contributions** **in** **ledger** **vs** **processor** **net** **—** **recon** **frequency?**  
- **Which** **categories** are **mandated** for **new** **rows?**  
- **Filing** **period** **(FEC** **/ state)** **—** how **simulation** **weeks** **map?**

---

## 22. Steve decision list (short pointer)

**Full** **form** **=** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**36. **In** **one** **line:** **confirm** **source** **of** **truth** for **all** **numbers** **public** **or** **internal,** and **which** **outputs** of **this** **system** may **label** “from **ledger**” **vs** “**from** **treasurer** **bank** **reconciliation**.”

---

**Last updated:** 2026-04-28 (Pass **3H**)
