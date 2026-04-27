# Manual — information requests (for Steve and senior builders)

**Purpose:** The **Campaign Operating System Manual** and **system map** are **constrained** until these **decisions and artifacts** exist. This list is **not** an accusation; it is a **dependency register** for Pass 3+. **Pass 3B** operating goals in manuals: $250,000 base by Aug 31, 2026; $500,000 stretch (unlock per `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` §3); 5,000 active volunteers (stretch) — **confirm** with treasurer / owner. **Pass 3C** adds Arkansas Press Association (APA) vendor / paid media (price sheet and scope pending). **Pass 3D** adds endorsement program, national attention strategy, and precinct / path-to-victory *operational* doctrine — **no** invented endorsers or precinct statistics in the repo; **strategic** counties without precinct-level data require acquisition before full path-to-victory **modeling** (see `PRECINCT_PATH_TO_VICTORY_AND_CANVASSING_PLAN.md`). **Pass 3E** adds youth/campus organizing, **NAACP** branch **relationships** (map-first), Extension Homemakers and **focus** **categories,** and **weekly** **travel** **/ **event** **projection** — no invented **active** **campus** **chapters,** **no** **NAACP** **branch** list until **verified,** no assumed **EHC/affinity** **support** (see `YOUTH_CAMPUS...`, `NAACP_...`, `FOCUS_CATEGORY...`, `WEEKLY_TRAVEL...`). **Pass 3G** adds **county** **/ **relational** **list** **policy,** **immersion,** **call** **time,** **faith** **+** **VFD** **+** **chamber,** **listening** **tour,** **visibility** **fundraising,** **proposed** **ambassador/commission,** **training,** **path**-**to**-**win** **data,** and **GCal** **/** `CampaignEvent` **—** **§**26**–**35** **(see** **Pass** **3G** **manuals** **in** `MANUAL_PASS_3G_COMPLETION_REPORT.md` **).** **Pass** **3H** **adds** **§**36** **(financial** **records,** **COH,** **fees,** **public** **claims** **—** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` **).** **Pass** **4** **adds** **§**37** **(role** **playbooks,** **training** **access,** **operator** **roster** **—** **see** **`playbooks/`** **).** **Pass** **4B** **adds** **§**38** **(interactive** **strategy** **dashboard,** **segmentation,** **device** **/ iPad** **—** see **`INTERACTIVE_STRATEGY_WORKBENCH_...`**, **`SEGMENTED_CAMPAIGN_TARGETING_...`**, **`IPAD_MOBILE_...`**, **`CANDIDATE_AND_CAMPAIGN_MANAGER_...`** **).** **Pass** **5** **adds** **§**39** **(operator** **SOP,** **WIP,** **SLA,** **weekly** **baseline,** **closeout) **. **Pass** **5C** **adds** **§**40** **(progressive** **unlocks,** **report** **/ **companion** **naming,** **training** **gates,** **badge** **ethics) **. **Pass** **5D** **adds** **§**41** **(election** **security** **sources,** **approved** **wording,** **FAQ** **review,** **website** **cleanup** **priorities,** **accomplishment** **feed** **rules,** **live**-**platform** **policy) **.**

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

## 26. Contact lists and warm Democrat follow-up (Pass 3G)

- **What** **(if** **anything)** the **campaign** **may** **request** of **county** **parties** **in** **writing** for **name/contact** **lists,** and **how** **consent** **+** **provenance** are **documented** (see `CONTACT_LIST_INTAKE_AND_RELATIONSHIP_DATABASE_PLAN.md` **+** `COUNTY_PARTY_AND_RURAL_ORGANIZING_PLAN.md` **Pass** **3G** **).**  
- **Boundary** between **lawful** **relational** / **“warm** **Democrat”** **recruitment** and **voter** **file** / **MCE** **work** **—** **one** **sentence** **owner** **policy** so **ops** do **not** **blur** **lanes**.  
- **Import** **compliance** **gate:** **who** **signs** before **any** **spreadsheet** **or** **CRM** **import** (treasurer/CM/counsel **as** **applies).

## 27. Immersion stops and local host system (Pass 3G)

