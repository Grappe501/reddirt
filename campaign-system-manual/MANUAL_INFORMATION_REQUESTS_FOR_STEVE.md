# Manual — information requests (for Steve and senior builders)

**Purpose:** The **Campaign Operating System Manual** and **system map** are **constrained** until these **decisions and artifacts** exist. This list is **not** an accusation; it is a **dependency register** for Pass 3+. **Pass 3B** operating goals in manuals: $250,000 base by Aug 31, 2026; $500,000 stretch (unlock per `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3); 5,000 active volunteers (stretch) — **confirm** with treasurer / owner. **Pass 3C** adds Arkansas Press Association (APA) vendor / paid media (price sheet and scope pending). **Pass 3D** adds endorsement program, national attention strategy, and precinct / path-to-victory *operational* doctrine — **no** invented endorsers or precinct statistics in the repo; **strategic** counties without precinct-level data require acquisition before full path-to-victory **modeling** (see `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`). **Pass 3E** adds youth/campus organizing, **NAACP** branch **relationships** (map-first), Extension Homemakers and **focus** **categories,** and **weekly** **travel** **/ **event** **projection** — no invented **active** **campus** **chapters,** **no** **NAACP** **branch** list until **verified,** no assumed **EHC/affinity** **support** (see `YOUTH_CAMPUS...`, `NAACP_...`, `FOCUS_CATEGORY...`, `WEEKLY_TRAVEL...`).

**Rule:** None of the below should live in this repo with **secret** values, **uncounseled** legal claims, or **PII samples**.

---

## 1. Campaign philosophy and public narrative

- The **one-paragraph** non-negotiables for **Kelly** (service, security of elections, transparency, **etc.**) that **all** OIS, county, and comms must align to.  
- **Opposition** research **rules** (sourcing, what is in-bounds for staff vs public).  
- **Contrast** strategy boundaries (if any) — **compliance** sign-off.

## 2. Candidate preferences (governed, not in raw chat)

- **Verbal tics to avoid** / **phrases to prefer** (comms, not a model prompt dump).  
- **Top 5** policy **priorities** in **fixed order** for the SOS race.  
- **Geographic** emphasis (NWA, River Valley, **etc.**) for **resourcing** — not a voter microtarget.  
- **Schedule**: typical windows for public vs family / rest (operations planning).

## 3. Compliance and legal

- Jurisdiction for **ethics** / **finance**; **filing** calendar.  
- **Texting** and **email** program **rules** (opt-in, disclaimers) — which vendor, which counsel reviewed script.  
- **Ballot access** and **petition** rules if any **in-cycle** work touches them.

## 4. Role hierarchy and final titles

- **Canonical** list of **field** titles: county chair vs “county leader” language on site.  
- **When** a **regional** lead can override a **county** pick for turf (if ever).  
- **Owner** vs **CM** break-glass for **money** and **messaging** in the final 10 days.

## 5. Approval thresholds

- **Dollar** threshold for **CM** vs **owner** (internal).  
- **What** can ship from **comms** without **candidate** read (if anything).  
- **Crisis** comms: who approves, max minutes to respond, **backchannel** list.

## 6. Data access rules (written policy, not just Prisma)

- **Who** may see **VoterRecord** row-level, **for how long**, **logging** of exports.  
- **When** a volunteer may see **name**+**address** (if ever) vs **list number**-only.  
- **Relational** note retention and **deletion** on volunteer exit.

## 7. Region / county structure

- **Eight** OIS **region** slugs are fixed in code; confirm **display names** match stakeholder language everywhere.  
- **Pilot** counties after Pope: **Benton** / **Washington** order and **success** criteria.  
- **FIPS** / slug conventions for links (`pope` vs `pope-county`) — one **canonical** rule for staff.

## 8. Election calendar and GOTV

- **Early vote** start/end (statewide + any nuance), **ED** date, **key** mail dates.  
- **GOTV** definition of “contact attempt” in reports (don’t conflate dials and doors without saying so).

## 9. Sign holder and visibility

- **Minimum** **visibility** program for **win** definition (or explicit “this is not a hard KPI”).  
- **Local** **ordinance** handling — who owns research by county.

## 10. Voter file

- **Source** (state party, comm vendor, **etc.**) and **as-of** dates.  
- **Match** policy for `User` ↔ `VoterRecord` (admin-assisted) — when is **auto-match** disallowed.  
- **NCOA** and **dead** voter handling if applicable.

## 11. County leader expectations (written job description)

- **Time** per week, **escalation** to regional, **tabling** and **P5** **minimums** (if any).  
- **What** the campaign **will not** ask them to do (PII, etc.).

## 12. Volunteer pledge and expectations

- **Code of conduct** and **dismissal** path for harassment or bad data handling.

## 13. Campaign manager operating authority

- **Hire/fire** of vendors (owner only vs CM).  
- **Spending** cap before owner touch.  
- **Public** “voice” in crisis — **candidate**-only or **comms**-with-approval.

## 14. Message approval rules (non-legal layer)

- **Message engine** / **Narrative distribution** who owns **narrative wave** IDs.  
- **Field**-originated **local story** path to public — **RACI**.

## 15. Crisis and rapid response

- **Who** on **call**; **backups**; **press** + **legal** in same loop.  
- **Rapid** response in **admin** (existing social/Workbench tools) — **naming** the **SOP** not the password.

## 16. Finance and compliance guardrails (high level)

- **Card** use policy, **reimbursement** timeline, **treasurer** interface with `FinancialTransaction` **status**.

## 17. Public vs internal language

- **Map** of internal terms → **Pathway Guide** / **Field Intelligence** (never **“AI”** in public for the guided system).

## 18. Arkansas Press Association and paid media (Pass 3C)

- **Arkansas** **Press** **Association** (or successor) **price** **sheet** **and** **line-item** **scope** (social, digital, radio, TV, paper, paid press releases). (Pending — do not invent in the manual.)  
- **Overall** **paid** **media** **budget** **ceiling** **(monthly** **and** **through** **General) **— **tied** **to** **$250K** **base** **/ **$500K** **stretch** **unlock** **(see** `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` **§3).**  
- **Paid** **social** **ramp** **budget** **(banded** **test** **→** **scale) **.  
- **Channels** **authorized** **in** **writing** **(which** **media** **types** **the** **campaign** **will** **use) **.  
- **Who** **approves** **which** **paid** **buys** **(dollar** **rungs** **for** **CM,** **owner,** **treasurer) **.  
- **Compliance** **/ **disclaimer** **package** **per** **medium** **(counsel) **.  
- **Landing** **page** **and** **form** **source**-**tagging** **requirements** **(UTM,** `WorkflowIntake` **metadata) **.  
- **Retargeting** / list-match policy — if permitted, authored by counsel + data lead; if not, explicit “not used in this cycle.” (Do not assume unauthorized targeting in SOPs.)  
- **2028** **/ **2030** **expectations** **for** **candidate** **pipeline** **(opt**-**in,** **ethics) **; **public** **framing** **vs** **internal** **bench** **(no** **false** **certainty) **.  
- **Definition** **of** **“**full** **community** **team**” **for** **internal** **/ **OIS** **(see** `PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` **§11).**  
- **List** **of** **target** **offices** **/ **seats** **(2028,** **2030) **— **if** **/ **when** **available** **(not** **PII,** **not** **unsourced** **opponent** **claims) **. **. **(Optional** **long**-**horizon;** **file** **may** **live** **outside** **this** **repo** **at** **owner** **discretion.)**

## 19. Endorsement program and national attention (Pass 3D)

- **Category** **lanes** **for** **endorsement** **outreach** (e.g. elected, labor, faith, civic) — **governed in writing;** do **not** place real names in this repo until approved (SOP; not a public endorser list in markdown).  
- **Single** **RACI** **owner** for the endorsement **ask packet** (template + compliance + comms + counsel as needed); RACI for MCE, NDE, county, and finance. See `ENDORSEMENT_AND_NATIONAL_ATTENTION_PROGRAM.md`.  
- **Threshold** for what counts as “major” enough to trigger **paid** press or **paid** social (Part C + §18); no invented endorsements in copy.  
- **National attention:** **earned** vs (optional) **paid** boundaries; how national moments hand off to V.C., county, P5, and Workbench (UTM + `WorkflowIntake` metadata SOP). National visibility does **not** replace county-first labor and GOTV.  
- **Endorsement → dollars and volunteers:** **directional** lift bands, ladder and host hooks — re-align with `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` and simulation after Steve / CM / treasurer; no false certainty in public copy.  
- **Surrogates** / speakers and endorser use (events, town halls): scheduling, compliance. Optional long list of real endorsers may live **outside** this repo in a governed store.  

## 20. Precinct data, field path, and canvass readiness (Pass 3D)

- **Strategic** county and regional **priority** list for field (operational, human — not a voter-file dump in chat); confirms county-first doctrine in `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`.  
- **Per** each priority strategic county: **status** of precinct-level data (exists / acquiring / TBD). Do not claim full modeling where data is incomplete. **Flag (manuals):** *Precinct data acquisition required before full path-to-victory modeling* — see `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §21.  
- **Turf,** `FieldUnit`, `FieldAssignment`, and walk-list policy (who may see name+address, with §6); **written SOP,** not inferred from schema alone.  
- **Path-to-victory** language: **operational** (capacity, coverage, GOTV readiness), **not** a prediction or warranty; Steve / field / data sign-off on `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` text.  
- **Canvass capacity** (bodies, shifts, weeks out) aligned with no-hired-staff 3B model; where short, **document the gap,** not a made-up number.  
- **Election** **result** and history **lineage** the campaign may use for honest **scenario** modeling: sourcing, no invented precinct splits; public claims still need compliance and narrative check.  

## 21. Youth, campus, and student organizing (Pass 3E)

- **Current** campus **contacts** (which institutions, which individuals) — rosters **off**-**repo;** not in this file.  
- **Which** campuses are **active,** **contact**-**only,** **target,** **unknown,** or **needs** **research** (truth for OIS and youth plan).  
- **Q2–Q3** **target** order for campus travel (feeds `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md`).  
- **High** **school** and **youth** **engagement** rules: district, **parent**/**guardian,** chaperone, and school policy.  
- **Student** **safety** and **data** rules: who may contact students; **VoterRecord** for students (if ever); youth **content** and **youth** **leadership** **titles** in public copy.  
- **Campus** **issue** **framing** for SOS (one-pager, compliance).  

## 22. NAACP branch relationship plan (Pass 3E)

- **Verified** **or** **Steve**-**authoritative** **branch** list and **points** of **contact** (off-repo). If unmapped, authorize **NAACP** **branch** **mapping** **sprint** and **name** the **owner**.  
- **Priority** order for branch visits; **relationship** **owner** and **steward** (primary + backup).  
- **What** may be **asked** in the **first** **30** **days** **vs** **later;** what is **off**-**limits** (not endorsement on day one).  
- **Joint** **civic** **education** **ideas** (forums, panels) — with compliance.  
- **Sensitive** **/ **private** **relationships** — how marked in **off**-**repo** **CRM;** no PII in this repo.  

## 23. Extension Homemakers and focus categories (Pass 3E)

- **EHC** and **other** **focus** **categories:** outreach-only, listening-first, or formal partnership lane? (Steve + CM)  
- **Counties** with **pre**-**existing** EHC or **civic** **community** **ties** the **owner** can name.  
- **Other** **focus** **categories** to **prioritize** (veterans, faith, small business) beyond **Pass** **3E** **defaults**.  
- **Message** **boundaries** by category (no paternalism, no monolith tropes for EHC).  
- **Off**-**limits** or **sensitive** **groups** for this cycle.  

## 24. Calendar, statewide events, and travel projection (Pass 3E)

- **Source** of **calendar** of **record** (Google, `CampaignEvent` in DB only, or hybrid) and reconciliation SOP.  
- **Places** **already** **visited** — reconcile external list, `CountyCampaignStats.campaignVisits`, and **past** `CampaignEvent` rows (owner).  
- **Statewide** / **festival** / **target** **event** list: `ArkansasFestivalIngest` plus any spreadsheets **not** in ingest (completeness).  
- **Priority** **counties,** **campuses,** **NAACP** **branches** for **0–12** **weeks** (rolling).  
- **House** **party** **leads** by geography.  
- **Travel** **budget** **cap;** **weekly** **miles** **/** **nights** **limit;** **receipts** and **`FinancialTransaction`** **policy** (treasurer).  
- **Who** **approves** **schedule** **changes** and **cancellations** (CM/owner).  

## 25. County party meetings, rural priority, and meeting tour (Pass 3F)

- **75-county** **(Democratic)** **party** **meeting** **schedules:** **source** of **truth** per **county** (public **notice,** **party** **page,** **chair** **contact** **—** **not** **guessed**); **who** **owns** **the** **mapping** **sprint** **and** **LQA** **backup.**  
- **Rural** **priority** **list** **or** **weighting** **for** **weekly** **travel** **and** **tour** **scoring** **(align** **with** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` **§3–5,** `WEEKLY_TRAVEL_AND_EVENT_PROJECTION_SYSTEM.md` **§22).**  
- **State** **Democratic** **Party** **vs** **county** **relationship** **RACI** **(what** **the** **campaign** **may** **claim** **publicly** **vs** **what** **is** **true** **on** **the** **ground) **—** **no** **overstated** **formal** **state** **support** **for** **SOS** **(per** **strategy** **Part** **F).**  
- **Surrogate** **/** **volunteer** **presenter** **at** **county** **party** **meetings:** **who** **may** **approve,** **MCE/NDE** **fit,** **and** **local** **optics** **norms** **(see** `COUNTY_PARTY_MEETING_TOUR_SYSTEM.md` **§14–15).**  
- **Donation** **/** **ask** **boundaries** **at** **party** **meetings** **(treasurer,** **neutral** **venue** **rules,** **disclaimers) **—** **same** **lane** **as** **other** **in-person** **asks.**  
- **Urgent** **counties** **for** **first** **90** **days** **of** **tour** **(if** **any)** **or** **explicit** **“no** **priority** **list** **yet**.”**

---

**When this list is addressed:** update **`CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`** §2–3, §8–9, §14–16, **Parts** **E** **+** **F,** and §**22**–**23** with **Steve-approved** numbers and **policy** phrasing; **re**‑baseline `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` §6, §21, §**22,** and §**23** (3E/3F). (Pass 3 v1 of the strategy tome and simulation plan is **in** repo as of 2026-04-27; answers **replace** assumptions.)

**Last updated:** 2026-04-27 (Pass 3 + 3B + 3C + 3D + **3E** + **3F**)
