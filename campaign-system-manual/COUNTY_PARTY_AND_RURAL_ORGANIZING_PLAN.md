# County party integration, rural Arkansas priority, and organizing plan (Pass 3F)

**Lane:** `RedDirt/campaign-system-manual` · **Markdown only** · **2026-04-27**  
**Public language:** **Campaign Companion**, **Guided Campaign System**, **Organizing Guide**, **Field Intelligence**, **Message Engine**, **Campaign Operating System**, **Workbench**, **Pathway Guide** — not “AI” as a public product name.

**Honesty rules:** Do not invent county Democratic party **meeting dates**, **chairs**, or **relationships**. Do not assume formal **state Democratic Party** statewide campaign support for the SOS race; county parties may still be **active** with volunteers and dollars (Steve). Treat county parties as **relationship partners**, not assumed endorsers or turnout guarantees. If 75-county meeting schedules are not yet in the system, the system action is: **county party meeting mapping required** (SOP + named owner + verification rules; no fake rows in the repo).

**Repo (Pass 3F):** There is no dedicated `CountyParty` or first-class “party meeting” **Prisma** model. Use `CampaignEvent`, `WorkflowIntake`, `CampaignTask`, and **governed off-repo rosters** for sensitive contact data (see `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`).

**Repo note (content):** `src/content/events/index.ts` includes user-designated example items (e.g. **Democratic Party**-associated and county **meeting**-style entries) — **verify** before treating as public campaign truth. Do not import PII or unverified schedules into this manual.

---

## 1. Executive summary

