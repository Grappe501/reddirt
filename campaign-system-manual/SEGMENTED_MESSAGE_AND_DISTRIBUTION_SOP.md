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

## 19. Election-confidence lane (Pass 5D — low emphasis, trust/FAQ, not fear)

- **Use for:** Public FAQ, SOS / “get under the hood” supporting lines, Pathway or M-001-adjacent tone — **cited,** humble, never dismissive (`ELECTION_CONFIDENCE_TRANSPARENCY_AND_GET_UNDER_THE_HOOD_DOCTRINE.md`, `KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md`).  
- **Not:** A GOTV-fear, turnout-scare, or doom channel. MCE/NDE + LQA + **C** on sensitive fraud or **alleged**-case rhetoric (`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §41).  
- **Intake:** Prefer `WorkflowIntake` with comms review; no voter rows in unsecured chat; link to vetted static FAQ — do not invent new statistics in DMs (Pass 2A spine).  

---

## 20. Campaign Companion as distribution surface (Pass 5E)

- **Role:** Guided help / Pathway entry — **not** a second NDE “ship” channel and **not** auto-comms. User-visible lines follow `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` (Layer A + B, no system leakage; modes: voter / volunteer / insider).  
- **MCE/NDE:** Any reply pattern that could read as public messaging (contrast, opponent, stats) = MCE + LQA before it is saved as a template; Companion does not invent ship copy.  
- **Metrics (if tracked):** defect rate, escalation to human — not “messages per minute” vanity (`playbooks/ROLE_KPI_INDEX.md` Pass 5C).  
- **Cross-ref:** `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md` (5D); `playbooks/ESCALATION_PATHS.md`; MI §42 (tone + escalation).

---

## 21. Campaign Companion — candidate voice lane and candidate-refinement lane (Pass 5F)

- **Candidate-voice lane (public):** MCE + NDE + LQA govern any outbound or static-facing line that sounds like Kelly; see `ASK_KELLY_CANDIDATE_VOICE_AND_POSITION_SYSTEM.md` (A–D levels) and `CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md` / 5D FAQ for the election/trust slice — not a second “ship” bypass. GOP / civic / cross-party tone: listening, service, safety for voters — not pandering (`CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` §6). Unapproved contrast or a new stat in a chat = MCE + comms + `playbooks/APPROVAL_AUTHORITY_MATRIX.md` (MI §43).  
- **Refinement lane (private + ops):** Public question → Level D → candidate + MCE/comms → Level A for public-ready knowledge (`CANDIDATE_REFINEMENT_INTAKE_AND_QUESTION_BANK.md`, `CONTINUOUS_CAMPAIGN_KNOWLEDGE_INGESTION_AND_REFINEMENT_ENGINE.md`). Distribution-adjoining SOP; not one-click send from a model.  
- **Cross-ref:** `CAMPAIGN_COMPANION_OMNISCIENT_AGENT_ARCHITECTURE.md` (5E); `MANUAL_PASS_5F_COMPLETION_REPORT.md`; `CAMPAIGN_COMPANION_LIVE_INTELLIGENCE_AND_COMMAND_INTERFACE.md` (CM briefings — not GOTV in chat); `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` (no internal error strings to voters); sections 1–18 and 4B tables in this file for TT / M / C / A / 4B lanes.

---

## 22. Beta feedback and Ask Kelly suggestion box (Pass 5H — not Recruit / Persuade / GOTV)

- **This** **lane** **is** **clarity** **+** **governance,** not **GOTV** **persuasion,** not **Narrative** **Distribution,** and **not** a **bypass** of **2A,** **LQA,** or **MCE+comms** **(see** `ASK_KELLY_SUGGESTION_BOX_AND_FEEDBACK_INTAKE_RULES.md` **,** `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md` **).**  
- **Intake** **: ** structured **suggestions,** “**why**” **explanations,** **and** **beta** **tickets** **—** **route** to **admin** **/ ** **candidate** **/ ** **comms** **/ ** **counsel** **/ ** **product** per **`playbooks/APPROVAL_AUTHORITY_MATRIX` **. **  
- **MCE/NDE:** **Do** **not** **treat** **suggestion** **replies** as **draft** **public** **mail** without **LQA+**; **not** a **new** **send** **channel** for **unvetted** **contrast,** **stats,** or **legal** **claims** **(see** 5B **+ **5D** **).**  
- **Do** **not** **collect** or **stimulate** **PII** in **a** **public** **or** **beta** **help** path **(no** **voter** **/ ** **donor** **rows) **. **  
- **Cross**-**ref:** `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` **,** `BETA_VOLUNTEER_...` **,** `MANUAL_INFORMATION_...` **§**45** **(beta** **list,** **naming) **,** **§**21 **(this** **SOP) **; **5H** is **a** **separate** **row** in **MCEs**’ **minds,** not **a** **fourth** **TT**-**lane** in **the** **recruit** **/ ** **persuade** **/ ** **GOTV** **table** **(§**1** **).** 

---

**Last updated:** 2026-04-28 (Pass 5 + 5D + 5E + 5F + 5H)