- **Geography** **priority** **and** **cadence** **caps** for **immersion** **(how** **many** **/** **quarter,** **rural** **weight).**  
- **Host** **team** **minimums** and **MCE/NDE** **fit** **for** **Kelly**-present **vs** **surrogate** **stops** (see `IMMERSION_STOPS_AND_LOCAL_HOST_SYSTEM.md` **).**  
- **Failure** **mode** **(weather,** **low** **turnout) **—** **reschedule** **rule** **and** **comms** **owner**.

## 28. Call time and in-person/candidate asks (Pass 3G)

- **Private** **list** **handling** for **call-time** **(who** **may** **see** **names,** **retention) **+** **when** a **prospect** **moves** to **treasurer** **/** **compliance** **(see** `CALL_TIME_AND_CANDIDATE_FUNDRAISING_EXECUTION_PLAN.md` **).**  
- **Dollar** **/** **soft**-**commit** **logging** **SOP** **for** **candidate**-**led** **asks** **post**-**tour** **or** **post**-**event.**

## 29. Faith, VFD, chamber, and community event outreach (Pass 3G)

- **Which** **institutional** **lanes** are **in**-**scope** **for** **this** **cycle** (faith, VFD, chamber, **other) **+** **neutrality** / **optics** **red** **lines.**  
- **Who** **pre**-**clears** **invites** and **messaging** **at** **non**-**party** **venues** (see `FAITH_FIRE_CHAMBER_AND_COMMUNITY_EVENT_OUTREACH_PLAN.md` **).**

## 30. Community election integrity and ballot initiative listening (Pass 3G)

- **In**-**room** **scope** for **“listening** **tour**” **threads** **(security,** **transparency,** **initiatives) **+** **what** is **out**-**of**-**scope** **without** **counsel.**  
- **Routing** when **a** **local** **ballot** **question** **needs** **escalation** **(CM** **vs** **counsel)** **(see** `COMMUNITY_ELECTION_INTEGRITY_AND_BALLOT_INITIATIVE_LISTENING_TOUR.md` **).**

## 31. Postcards, signs, banners, and visibility fundraising (Pass 3G)

- **Vendors,** **treasurer** **rules,** **and** **in**-**kind** **/** **match** **for** **visibility** **bundles** (see `POSTCARDS_SIGNS_BANNERS_AND_VISIBILITY_FUNDRAISING_PLAN.md` **).**  
- **Statewide** **vs** **county**-**specific** **inventory** **priority** if **funds** are **tight**.

## 32. Grassroots fundraising ambassador/commission (Pass 3G) — *proposed only*

- **If** **this** **model** **is** **ever** **considered,** **binary** **owner** **go/no**-**go** **+** **treasurer** **+** **counsel** **before** **any** **public** **pilot** (see `GRASSROOTS_FUNDRAISING_AMBASSADOR_AND_COMMISSION_MODEL.md` **legal** **banner** **).**  
- **“No** **pilot**” **is** **a** **valid** **answer** **—** then **the** **manual** **stays** **hypothetical** **only.**

## 33. Training and trainer certification (Pass 3G)

- **Who** **certifies** **trainers,** **how** **often** **materials** **re**-**lock,** **and** **MCE/NDE** **coverage** in **curriculum** (see `TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md` **).**  
- **Threshold** for **in**-**person** **vs** **self**-**serve** **(Zoom** **/** **recorded** **).**

## 34. Political analysis and path-to-win data (Pass 3G)

- **What** **external** **data** the **campaign** **will** **license** or **use** **(no** **invented** **precinct** **totals) **+** **owner** of **reconciliation** to `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` **(see** `POLITICAL_ANALYSIS_AND_PATH_TO_WIN_DATA_MODEL.md` **).**  
- **Red** **lines** for **opposition** / **narrative** **in** the **“path** **to** **win”** **view** **(sourcing).**

## 35. Google Calendar and event pipeline (Pass 3G)

- **System** of **record** **(Google** **only,** **DB** **only,** or **hybrid) **+** **who** **edits** **what** and **OIS** **/** `CampaignEvent` **sync** **expectations** (see `GOOGLE_CALENDAR_AND_EVENT_PIPELINE_OPERATING_SYSTEM.md` **).**  
- **SLA** for **publishing** **/** **cancelling** **public** **events** **(minutes** **to** **site** **/** **comms** **).**

## 36. Financial records, fundraising progression, and budget calibration (Pass 3H)

- **Source** of **truth** for **inflows,** **outflows,** **and** **COH:** **Is** the **internal** **ledger** (`FinancialTransaction`) **100%** **complete** **for** **operational** **use,** **or** **must** **treasurer** **/ **bank** **/ **ActBlue-**style** **exports** **always** **win?** **Order** of **reconciliation** **(daily** **/ weekly).  
- **Categories** and `CostBearingWireKind` **mapping:** **required** **category** **labels** **for** **new** **rows;** **who** **may** **override** **defaults** in `src/lib/campaign-engine/budget.ts` **(future** **code** **—** **manual** **tags** **until** **then** **).**  
- **Refunds,** **chargebacks,** **pledges,** **in-kind,** **loans,** **unpaid** **obligations,** **and** **processing** **fees** **—** **where** **captured** **(ledger** **rows** **vs** **separate** **spreadsheets** **vs** **bank** **only** **).**  
- **Authoritative** **cash** **on** **hand** **number** **(date** **stamped) **+** **who** **may** **cite** it **(owner** **/ treasurer** **only** **in** **public** **contexts** **?** **).**  
- **Last** **three** **weeks** **fundraising** **acceleration** **—** **confirm** **magnitude** **and** **whether** **to** **model** as **a** **new** **regime** in **simulation** **(vs** **noise** **).**  
- **Vendor** **/ **payment** **platform** **fees** **(Stripe,** **ActBlue,** **etc.) **—** **as** **%** **or** **fixed,** **and** **ledger** **treatment** **(e.g.** **`processor_fee`** **category** **).**  
- **Travel** **reimbursements** **and** **unpaid** **volunteer** **/ **staff** **obligations** **—** **RACI** **and** **where** **recorded** **(before** **public** **“burn”** **charts** **).**  
- **Which** **aggregates** from **this** **system** may **appear** in **public**-**facing** **claims** **(if** **any** **) **—** **counsel** **+** **treasurer** **sign-off** **list** **(FEC** **/ **ethics** **/ **opposition** **rules** **).**

## 37. Role playbooks, training access, and operator roster (Pass 4)

- **Canonical** **public** **titles** **vs** **internal** **Workbench** **roles** **—** **where** **they** **may** **differ** **(county** **“leader”** **vs** **coordinator,** **etc.)** **and** **who** **may** **grant** **each** **badge** **(see** **`playbooks/ROLE_READINESS_MATRIX.md`** **).**  
- **Which** **roles** **receive** **PII** **/ **voter** **file** **views,** **exports,** **or** **bulk** **download** **—** **and** **minimum** **training** **module** **IDs** **before** **unlock** **(see** **`playbooks/TRAINING_MODULE_INDEX.md`** **+** **`ROLE_KPI_INDEX.md`** **).**  
- **Trainer** **/** **training** **director** **scope** **when** **no** **LMS** **exists** **—** **paper** **/** **call** **/** **in**-**person** **only** **vs** **Workbench** **tasks** **only** **(align** **`TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md`** **).**  
- **Operator** **/** **admin** **queue** **—** **who** **may** **approve** **WorkflowIntake** **or** **task** **types** **by** **category** **(see** **`playbooks/APPROVAL_AUTHORITY_MATRIX.md`**, **`ESCALATION_PATHS.md`** **).**  
- **Dashboard** **attachments** **—** **which** **KPI** **packs** **ship** **for** **which** **roles** **(see** **`playbooks/DASHBOARD_ATTACHMENT_RULES.md`** **).**  
- **Sideways** **/** **promotion** **narrative** **—** **what** **may** **be** **said** **publicly** **about** **“growth”** **without** **implying** **employment** **(see** **`playbooks/PROMOTION_AND_SIDEWAYS_PATHWAYS.md`** **).**

## 38. Interactive strategy dashboard, segmentation, and device policy (Pass 4B)

- **Who** may **propose,** **edit,** and **lock** **interactive** **strategy** **assumptions** and **scenarios** (sliders) on **candidate** and **CM** **surfaces,** and **who** may **only** **view** **previews** **(see** **`INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md`**, **`playbooks/APPROVAL_AUTHORITY_MATRIX.md`** **Pass** **4B** **rows) **.  
- **Who** may **approve** **a** **published** **scenario** as **this** **week’s** **operating** **baseline** (vs. **“draft** **/ preview**”) **.  
- **Whether** the **candidate** may **directly** **change** **assumptions** that **affect** **$**, **time**, or **GOTV**-**adjacent** **programs,** or **must** **request** **through** **CM/owner** **with** **LQA** **(treasurer,** **counsel,** **data) **.  
- **Which** **KPIs** are **“candidate**-**facing**” (time, **message** **load,** **rest)** **vs** “**CM**-**facing**” (**queue,** **stretch** **unlock,** **field** **thinness)** for **narrative** in **readiness** **strips** **(see** **`CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md`**, **`playbooks/ROLE_KPI_INDEX.md`** **4B) **.  
- **Preferred** **named** **scenario** **labels** (e.g. **Floor,** **Base,** **Momentum,** **Stretch,** custom list) **.  
- **Allowed** **segmentation** **categories** for **field** and **comms** **planning;** **explicitly** **prohibited** **categories;** **voter**-**file** and **paid**-**media** **audience** **policy;** **GOTV** **targeting** **policy** **(see** **`SEGMENTED_CAMPAIGN_TARGETING_AND_MESSAGE_STRATEGY_PLAN.md`**) **.  
- **iPad** **/ tablet** **budget** **(3**–**5** **devices),** **MDM,** **device** **assignment,** and **on**-**device** **export** / **data** **rules** **(see** **`IPAD_MOBILE_AND_DESKTOP_DASHBOARD_DESIGN_REQUIREMENTS.md`**) **.  
- **Dashboard** **access** **rules** for **projections**-**only** **users** (finance **viewer,** field **leads) ** vs **assumption** **editors;** **and** **whether** **mobile** may **propose** **vs** **read** **only** **(MI** **§**38 **+** **owner** **policy) **.  