- **County (Democratic) parties** are existing **local** political **infrastructure** in Arkansas: a **pathway** to recruits, local knowledge, and — where **true** — practical help with **volunteers and dollars** at the county level (per Steve: state **formal** support not assumed; county help may be real).  
- **Rural Arkansas** is a **critical** priority, not a side trip (§3).  
- **County party meetings** (once **mapped**) are **repeatable, predictable** organizing opportunities. They can feed **volunteer recruitment, fundraising, events, Power of 5, county coordinator prospects, and GOTV infrastructure** when **follow-up** exists.  
- **Meetings** are not **endorsements.** Neutrality, local norms, and compliance apply — RACI in `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§25**.  
- The **operating system** (manuals + SOP) must **map** all 75 counties’ **meeting realities** (or document **unknowns**) and support a **statewide meeting tour** (see `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md`).

---

## 2. Strategic doctrine

| Doctrine | Meaning |
|----------|--------|
| **Recruitment channel** | Pathway, V.C., and P5 — not a substitute for **independent SOS messaging** where law/compliance require separation (Steve). |
| **Financial channel** | Donations, asks, **house party** hosts, recurring — all under **treasurer / counsel** rules (§9). |
| **Volunteer channel** | Local leaders, captains, visibility — with **consent**; no VoterFile to unauthorized volunteers. |
| **Local knowledge** | Fairs, county clerk context, **precinct** quirks, local press — **Field Intelligence** (ethical, no PII in chat). |
| **Rural access** | Often the most **practical recurring** face time in **low population density** — **once** the meeting is mapped and the relationship is **credible**. |
| **2028/2030 pipeline** | **Opt-in** identification of future local **candidates** and organizers — not a public claim of a “bench” that does not exist. |
| **Relationship first, ask second** | Listen; **map** local dynamics; **avoid** **factional** blunders (§17). |
| **Every visit leaves follow-up** | Debrief, `WorkflowIntake`, and **48–72h** follow-up. **Applause only** = failed stop. |

**State Democratic Party:** Use as a **pathway** per Steve. Do **not** overstate what formal **state** support the SOS campaign **receives**; document **RACI** internally (Part F in the strategy manual).

---

## 3. Rural Arkansas priority — *Rural Arkansas is not a side trip*

- **Rural counties** belong in the **core travel algorithm** and weekly projection scores (Pass 3F updates to `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` — **rural weighting** and county-party inputs).  
- **Rural voters** should not only hear from the campaign in **GOTV** season — use **earned, local, repeated** touches where governed (local paper, radio, events, county meetings when mapped).  
- **Rural county parties** can be the strongest **recurring** entry point in low-density areas **when** meetings are mapped and relationships are **credible** — not a universal law (pair with **EHC, NAACP, campus, faith** as in other Pass 3E **plans**; do not “replace” other lanes).  
- **Rural stops** should **pair** on one vector where logistics allow: **county party meeting** (on schedule) + **Extension/Homemakers**, **local paper or radio touch**, **civic** touch, **community college** where present, **NAACP** where mapped, **house party** recruitment.  
- **Rural outreach** must be **respectful, practical, and locally grounded** — no **tokenism**, no poverty tourism, no “educate the rurals” **framing** (§10).  
- **Every** rural visit produces **named next actions** in **Workbench** (owner, date, **county activation ladder** move).

---

## 4. County party meeting mapping system

If **meeting** cadence for all 75 counties is **not** in the app or a **Steve-blessed** spreadsheet, **run** the system action: **county party meeting mapping required** (sprint + owner + deadline + **sources of truth** for each row — public notices, party pages where applicable, **introduction** to **chair** — not guessing).

**One row per Arkansas county. Columns:**

| Column | Content |
|--------|---------|
| **County** | Name; FIPS / slug (campaign convention) |
| **Region** | OIS **region** (8) when set |
| **County party name** | As locally used; **verify**; **no PII in repo** |
| **Meeting cadence** | e.g. second Monday monthly; **TBD** if unknown |
| **Meeting day/time** | **TBD** if unknown — **never** invent |
| **Location or format** | In-person, hybrid, rotating, virtual; **TBD** |
| **Public vs private** | Open vs members-only; **local** norms + Steve §25 |
| **Chair/contact known?** | Yes / no / TBD; **details off-repo** |
| **Relationship owner** | Campaign **role** + **backup** (LQA) |
| **Last contact; last attended; next meeting date** | As known — **never** fabricate |
| **Travel priority** | 1–5 or banded (Steve/CM) |
| **Rural priority flag** | Y/N; definition via Steve §25 |
| **Fundraising; volunteer; CC; host; GOTV opportunity** | Planning tags, not **promises** |
| **Data confidence** | Low / med / high |
| **Next action** | **Workbench** task with due date |

**Status labels (align to §5 ladder):** unknown · meeting schedule mapped · contact identified · intro requested · meeting attended · follow-up completed · local volunteer recruited · county coordinator identified · event scheduled · ongoing relationship active.

---

## 5. County party visit ladder (0–11)

| Stage | Name | Required action (summary) | Owner (typical) | Workbench (examples) | KPI (directional) | Next trigger | Training / manual |
|----:|------|-----------------------------|-----------------|------------------------|------------------|--------------|-------------------|
| 0 | Unknown / not mapped | Mapping sprint; identify **source of truth** | Field + CM | **Research** task with deadline | Counties moved to 1+ | **Schedule** or **contact** verified | Mapping SOP |
| 1 | Meeting schedule identified | Confirm **cadence** and **next** **date** (no fake dates) | Relationship steward | `CampaignEvent` **draft** or **hold** | % rows with next date | **Point of contact** | Local-comms brief |
| 2 | Relationship contact identified | Intro call; **listen** | Steward | **Task** + off-repo call log | **Intro** **held** | **Ask to attend/speak** | Rural **message** (§10) |
| 3 | Intro or speaking request sent | **Written** ask; **compliance** if sensitive | Steward + CM | **Approval** task if needed | **Response** received | On **agenda** | MCE/NDE if public |
| 4 | Meeting attended | Debrief; **sign-ups**; **materials** | **Candidate/surrogate** + V.C. | `CampaignEvent` **completed**; intakes | Sign-ups, **$** (treasurer), CC prospects | **48–72h** follow-up **start**d | `COUNTY_PARTY_MEETING_TOUR_SYSTEM` run-of-show |
| 5 | Follow-up completed | Thank-yous; **assign** leads | V.C. | **Tasks** **closed** | % follow-up in **72h** | **Named** volunteers | Pathway SOP |
| 6 | Local volunteers recruited | Onboarding; **P1** path | V.C. / P5 | **Hub** joins, tasks | **Active** (SOP **14/30d**) | **Deputy** or **role** name | P5 plan |
| 7 | County coordinator or **deputy** identified | **OIS** / county **ladder** update | Field / regional | **Coordinator** task pack | Ladder 3+ (county) | **P5** or **host** | County onboarding |
| 8 | House party / event scheduled | `CampaignEvent` + host | **Host** captain | Event **pipeline** | $ / RSVPs (treasurer) | **GOTV** **prep** | 3B **flywheel** |
| 9 | P5 or **county** team active | OIS **truth** | P5 + regional | **Tasks** | **#** P5 teams, rotation | **Visibility** or **GOTV** | P5 + **field** |
| 10 | GOTV / visibility **infra** | Sign program, plan, **compliance** | GOTV + **compliance** | GOTV **queue** | Internal **readiness** | **Steward** for **sustain** | GOTV manual |
| 11 | Ongoing relationship **steward** | **90d** **touch**; not transactional | Steward + **regional** | **Recurring** check-ins | **Relationship** **freshness** | **Post**-**election** handoff (opt-in) | Closeout (future) |

Use **lowest qualified approver** and **LQA** (strategy manual **§9**) so no single person holds every county relationship.

---

## 6. Every-county meeting tour plan (design)

- **Map 75** in a timeboxed sprint (2–4 weeks) with parallel research and per-county **verify** (no invented dates).  
- **Prioritize** first visits: rural + strategic (Steve) + **warm** contacts + **geographically** hard-to-reach stops — do **not** only hit **easy** counties.  
- **Combine** on one trip when miles allow: EHC, fairs, campus, NAACP, **house** **party** recruitment (see `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` **pairing** rules).  
- **Revisit** priority counties on a **schedule**; re-score in weekly **projection**.  
- **Avoid** burnout: `WEEKLY_...` **redundancy** + strategy **Part** B.6.  
- **Virtual** appearances when **driving** cost exceeds value — only with local agreement; rural **often** **requires** **in-person** relationship **credibility**.  
- **Surrogate** or **volunteer** **presenter** when the candidate **cannot** attend — `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` **§**14–15.  
- **Each** **attendance** **must** **spawn** 72h follow-up (tour **§**9).

## 7. County party meeting playbook

- **Pre:** verify **agenda** and **time**; confirm **ask** **window**; **MCE/NDE** and **compliance**; **UTM** (e.g. `county_party`, `county={slug}`) on forms.  
- **Attendees:** **candidate** or **surrogate** + V.C. + **at most** one **field** **backup** (avoid a **crowd** that **distracts**).  
- **Materials:** sign-up, **palm** cards, one-page **SOS** **(compliance)**, **donation** path per **treasurer** rules.  
- **Sign** **up,** **donor,** **host,** **P5,** **CC** **ask** with **listening** **first** (§2).  
- **Local** **press:** **RACI**; **no** **unsourced** **contrast** (strategy **§**16).  
- **Follow**-**up and next** **meeting** on **calendar** in **48–72h** (§11; tour **doc**).  

## 8. Recruitment at county party meetings (design)

Route leads to V.C. and field (never invent names): volunteer signup; **deputy** coordinator; **county** coordinator; sign holder captain; GOTV captain; **house** party host; donor prospect (treasurer); future local candidate (**opt-in**); Power of 5 starter. Align to **county activation ladder 0–9** (`FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`) and **5,000 active** stretch as **internal** scenario only.

## 9. Fundraising (boundaries and design)

- **Asks:** recurring, **house** party, in-county “challenge” (lightweight, **internal** fun) — all under **treasurer** + **compliance** with `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **§3** (base $250K; stretch $500K only when **unlock** rule is met).  
- **Pass-the-hat,** cash, check, card, and in-room asks: **requires** written **treasurer/counsel** policy — this manual does **not** set rules.  
- **No** public claim that a meeting “will” raise $X without treasurer sign-off.

