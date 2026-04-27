# Youth, campus, and student organizing plan (Pass 3E)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — **not** “AI” as a public product name.

**Honesty rules:** Do **not** invent named student leaders, campus endorsements, or “active” teams where only **contacts** exist. Every campus row must use a **status label** (below). **Higher-ed scale (public):** The Arkansas Department of Higher Education reports **40+** higher-ed institutions statewide, including **10** four-year public universities, **22** two-year colleges, **12** private four-year institutions, and **1** academic health center — use for **coverage ambition**, not as a claim that the campaign has relationships at each.

---

## 1. Executive summary

Youth and campus organizing are a **high priority** for rapid buildout: students are **multipliers** for volunteers, content, events, and county bridges. This plan defines a **campus ladder**, a **high school / youth civic lane** (with safety and consent), **coverage table structure** for every campus (status-labeled), recruitment and event playbooks, **student ambassador** design, social/content lanes, endorsement/quote **process** (no names until approved), **campus-to-county** integration, dashboard needs, training, risks, and a **Steve decision list**. Calendar and **weekly travel projection** tie to `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`.

---

## 2. Why youth organizing matters in this campaign

- **Scale and energy:** Campuses concentrate people, networks, and cultural attention.  
- **Stakes:** The Secretary of State office shapes **voting access**, **transparency**, **ballot access**, and trust in elections — issues that affect young voters and future leaders **now**.  
- **Pipeline:** Student leaders become **county** volunteers, hosts, and (opt-in) **future candidate** pipeline participants (see strategy manual 3B/3C infrastructure doctrine).  
- **Comms:** Youth-generated **Field Intelligence** and **Pathway** stories are **earned media** and **Message Engine** inputs when governed.

---

## 3. Current baseline (Steve, 2026-04-27)

| Signal | Baseline |
|--------|----------|
| **Strong students** | **3–4 campuses** with meaningful student energy (not full chapter buildout) |
| **Geography** | **Mainly Central Arkansas and Northwest Arkansas** |
| **High school** | **A few** high school students engaged — **rules-heavy** lane (§6) |
| **Urgency** | Youth/campus must **come online quickly** and become a **high focus** |
| **Ambition** | Volunteers and relationships on **every major college and university** across Arkansas — **target**, not current fact |

**Implication:** Manuals and tables must default to **target** / **needs research** until Steve and field confirm **contact** or **active** status per campus.

---

## 4. Youth political pathway — why SOS matters to young people

- **Voting access:** Registration, early vote, polling place information, and reducing unnecessary barriers — operational issues the office touches.  
- **Ballot access & direct democracy:** How measures qualify; **transparency** in process.  
- **Transparency & accountability:** Campaign finance reporting, open government, public trust in elections.  
- **Civic power:** Young people **build** power through organized volunteers, not through the **Guided Campaign System** replacing human judgment.  
- **Future candidate pipeline & leadership development:** Optional, **opt-in**, ethics-first; no **guarantee** of candidacies (align with Pass 3C/3D north-star language).

---

## 5. Campus organizing ladder (0–8)

| Stage | Name | Meaning |
|-----:|------|--------|
| **0** | **No campus contact** | County/region known; no identified student liaison. |
| **1** | **Student contact identified** | Named relationship (may be informal); not yet volunteering. |
| **2** | **Campus volunteer active** | At least one recurring action (tabling help, content, event support) in last 14–30d per SOP. |
| **3** | **Campus captain identified** | Named lead with scope; not yet a full team. |
| **4** | **Campus table or event held** | Documented event in `CampaignEvent` or SOP log; debrief captured. |
| **5** | **Student Power of 5 teams active** | P5 path started (per product/SOP availability). |
| **6** | **Campus chapter or cell active** | Recognized internal cell (may be informal; **not** a legal “chapter” claim without counsel). |
| **7** | **Campus-to-county bridge active** | Regular handoff to county coordinator / field. |
| **8** | **Campus GOTV / visibility team active** | ED window team with **safety** and **compliance** sign-off. |

**Rule:** Do **not** label a campus **active** at stage **5+** without field truth. “**Contact**” ≠ “**team**.”

---

## 6. High school / youth civic pathway

- **Parent/guardian/school rules:** Follow district policy, event rules, and **age-appropriate** engagement. **No** unsupervised PII exposure.  
- **Non-voter youth:** Visibility, peer content, **service** (not voter file work).  
- **Civics and volunteerism:** Training modules (§15) emphasize **ethics**, **consent**, and **no inappropriate data access**.  
- **Youth safety and consent:** Code of conduct; escalation path; **do not** publish minor identifiers without guardian/counsel workflow.  
- **Data:** Youth **do not** get **VoterRecord** or walk lists except where law + **campaign policy** + **MANUAL_INFORMATION_REQUESTS** Steve answers explicitly allow (default = **no**).

---

## 7. Major college and university coverage plan — table structure

**One row per institution.** Use ADHE’s **40+** institutions as the **outer universe**; the campaign’s **priority** set is a **subset** (Steve + CM).  

