# Segmented message and distribution SOP (Manual Pass 5)

**Lane:** `RedDirt/campaign-system-manual`  
**Purpose:** Execute **`SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`** with **MCE/NDE** and **LQA** — **not** clandestine **micro**targeting, **not** “**AI**-optimized” **voters** in **public** copy.

**Refs:** `playbooks/TASK_TEMPLATE_INDEX.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `workflows/MESSAGE_CREATION_TO_DISTRIBUTION` (in `WORKFLOW_INDEX.md`) · `PRECINCT_PATH_TO_VICTORY...` (precinct vs county) · `PAID_MEDIA...` (3C)

---

## 1. **Lanes** (recruit / persuade / **GOTV**)

| Lane | Intent | Comms **tone** (examples only) | **Default** **TT** **when** this lane **drives** **new** work |
|------|--------|--------------------------------|----------------------------------|
| **Recruit** | **Signups,** P5, **hosts,** **vols** | **Values**-**first,** **clear** **CTA**; **opt**-**in** | **TT-01,** 03, 04, 05, 11 |
| **Persuade** | **Un**decides / **softs** in **counseled** **universes** | **Sourced,** no **invented** **stats**; **C** on **contrast** | 13, 17, 19, 20, 21, **(paid** 3C) **|
| **GOTV** | **Identified** **supporters,** **turnout** **(lawful** **compliance** **)** | **Compliant** text; **no** **pressure** to **mislead** | 25, 27, **(program** SOP) ** |

**All** **three** = **geography**-**first** **(planning** **)** **+** **aggregate** **audience** **(no** **protected**-trait **fishing** **).**  

---

## 2. **Geography**-**first** **messaging**

- **OIS**-honest **county/region;** **travel** plan **(WEEKLY_TRAVEL_...** **,** 3E/3F) **.  
- **If** **precinct** **completeness** **low,** do **not** **pretend** **prec** **-****level** **precision** in **public** (see PRECINCT **doc** and **4B** **sliders) **.  

---

## 3. **County** / **community** (when **precinct** **data** **missing**)

- **Degrade** to **county** **ladder,** **county** **narrative,** and **GOTV** **capacity** **by** **county** **—** not **a** **fake** **“**precinct** **map**” **in** **public** **.  
- **TT**-**10,** 08, **tour** **SOPs** **(3F) **.  

---

## 4. Rural lane (SOP)

- **Docs:** `COUNTY_PARTY_...` + `WEEKLY_...` (no invented meeting chairs or dates).  
- **TT:** TT-15, 16, 08; rural OIS touch (honest).  
- **MCE/NDE:** no stereotype; no token photo-only “visit” (strategy manual).

## 5. Campus / youth (SOP)

- **MCE/NDE** + youth safety; **C** on minors (3E). **TT-11**.

## 6. 60+ / name-ID (postcard)

- **TT-21;** NDE + tranche; treasurer + $ gate; match codes internal only.

## 7. Working-class / family economy lane

- Policy-sourced claims; **C** on contrast; **MCE** — no inference of protected/sensitive attributes (MI + 4B).

## 8. Direct democracy / transparency / SOS fit

- Accurate election-administration position; no false “fraud” inference; listening tour where applicable. **MCE + C.**

## 9. County party / rural Democratic infrastructure (relationships)

- 3F 72h follow-up, tour; **TT-08, TT-10.**

## 10. Soft Republican / independent (guardrailed)

- Small, supervised, lawful, no deception; no sensitive “modeling” in public; **C** for contrast. **MCE**-gated.

## 11. Nonvoter / re-engagement

- Information + legal registration help; no misleading deadlines. **C + ST** as policy. V.C. + TT-01/02/03 class.

---

## 12. MCE drafting path

1. **Intake** or **MCE** **tool** = **source**-**tied** **bullets,** not **a** **final** **ad** **. **  
2. **MCE/NDE** **defect** **loop;** no **“**ship**”** **on** **defect** **(CM**+**MCE) **.  
3. **Counsel** on **contrast** **(matrix) **. **  
4. **If** it **moves** a **4B** **lane,** `CampaignTask` **with** **SEG-** (see 4B runbook) **.  

## 13. NDE distribution path

- Waves, checklists, shipped (telemetry or ops log). LQA: MCE + comms + O if $ +. Link `CommunicationPlan` + source `WorkflowIntake` when applicable.

## 14. Paid media handoff (3C)

- LQA: T + M + C + O (high $); MCE; counsel on legal; vendor scope. **TT-19** (assets + $ check). No audiences built on sensitive/protected attributes (platform policy + counsel).

## 15. Canvassing / turf (internal)

- **TT-25,** TT-26 (signs); OIS-honest; no public turf PII. **C + O** for bulk list/export per policy.

---

## 16. Compliance and counsel gates

| **Action** | **Gate** **before** **externalize** | **Owner** |
|------------|-------------------------------------|-----------|
| **Public** **comms,** any lane | MCE+NDE **(defect=0) **+ **C** on **contrast** | LQA in **matrix** |
| **Voter**-**file**-**adj** | **O**+**ST**+**C**+**(T** if $**)** | |
| **Paid** | **T**+**C**+**M**+**MCE**+**C**+**(vendor) **| |
| **GOTV** | **ST** + **C** + (T) + script v# | |
| **Export** (bulk) | **O** **(policy) **+ **log** | Data |

---

## 17. **Do**-**not**-**do** **list** (all **staff**)

- **No** **suppression,** **deception,** or **intimidation** in **any** **lane** or **A/B** test. **  
- **No** **protected**-trait **inference,** or **messaging** that **suggests** it. **  
- **No** fake precision in rural + precinct + $ — use “TBD+owner” (3F), OIS-honest data, and treasurer+sim in internal planning only.  
- **No** **invented** **endorsements,** **branches,** **campuses,** or **$** (repo **rules) **.  
- **No** **GOTV** / **voter** **row** in **unsecured** **chats. **

---

## 18. **Task** **templates** by **lane** (quick **ref**)

| **Lane** | **Primary** **TT** (see **playbooks/TASK** **)** |
|----------|-----------------------------------|
| **Recruit** | TT-01, 02, 03, 04, 05, 11, 18 (hosts) |
| **Persuade** (non-paid) | TT-13, 17, 20 |
| **Persuade** (owned + paid) | TT-19, 21, paid 3C SOP |
| **GOTV** | TT-25, 27, plus reg/script SOP |
| **Cross-cutting** (legal / owner) | TT-28, 20, crisis SOP |

---

**Last updated:** 2026-04-28 (Pass 5)
