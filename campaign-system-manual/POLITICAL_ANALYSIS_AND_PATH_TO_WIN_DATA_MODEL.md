# Political analysis and path-to-win data model (Manual Pass 3G)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-28**  
**Public language:** Field Intelligence, Message Engine, Workbench — not “AI.”

**Honesty (required):** No invented vote totals, margins, polls, or turnout. All baselines come from sourced, dated inputs (certified or public results, plus counsel on use). See `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §33. Libertarian presence, GOP multi-candidate primary, runoff, and litigation are **scenarios** — only use in planning when **filing status, ballot access, and results** are sourced; do not paste PII or unverified claims into this repo.

**Repo:** OIS, voter and precinct models where governed (see `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`, `SYSTEM_READINESS_REPORT.md`). This file is a modeling spec, not a data drop.

---

## 1. Executive summary

A governed, **sourced-only** stack of political and election analysis to inform message, field, fundraising, volunteers, and simulation. Outputs are **scenarios** with confidence labels, rebaselined when new information arrives (see `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §24, Pass 3G).

---

## 2. What data must be gathered

- Past election results for the **office** (and relevant primaries), with **as-of** date and jurisdiction.  
- Registration and turnout proxies where lawfully available.  
- Ballot qualification and candidate set (including LP) from **public filings** — not chat.  
- Primary and runoff dynamics; **contentious litigation** from **public dockets** or counsel briefs, not rumor.  
- County and, when data exists, precinct-level history for path-to-victory modeling (never fabricate missing precincts).

---

## 3. Past election baselines

- Store **provenance,** **date,** and **source URL or certified extract reference** in internal tables (not this markdown). Re-run when amendments or recanvasses are published.

---

## 4. Trend toward Democratic wins (narrative discipline)

- May only be claimed when **sourced** time series support it; OIS may show **trend** as **indicative** with low-N warning.

---

## 5. Libertarian candidate effect (scenario, not certainty)

- Model as **sensitivity** on margin math **if and only if** a Libertarian (or other) is **on the ballot per filing**; label **hypothetical** if uncertain.

---

## 6. Republican three-way primary analysis

- Describe **dynamics** (not invented vote shares): money, endorsements, geography, turnout patterns — from **public** reporting and **official** results as released.

---

## 7. Runoff and court fight (where applicable)

- **Runoff** rules and dates from **official** election calendars. **Litigation** from **dockets** and **counsel** analysis — not for public opponent attacks without MCE/NDE.

---

## 8. What primary / runoff says about opponent-party dynamics (careful)

- **Internal** **strategy** memo language only; public copy stays compliance-first. No **unsourced** contrast.

---

## 9. County-level analysis

- Align with OIS county tiles, county ladder, and travel plan; flag **data acquisition** when county-only modeling is the honest ceiling.

---

## 10. Precinct-level analysis when data exists

- **Precinct** results and turf planning per `PRECINCT_PATH_...` — if keys missing, **county-only** with explicit flag.

---

## 11. Rural / suburban / campus lenses

- Cross-walk to `WEEKLY_TRAVEL_...`, `YOUTH_...`, `FOCUS_...` — do not stereotype; use **segment** labels for planning only.

---

## 12. Messaging implications

- Message Engine and NDE use **sourced** **facts** and **permitted** contrast only.

---

## 13. Field implications

- Canvass and visibility intensity follow **data confidence**; rural priority remains doctrine (`COUNTY_PARTY_...`).

---

## 14. Fundraising implications

- Tranche, geography, and “money near margin” are **operator** **hypotheses** with treasurer sign-off, not this file.

---

## 15. Volunteer implications

- Pathway density vs. OIS; no fake P5 “heat” without roster truth.

---

## 16. Simulation inputs

- Feed **scenarios,** **confidence,** and **gaps** to `SIMULATION_...` §24 — **adaptive** updates when new filings or results land.

---

## 17. Data sourcing rules

- **Primary** sources OR reputable aggregation with **link** to official data; **date** and **jurisdiction** on every import row.

---

## 18. No invented numbers rule

- If a number is not sourced, the dashboard shows **null** or **unknown,** and operators run acquisition — **not** a narrative substitute.

---

## 19. Dashboard requirements

- **Source of truth** column, **as-of** date, **margin** and **turnout** where loaded, **scenario** toggles (LP, runoff), no public opponent oppo dump.

---

## 20. Steve decision list

- **Official** **results** as-of and **file** set for the race.  
- **Analyst** **RACI** and **brief** **cadence** to CM.  
- **What** may be **cited** **publicly** **vs** **internal** only.  
- **Path-to-victory** **review** with **owner** when **data** is **incomplete** (acquisition before spin).

**Last updated:** 2026-04-28 (Pass 3G)