| Column | Description |
|--------|-------------|
| **Campus name** | Official name. |
| **City** | |
| **County** | Arkansas county FIPS/slug per campaign convention. |
| **Region** | OIS **region** (8) when mapped. |
| **Status (required label)** | One of: **active** · **contact identified** · **target** · **unknown** · **needs research** |
| **Campus captain** | **Blank** or **TBD** until named — do **not** invent. |
| **Student orgs to explore** | e.g. student gov, service clubs, pre-law, civic groups — **hypotheses**, not claims of relationship. |
| **Event opportunities** | Tablings, homecoming, club fairs — **TBD** until scheduled. |
| **Travel priority** | Number or band (1–5); tie to `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`. |
| **Next action** | Request intro; schedule visit; follow-up from event — **Workbench** task. |
| **Data confidence** | **Low** / **Med** / **High** (how sure is the **status** field?). |

**Seeding the table:** Import **no** **fake** rows as “**active**.” A blank spreadsheet with headers + 2–3 **example** **target** rows (major public universities) is acceptable; **or** a CSV with **all** `unknown` / **needs** **research** until research sprint completes.

**Priority counties with campuses:** When a **strategic** county also hosts a **target** or **active** campus, **flag** for **joint** field + campus travel (see `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` Pass 3E addendum).

---

## 8. Campus recruitment playbook (summary)

- **Start** from **known** **contacts** (3–4 campuses) before scaling to **40+**.  
- **Pair** every campus ask with a **county** bench ask (P5, host, coordinator).  
- **Use** `POST /api/forms` + **`WorkflowIntake` metadata** (e.g. `source=campus`, `utm_*`) — SOP with forms/ops.  
- **Debrief** every table in Workbench: outcomes, follow-ups, **MCE/NDE** opportunities.

---

## 9. Campus event types

- Tabling, **listening** session, co-sponsored forum, service project, **house party** (off-campus or compliant venue), **visibility**, debate-watch, **GOTV** push (age-appropriate).

---

## 10. Student ambassador program (design)

- **Criteria:** **Application** or nomination; **training** complete; **code of conduct** signed.  
- **Scope:** Social content **templates**, on-campus **liaison** to V.C. and **county** — not unsupervised comms.  
- **No** public **“ambassador”** list with invented names in the repo.

---

## 11. Youth social media and content lane

- **Field Intelligence** and **Narrative Distribution** with **youth-appropriate** tone; **compliance** on disclaimers.  
- **Message Engine** may suggest **angles**; **human** approves.  
- **Guardrails** for **minors** in imagery and quotes (see `PAID_MEDIA` Pass 3E: paid support for real events only).

---

## 12. Campus endorsement / student leader quote lane (process)

- **Only** with **compliance** + comms + (as needed) **counsel** — same spirit as `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`.  
- **Student** quotes: **attributed** and **permitted**; **no** invented quotes in markdown.  
- **“Support** **statements**” are **not** **assumed** **endorsements** — language must be **sourced** and **approved**.

---

## 13. Campus-to-county team bridge

- **Routing:** Campus captain ↔ county coordinator ↔ regional field.  
- **P5** and **host** funnels: campus events feed **house party** pipeline in the **same** county (or adjacent, if logistics require).  
- **Precinct and canvass:** See `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md` (Pass 3E) — **student** **canvass** rules, **adults** for walk lists where required.

---

## 14. Campus dashboard requirements (future / manual spec)

- **Count** of campuses by **ladder** **stage**; **last visit**; **next** **scheduled** `CampaignEvent`.  
- **Funnel** YTD: `WorkflowIntake` with campus tags → active volunteers.  
- **Data quality:** % of rows with `needs research` **=** health metric (drive to zero **wrong**, not zero **unknown**).

---

## 15. Training modules (outline)

- SOS office **101** for students (nonpartisan process framing; **compliance** boundaries).  
- **Tabling** and event safety.  
- **Data** and **PII** **never** (default).  
- **How** to use **Pathway** **Guide** and **Workbench** (operator-led).

---

## 16. Risks and guardrails

- **Invented** “**campus** **teams**” in **public** or **OIS** without field truth.  
- **Minor** **safety** and **media** **consent** failures.  
- **Overpromising** **youth** **vote** **share** in **simulation** (keep **directional**).  
- **Exhausting** a **small** young volunteer pool — **redundancy** and **mentorship** (Part B.6 in strategy manual spirit).

---

## 17. Steve decision list

- **Complete** the **campus** **table** for Arkansas with **true** **status** labels; **3–4** **known** **strong** **sites** first.  
- **Priority** order of **campuses** for **Q2–Q3** **travel** (feeds `WEEKLY_TRAVEL...`).  
- **Policy** for **high** **school** **contact** and **chaperone** **rules**.  
- **Who** may **sign** off on **youth** **content** and **student** **quotes**.  
- **Framing** of **SOS** issues for **campus** (issue sheet — **no** **unsourced** **contrast**).  
- **Tie** to **`MANUAL_INFORMATION_REQUESTS` §21** (Pass 3E).

---

**Last updated:** 2026-04-27 (Pass 3E)