## 39. Workbench, CM, and strategy SOPs — operational decisions (Pass 5)

- **CM** **daily** **operating** **authority** **vs** **owner** (what **can** **CM** **lock** in **a** day **vs** what **always** **requires** **O**+**M**+**T**+**C** **) **.  
- **WIP** **limits** per **role** and **pooled** **admin** (defaults in `WORKBENCH_OPERATOR_RUNBOOK.md` — **confirm**).  
- **SLA** for **P0,** P1, **&gt;**72h **intake** (replace TBD with numbers).  
- **Who** can name a **“Locked** **baseline”** for the operating week (M+O+T for $-**linked,** as policy).  
- **Candidate** **dashboard** **visibility** class (what is default-on) + read-only **vs** request-only on 4B levers (see §38).  
- **Final** recruit / persuade / GOTV **lane** **names** in MCE/NDE if **rebranding** is desired.  
- **Per**-**template** **TT-**01…** **ownership** (who** **picks** up** **a** **new** class** **of** work) and **naming** of **strategic** **task** **prefixes** (e.g. `STRATEGY-…`).  
- **Workbench** **intake** **and** `CampaignTask` **closeout** **—** when **a** week **is** not **shippable,** do **all** open **tickets** **get** a **deferred** **or** **declined** **line**? **(see** `WORKBENCH_…` **parking** **lot) **.  
- **Emergency** **escalation** **windows** (e.g. **E**D,** **press**),** **on**-**call** **rotation,** and **bypass** of **WIP** **(owner-only) **.  