## 10. Rural communications and message lane

- **Listening** prompts: what works / what hurts locally for **election administration** and access (factual; compliance on contrast).  
- **Substance:** transparency and accountability; county **clerk** / **access** (jurisdiction-true); **local** trust; **ballot** access / direct democracy; **working-class** and **family** economy — without stereotyping.  
- **Avoid:** condescension, **urban-default** messaging, **token** photo-ops.  
- **Collect** **Field Intelligence** ethically (no PII in chat); feed **Message Engine** only through **approved** channels.

## 11. County party → Workbench workflow

**Flow:** meeting **identified** → `CampaignEvent` or **task** → **prep** tasks → **attend** → sign-up / `WorkflowIntake` → assign V.C., county, **fundraising**, event, GOTV → **update** county **ladder** and **rural** **flags**.  

**Source tags (SOP):** e.g. `source=county_party`, `place_type=county_party`, `county_slug=…`, UTM `county_party_meeting` — not a **code** change in Pass 3F. **Follow-up** **48–72h** mandatory. **Hygiene:** one **truth** source per row; no **double-count** of the same **stop**.

## 12. Dashboard requirements (spec)

Panels: **75-county** mapping **%** complete; **upcoming** county party meetings; **ladder** by county; **rural** priority counties; **rural** visits completed; **follow-up** completion **%** in 72h; volunteers and **$** attributed (with **source** hygiene); **house** parties from county parties; **CC** prospects; **GOTV** readiness; **precinct** acquisition **flags**; **relationship** **freshness** (days since touch).

