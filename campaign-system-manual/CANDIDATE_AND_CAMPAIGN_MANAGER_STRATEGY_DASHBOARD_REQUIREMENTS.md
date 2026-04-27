# Candidate and campaign manager strategy dashboard requirements

**Lane:** `RedDirt/campaign-system-manual`  
**Status:** **Manual Pass 4B** — product requirements in prose. **Not** a shipped UI. **Not** a claim that all panels exist.  
**Date:** 2026-04-28  
**Public language:** **Workbench**, **Pathway Guide**, **Campaign Operating System** — not “**AI** dashboard.”

**See also:** `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md`, `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`, `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`, `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `playbooks/ROLE_KPI_INDEX.md` (Pass 4B addendum), `playbooks/APPROVAL_AUTHORITY_MATRIX.md` (Pass 4B addendum).

---

## 1. Candidate strategy dashboard

- **Primary user:** **Candidate**.  
- **Core:** **Time** and **load** (calendar blocks, **rest**), **one**-page **“plan** **vs** **pace**” **strip** (fundraising, field, comms) using **only** **approved** **aggregates** — not **voter** **rows**.  
- **Tie:** public **message** **discipline** and **MCE/NDE** **queue** health (defects, pending reviews).  
- **Sliders:** default **read-only** or **request**-only for **$**-impacting and **GOTV**-adjacent levers — **see** `MANUAL_INFORMATION_REQUESTS_FOR_STEVE` **§**38.

---

## 2. Campaign manager strategy dashboard

- **Primary user:** **CM** with **admin** **Work**bench.  
- **Core:** **unified** **open** work, **P0** **list**, **RACI** for **stuck** intakes, **PII** **export** **watch**, **compliance** **flags**.  
- **Add (future build):** **assumption** **draft**, **scenario** **A/B**, **KPI** **explainer** **side** **panel**, **route** to **LQA** **per** **APPROVAL** **matrix**.  
- **Not** a replacement for **treasurer** **UI** for **COH** **truth**.

---

## 3. Shared master plan panel

- **Canonical** text **excerpts** from `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **+** **linked** **manuals** (Parts **B**–**J** as applicable). **Version** **+** **effective** **date** with **“last** **approved** **by**” (owner/CM as policy). **Deep** **link** to **source** **markdown** for **ops**.

---

## 4. Editable assumptions panel

- **List** and **group** the **assumption** **registry** keys (see `INTERACTIVE_STRATEGY_...` §6). **Edit** = **propose** **draft**; **operational** **lock** = **LQA** **path**.  
- **Show** which **sliders** are **stale** (data **age**).

---

## 5. Scenario comparison panel

- **Compare** two **saved** **scenarios** (A/B) with **KPI** **deltas** and **confidence** **labels**. **No** “**winner**” on **outcome** **—** only **readiness** and **resourcing**.

---

## 6. KPI movement panel

- **Tie** each **KPI** to **one** or **more** **sliders** **and** to **readiness** **layers** in `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`.  
- **Candidate**-specific **KPIs:** **schedule** **adherence**, **comms** **SLA**, **time** **to** **rest** **blocks** (as policy).  
- **CM**-specific: **queue** **TTF**, **triage** **defects**, **stretch**-**goal** **unlock** **watch** (with **treasurer**).

---

## 7. Budget / cash gate panel

- **Pull** from **3H** and **`FinancialTransaction` CONFIRMED** when available — show **COH** **floor** **warnings** and **spend** **class** **caps** (treasurer **truth**). **Sliders** that imply **$** show **“blocked** **until** T **approves**” **or** **hard** **stop**.

---

## 8. Volunteer capacity panel

- **Funnel** view: signups, hub, **active** (definition per **SOP**), **P5**, **GOTV** **bench** (aggregate). **No** **PII** on **public** **tiles**. **Link** to **V.C.** **work** in **tasks**.

---

## 9. County / precinct path panel

- **OIS**-honest **coverage**; **degrade** to **county** when **precinct** **incomplete** (`PRECINCT_...` **+** `POLITICAL_...`). **Data** lead **governed** **exports** only.

---

## 10. Message and targeting panel

- **High**-level **lane** **mix** (recruit / persuade / **GOTV**) and **geography** **focus** from `SEGMENTED_CAMPAIGN_TARGETING...` — **compliance** **and** **NDE** **status**, **not** **row** **data**.

---

## 11. Calendar and travel impact panel

- **Next** 2 / 4 / **12** **weeks** (templates per **weekly** **travel** doc); **show** **implied** **$** and **miles** when **receipts** or **estimates** exist; **link** to **`CampaignEvent`**.

---

## 12. Training and readiness panel

- **Module** **completion** for **leads** and **certs**; **scarcity** of **trainers** as **bottleneck** **input** to **scenarios** (3G/Pass 4 training). **Not** a **LMS** **claim** until `SYSTEM_READINESS` **+** product say so.

---

## 13. Approval queue

- **Surface** **items** that **map** to **`APPROVAL_AUTHORITY_MATRIX`** (includes Pass 4B **rows** for **strategy** and **targeting**). **May** be **separate** from **unified** **open** work until **unified** **in** product.

---

## 14. “What changed this week?” panel

- **Diff** in **assumptions**, **KPIs**, **major** **events**, **funding** **tranches** — **narrative** **and** **numeric**; **sourced** to **data** **labels**.

---

## 15. “Are we ahead or behind?” panel

- **Definition:** “Ahead of our plan (internal)” — not a public vote prediction. Use bands and caveat when data is stale or missing.

---

## 16. “Recommended next decisions” panel

- **Suggests** **human** **actions** (task **types**), **never** **auto**-**executes** comms, **$**, or **exports**. **RACI** **chips** on **each** **suggestion**.

---

## 17. Human approval requirements (embedded policy)

- **All** **panels** that **create** **work** in the **field**, **GOTV**, **or** **comms** must **name** the **LQA** **and** show **if** **pending**. **Override** = **owner** or **compliance** only per **docs**.

---

## 18. Data and source labels

- **Every** **KPI** **tile** has **a** **“source”** **line** (e.g. **“treasurer** **export** **2026-**…”, **“assumption** **draft** **—** not **ledger**”).

---

## 19. Current repo support (honest)

- **Workbench** + **tasks** + **intakes** = **core** of **admin** life today. **No** **native** **strategy** / **sim** **surface** in **this** pass. **OIS** and **comms** **UIs** exist with **varying** **depth**; **verify** with `SYSTEM_READINESS_REPORT.md` before “**done**” **language**.

---

## 20. Missing product features (build tickets — future)

- **Strategy** **routes** for **admin**; **assumption** **store**; **sim** **API**; **KPI** **explainer**; **approval** **log**; **A/B** **scenario** **diffs**; **iPad**-optimized **admin** **layouts** for these **new** **panels**; **segment** **metadata** for **MCE/NDE** (no PII in UI).

---

**Last updated:** 2026-04-28 (Pass 4B)
