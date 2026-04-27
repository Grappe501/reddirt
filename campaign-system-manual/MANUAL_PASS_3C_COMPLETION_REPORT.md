# Manual Pass 3C — completion report

**Lane:** `H:\SOSWebsite\RedDirt` · **Markdown / manual only** · **2026-04-27**  
**Pass name:** *Manual Pass 3C — Paid Media Ramp, Arkansas Press Association Vendor Channel, and 2028/2030 Infrastructure Doctrine*  
**Constraints:** No app code; no DB, auth, migrations, dependencies, or production settings; no commit.

---

## Files read (per mission brief)

`FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md`, `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `MANUAL_PASS_3B_COMPLETION_REPORT.md`, `MANUAL_BUILD_PLAN.md`, `MANUAL_TABLE_OF_CONTENTS.md`, `WORKFLOW_INDEX.md`, `SYSTEM_READINESS_REPORT.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` — plus **targeted** repo awareness from **Pass** **3B** **(Prisma** **`CampaignEvent`,** **`FinancialTransaction`,** **comms** **/ **NDE** **docs)** **without** **changing** **code.**

---

## Files created

| File | Purpose |
|------|---------|
| `campaign-system-manual/PAID_MEDIA_AND_LONG_TERM_INFRASTRUCTURE_PLAN.md` | Standalone manual chapter: executive summary; **APA** **vendor** **channel** **(price** **sheet** **pending);** **7** **paid** **phases;** **paid** **social** **ramp;** **radio/paper/TV/PR;** **governance;** **KPI** **dashboard** **spec;** **paid** **→** **form** **→** **`/api/forms` **→** **`WorkflowIntake` **→** **Workbench** **flow;** **2026** **as** **infrastructure** **election;** **2028/2030** **pipeline** **and** **uncontested-seat** **north** **star** **(aspirational);** **community** **team** **model;** **integration** **with** **grassroots** |
| `campaign-system-manual/MANUAL_PASS_3C_COMPLETION_REPORT.md` | This **file** |

---

## Files updated

| File | Change |
|------|--------|
| `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` | **§20** **Pass** **3C** **extensions** **(paid** **spend,** **APA** **placeholder,** **channel** **ROI** **ranges,** **cost** **per** **signup** **/** **active** **/** **donor** **/** **RSVP,** **paid-to-active,** **county** **team,** **2028/2030** **carryover,** **pipeline,** **uncontested** **coverage** **—** **all** **directional) **|
| `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` | **Pass** **3C** **section** **: **APA,** **paid** **social,** **ladder,** **vol** **recruitment,** **fundraising** **pace** **governance** |
| `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` | **§14,** **§16** **(paid** **media** **+** **infrastructure** **doctrine);** **§22** **risks;** **Part** **C** **summary;** **§23** **Steve** **list** **+** **§1–18** **pointer** **for** **requests** **file** |
| `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` | **§18** **APA** **and** **paid** **media** **(price** **sheet,** **budgets,** **approvals,** **tagging,** **compliance,** **retargeting** **policy,** **2028/2030,** **community** **team** **def,** **seat** **list) **|
| `MANUAL_BUILD_PLAN.md` | **Pass** **3C** **recorded;** **Pass** **4** **priority** **order** **updated** **(see** **below) **|
| `MANUAL_TABLE_OF_CONTENTS.md` | **Pass** **3C** **+** **appendix** **entries** |
| `WORKFLOW_INDEX.md` | **Pass** **3C** **cross-link** |
| `SYSTEM_READINESS_REPORT.md` | **Pass** **3C** **documentation** **note** |

---

## APA / vendor channel design (summary)

- **Planned** **relationship** **with** **Arkansas** **Press** **Association** **as** **a** **vendor** **/** **channel** **partner** **for** **social** **buys,** **digital,** **local** **radio,** **local** **TV** **(if** **budget),** **local** **paper,** **paid** **press** **releases** **—** **Steve** **to** **provide** **price** **sheet;** **this** **pass** **does** **not** **invent** **rates**. **All** **spend** **through** **finance** **+** **compliance;** **creative** **tied** **to** **Message** **Engine** **and** **Narrative** **Distribution.**

## Paid social ramp design (summary)

- **Test** **→** **scale;** **weekly** **review;** **UTM** **/ **source** **tags;** **no** **unauthorized** **targeting** **assumptions;** **retargeting** **only** **if** **written** **policy** **exists.**

## Paid media governance (summary)

- **RACI** **: **candidate/owner** **(narrative),** **compliance** **(paid/regulated),** **finance** **(spend),** **message** **lead** **(MCE/NDE** **fit),** **data** **(targeting) **, **county** **(local** **fact** **check** **only).**

## Dashboard requirements (summary)

- **Spend** **by** **channel** **/** **geography;** **funnel** **KPIs;** **cost** **per** **signup,** **active,** **donor,** **attendee;** **follow**‑**up** **completion** **on** **paid**-**sourced** **intakes;** **earned** **media** **qualitative** **—** **see** **chapter** **§7.**

## Workbench workflow (summary)

- **paid** **→** **tagged** **landing** **/** **form** **→** **`POST` `/api/forms` **→** **`WorkflowIntake` **→** **Workbench** **→** **V.C. **+ **county** **(as** **in** **chapter** **§8) **. **(Product** **tags** **=** **SOP** **;** **no** **code** **in** **Pass** **3C.)** **

## 2028/2030 infrastructure doctrine (summary)

- **2026** **=** **infrastructure** **election** **;** **durable** **county** **/ **community** **teams;** **opt**-**in** **candidate** **pipeline;** **aspirational** **“**no** **uncontested** **seat** **by** **2030**” **—** **not** **a** **guarantee,** **not** **a** **substitute** **for** **compliance** **or** **grassroots** **work.**

## Future candidate pipeline design (summary)

- **Prospect** **ID,** **training** **stages,** **internal** **2028** **bench** **/** **2030** **coverage** **dashboards** **(future) **— **in** **chapter** **§10,** **not** **implemented** **as** **app** **in** **this** **pass.**

---

## Unresolved Steve decisions

- **APA** **price** **sheet** **and** **contract** **line** **items** **(§18** **`MANUAL_INFORMATION_REQUESTS` **+ **this** **report) **+ **all** **§18** **bullets** **(approvals,** **caps,** **channels,** **disclaimers,** **targeting** **policy,** **UTM,** **2028/2030** **framing,** **community** **team** **def,** **seat** **list** **when** **ready).**

---

## Next recommended pass

**Manual Pass 4 — Role Playbooks, Training Modules, and Dashboard Attachment**

**Priority** **order** **for** **deeper** **chapters** **(Pass** **3C** **+** **3B** **roll-up) **:  
1. **Fundraising** **lead** **—** 2. **Paid** **media** **/ **vendor** **coordinator** **—** 3. **House** **party** **host** **captain** **—** 4. **Volunteer** **coordinator** **—** 5. **County** **coordinator** **—** 6. **Road** **team** **lead** **—** 7. **Social** **media** **lead** **—** 8. **Narrative** **Distribution** **lead** **—** 9. **Sign** **holder** **captain** **—** 10. **Power** **of** **5** **leader** **—** 11. **Future** **candidate** **pipeline** **lead** **(new** **/ **scaffold) **—** 12. **Campaign** **manager** **—** 13. **Candidate** **—** 14. **Owner** **(governance,** **not** **a** **“**role** **manual**”** **in** **the** **same** **sense) **. **

**Update (Pass 3D):** For the **18-role** Pass 4 depth order (this list **+** **four** roles: endorsement/relationship, field manager, voter file/data steward, communications), use **`MANUAL_PASS_3D_COMPLETION_REPORT.md`**.

**Last updated:** 2026-04-27 (Pass 3C; **3D** pointer for Pass 4 order)