## 40. Progressive onboarding, unlocks, and guided help — product policy (Pass 5C)

- **Default unlock model:** per-archetype level 0–5 (`ROLE_BASED_UNLOCK_LADDERS.md`) — which gates are M-module-driven, time-in-role, lead-signed, or CM/owner-only?  
- **Promotions / demotions:** Who may raise or lower readiness level after a compliance defect, and what is auditable (private coaching vs visible role strip)?  
- **Naming:** Guided Report Builder vs Workbench Report Assistant — choose the public name; no public “AI” product string (`GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md`).  
- **Reports:** What canned, guided, saved, and cross-system reports are in-scope for V.C., county, field, comms, NDE, CM, VFR, and analyst — and default row-count / PII minimization rules.  
- **Campaign Companion:** “What’s next?” entry — allowed suggestions (draft tasks, help) vs forbidden (auto money, auto comms, auto export, GOTV cut).  
- **Badges / milestones:** Which are on by default, opt-in, or off; ban any quest that incents PII mishandling, skipping LQA, or inflated reach (`USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`, `WORKBENCH_LEARNING_GAMEPLAY_MODEL.md`).  
- **Rural / low-bandwidth:** Defaults for grid vs summary in onboarding and reports (owner with comms/field).  
- **Sensitive unlocks:** Who approves unlock of VFR, public comms, treasurer $ confirm, 4B Propose→Lock, and GOTV-adjacent tools — must remain `APPROVAL_AUTHORITY_MATRIX` + human, not streaks or gamified “levels” (`PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md` §7).  