## 13. Integration with weekly travel projection

See **`WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`** (Pass 3F addendum): county party **meeting** **soon**, **rural** **weight**, **pairing** rules, **follow-up** as **required** **output**, **75-county** map as **input**.

## 14. Integration with fundraising acceleration

County party meetings feed **house** parties, **donor** follow-up, **recurring**, and **county** **challenge** energy — still **governed** by **base** pace and **treasurer** truth. They can help **reach** the **$250K** base; **$500K** stretch only if **actual** receipts support the **unlock** rule.

## 15. Integration with volunteer acceleration and Power of 5

County parties help turn **cold** statewide interest into **local** teams; members can start **Power of 1** or **P5**; they can surface **coordinators**, **deputies**, and **captains**. **Do not** burn out **existing** county party volunteers — **redundancy** and **gratitude** (strategy **Part** B.6).

## 16. Integration with 2028/2030 infrastructure doctrine

County parties are **natural** partners for **long-horizon** community **infrastructure** (aspirational **uncontested-seat** north star — not a guarantee). **2026** tour should **note** future **candidates**, **managers**, **treasurers** (**opt-in**); **maintain** relationships **after** Election Day where **appropriate**; meeting **records** stay in **governed** stores (not **PII** in **this** repo).

## 17. Risks and guardrails

Assuming **support**; **alienating** chairs; **overpromising** **state** party **coordination**; **rural** **tokenism**; **travel** **burnout**; **stale** schedules; **no** follow-up after **speaking**; **finance** mistakes; **public/private** confusion; **overcommitment** of volunteers; **local** **faction** **drama**. **Escalate** to CM/owner per **tour** doc.

## 18. Steve decision list

See **`MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` §25** (Pass 3F) **and** **§26–35** (Pass 3G **—** contact lists, immersion, call time, tour handoffs): contacts, schedules, chairs, sensitivities, rural priority, personal vs surrogate attendance, fundraising at meetings, neutrality/endorsement, CRM later, public appearance rules, rural message boundaries.

## Pass 3G — County party contact lists, warm Democrats, call time, immersion

- **Contact** **list** **request** **workflow** **—** `CONTACT_LIST_INTAKE_AND_RELATIONSHIP_DATABASE_PLAN.md` **(consent,** **provenance,** **counsel** **—** **no** **import** **without** **sign-off).**  
- **Warm** **Democrat** **follow-up** **—** **recruitment** **/ host** **asks** **with** **MCE/NDE** **—** **not** **a** **substitute** **for** **lawful** **voter** **file** **use.**  
- **Meeting** **→** **call-time** **list** **—** hand **to** `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md` **after** **debrief** **(private** **lists** **only).**  
- **Meeting** **→** **immersion** **planning** **—** `IMMERSION_STOPS_AND_LOCAL_HOST_SYSTEM.md` **pairs** **stops** **with** **host** **teams** **and** **calendar** **SOP.**

**Last updated:** 2026-04-28 (Pass 3F + **3G**)