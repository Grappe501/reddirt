# Manual Pass 4B — completion report

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** Manual / design only  
**Date:** 2026-04-28  
**Constraints:** No app code, no DB/auth/migrations/deps, no secrets, no commit (per user). No “AI” as public name for the Guided Campaign System. No voter suppression, deception, or protected-trait microtargeting language.

---

## Files read (Pass 4B work plan)

- `MANUAL_PASS_4_COMPLETION_REPORT.md` (context)  
- `playbooks/ROLE_PLAYBOOK_INDEX.md`  
- `playbooks/DASHBOARD_ATTACHMENT_RULES.md`  
- `playbooks/ROLE_KPI_INDEX.md`  
- `playbooks/TASK_TEMPLATE_INDEX.md`  
- `playbooks/APPROVAL_AUTHORITY_MATRIX.md`  
- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` (anchor for Part J)  
- `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` (anchor for new §)  
- `POLITICAL_ANALYSIS_AND_PATH_TO_WIN_DATA_MODEL.md` (cross-ref alignment)  
- `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`  
- `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md`  
- `SYSTEM_READINESS_REPORT.md`  
- `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` (§37 anchor)  
- Repo **search** intent: **dashboard**, **workbench**, **simulation**, **sliders**, **scenario**, **KPI**, **targeting**, **segment**, **iPad** — no code edits from search.

---

## Files created

| File | Description |
|------|-------------|
| `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md` | 22 sections: exec summary, CM/candidate strategy panels, master plan viewer, assumptions registry, slider system, KPI explainer, approval gates, 18 **slider** rows in **§**22 table, Steve list |
| `SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md` | 25 sections: ethical segmentation, recruit/persuade/GOTV, geography/precinct fallback, **lanes** (rural, campus, 60+ postcard, economy, direct-democracy, county party, soft R/ind., nonvoter), MCE/NDE/paid/canvas integration |
| `IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md` | 20 sections: iPad-first, touch, offline, **3–5** iPad budget line, **MDM/assignment** TBD, desktop command center, mobile limits |
| `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md` | 20 numbered requirement sections (panels: master plan, assumptions, A/B, KPI, cash gate, vol capacity, path, message, calendar, training, approvals, diffs, ahead/behind, recommendations) |
| `MANUAL_PASS_4B_COMPLETION_REPORT.md` | This report |

---

## Files updated

| File | Change |
|------|--------|
| `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` | **§**26 Pass 4B: sliders, **registry**, dashboard integration, **KPI** **explainer**, **recruit**/**persuade**/**GOTV** inputs, iPad, confidence, approval gates, gaps; header status line |
| `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` | **Part** **J** (4B), **§**23 bullet on **4B**, `MANUAL_INFORMATION` ref **§**38, **last** **updated** |
| `playbooks/DASHBOARD_ATTACHMENT_RULES.md` | Pass 4B table: candidate/CM/slider/iPad |
| `playbooks/APPROVAL_AUTHORITY_MATRIX.md` | New rows: strategy, scenario, budget sliders, **targeting**, VFF audience, **paid** audience, **GOTV** lists, iPad access |
| `playbooks/ROLE_KPI_INDEX.md` | **Pass 4B** sub-table (candidate, CM, owner, analyst) |
| `playbooks/README.md` | **4B** read-first pointers |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | **§**38, intro **4B**, **“when** list” footer, last updated |
| `MANUAL_BUILD_PLAN.md` | **Pass 4B** **complete**; **Pass** **5** **reframed** (Workflow SOPs, runbooks, **strategy**→**task**; optional Message Engine chapter merge) |
| `MANUAL_TABLE_OF_CONTENTS.md` | Version string + **4B** file list |
| `WORKFLOW_INDEX.md` | **4B** + **Pass** **5** pointer |
| `SYSTEM_READINESS_REPORT.md` | Header + **4B** key artifacts; **no** new 0–6 grades |

---

## Strategy dashboard requirements (summary)

- **Master** plan **+** **assumptions** **+** **scenarios** **(Preview** vs **proposed/locked) **on** **CM**; **tighter** **gating** on **candidate** (MI **§**38).  
- **KPI** **impact** **explanations** with **confidence** and **stale**-**data** **flags** — not vote prediction.  
- **18** **levers** in **table** in **`INTERACTIVE_STRATEGY_...` §**22.

## Scenario slider system (summary)

- **Documented** **RACI** in **`APPROVAL_AUTHORITY_MATRIX`**; **$**-linked = **T**+**3H**; **targeting** = **ST**+**C**+**O** as **needed**.

## KPI impact model (summary)

- **`SIMULATION_...` §**26 and **`ROLE_KPI_INDEX`** 4B **table**; **plain**-**language** **deltas** in design doc **—** product **TBD**.

## Segmented targeting plan (summary)

- **`SEGMENTED_CAMPAIGN_TARGETING_...`**: recruit/persuade/GOTV, **geo**-first, **ethics** and **compliance** **on** all **file**-**and**-**paid** work.

## iPad / mobile / desktop (summary)

- **`IPAD_MOBILE_...`**: 3–5 iPad **planning** line; **landscape-**leaning; **48pt**-class **touch**; **phone** = **alerts/reads** for **edits** until **policy** says otherwise.

---

## Unresolved Steve decisions

- All **`MANUAL_INFORMATION` §**38 bullets (who may edit, approve, candidate direct vs. request, top KPIs for candidate vs. CM, scenario names, allowed/prohibited **segmentation** categories, file/paid/GOTV policy, iPad **budget** and **MDM,** dashboard view-only **matrix**).

## Current repo support (honest)

- **Workbench** **/ tasks / intakes** for **ops**; **no** new **4B** **strategy** or **sim** **route** in **this** pass. **`FinancialTransaction` CONFIRMED** for **$** when **using** app **data**.

## Missing product features (backlog, not a warranty)

- **In-app** **assumptions** **store,** **slider** **UI,** **KPI** **explainer** **engine,** **A/B** **diff** view, **audit** of **approvals,** **iPad**-**hardened** **layouts** for **all** **admin** **flows,** **offline** **queue.**

---

## Next recommended pass

**Manual Pass 5** — Workflow SOPs, **Workbench** runbooks, **strategy**→`CampaignTask` / intake **procedures**, **operator** playbooks for **CM/candidate** **surfaces,** **segmented** **message** **SOPs,** **calendar**/**travel** **handoffs,** **and** (optional) Message Engine + Narrative **chapter** **depth** per `MANUAL_BUILD_PLAN.md`.

---

**Last updated:** 2026-04-28 (Pass 4B)