## 41. Election confidence, public trust, and live content (Pass 5D)

- **Primary source lock (SBEC, SOS):** Who maintains the approved **clip-file** and **excerpt** for the **2024** **General** **Election** **Final** **Post**-**Election** **Audit** **Report** (PDF, `sbec.arkansas.gov`) with **date** **retrieved** and **page** **refs** before any paid/static quote (`KELLY_PUBLIC_TRUST_TALKING_POINTS_AND_FAQ.md` §7).  
- **MIT** **EPI:** Approved **one**-**line** + link to the **current** [MIT Election Lab](https://electionlab.mit.edu/) **EPI** page; **forbid** using EPI **rank** as a **fraud** or **fraud**-**absence** **verdict** (`ELECTION_CONFIDENCE_...` §3, §6–7).  
- **Counsel** **+** **MCE:** **Sign**-**off** on any **“systemic** **/ **not** **systemic**” **fraud** wording in **static** **FAQ,** **ads,** and **emails** (no overclaim: **not** “**no** **fraud** **anywhere,** **ever**”).  
- **Website** **cleanup** **priorities:** **Hero** **service**-**SOS** **first**; **bounded** **trust** / **SOS** **/ **“**under** **the** **hood**” **slice**; **redundancy** **removal** order (`WEBSITE_CLEANUP_MOTION_AND_LIVE_PLATFORM_PLAN.md`).  
- **Accomplishment** **/ **“**live**” **feeds:** **R/Y/G** on **OIS** (seed **vs** live); no ghost public events; rules for **Workbench**-fed public cards (readiness + `WORKBENCH_OPERATOR_RUNBOOK.md`).  
- **Campaign** **Companion** **election** **Q&A:** **Escalation** to **CM/comms/press** for **legal,** **named** case, or **press**-**sensitive** **threads**; **no** **new** **unvetted** **numbers** in **auto**-**reply** (`CAMPAIGN_COMPANION_ELECTION_QUESTIONS_POLICY.md`).

---

**When** **this** **list** **is** **addressed:** **update** **`CAMPAIGN_STRATEGY_...` **§2–3,** §8–9,** §14–16,** **Part** **E,** **Part** **F,** **Part** **G,** **Part** **H,** **Part** **J** **(4B),** and §**22**–**23** **with** **Steve**-**approved** **numbers** and **policy** **phrasing;** **re**-**baseline** `SIMULATION_...` **§6,** §**21,** **§**22**–**26,** **4B** **§**26 **(sliders) **+** **cross**-**ref** `FINANCIAL_BASELINE_AND_BUDGET_CALIBRATION_PLAN.md` **and** **Pass** **3G,** **4B,** and **5** **runbooks** **as** **needed.** (Pass 3 v1 of strategy and simulation is in repo; **answers** replace **assumptions**.) **Operator SOP (Pass 5) + SLA (§39)** replace default TBDs in `WORKBENCH_OPERATOR_RUNBOOK.md` where Steve approves. **Pass 5C** unlock / companion / report policy (**§**40) refines `PROGRESSIVE_ONBOARDING_AND_UNLOCK_SYSTEM.md`, `USER_FRIENDLY_WORKBENCH_UX_REQUIREMENTS.md`, and `GUIDED_REPORT_BUILDER_AND_ASSISTED_QUERY_SYSTEM.md` where Steve approves. **Pass 5D** **§**41 **locks** **primary** **sources** and **MCE/NDE** **review** for `ELECTION_CONFIDENCE_...` **,** `KELLY_...` **,** `WEBSITE_...` **,** and `CAMPAIGN_COMPANION_...` **where** **Steve** **+** **counsel** **approve** **.

**Last** **updated:** **2026-04-28** **(Pass** **3** **+** **3B** **+** **3C** **+** **3D** **+** **3E** **+** **3F** **+** **3G** **+** **3H** **+** **4** **+** **4B** **+** **5** **+** **5C** **+** **5D**)
