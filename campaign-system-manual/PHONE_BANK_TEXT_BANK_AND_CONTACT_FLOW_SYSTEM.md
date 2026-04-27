# Phone bank, text bank, and contact flow system (Manual Pass 5L)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Doctrine** for **phone** **banking** **and** **text** **banking** **as** **normal** **volunteer** **workflows** **—** **not** **a** **shipped** **dialer** **or** **peer**-**to**-**peer** **claim** in **this** **repo,** **not** **unmanaged** **bulk** **messaging** **(see** `playbooks/APPROVAL_AUTHORITY_MATRIX.md` **,** `SEGMENTED_MESSAGE_AND_DISTRIBUTION_SOP.md` **). **

**Ref:** `workflows/MESSAGE_CREATION_TO_DISTRIBUTION.md` · `HUMAN_INTERACTION_TASKS_IN_EVERY_BRIEF.md` · `DASHBOARD_OBJECTIVE_AND_GET_INVOLVED_CARD_SYSTEM.md` · `DAILY_APPROVAL_LAUNCH_AND_TASK_ROUTING_SYSTEM.md` · `THANK_YOU_CARD_AND_APPRECIATION_WORKFLOW.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**49

**Product honesty:** Vendors, **TCPA**-**class** **rules,** **and** **script** **owners** **are** **TBD** **in** **MI** **§**49** **. ** This **manual** **does** **not** name **a** **production** **tool** **as** **locked** **without** **owner** **sign**-**off** **. **

---

## 1. Use cases (approved-audience work)

- **Announce** **events** **(time,** **place,** **RSVP** **—** **no** **PII** **in** **public** **briefs) **. **  
- **Invite** **geographic** **supporters** **to** **speaking** **/ ** **visibility** **opportunities** **(audience** **rules** **+** **MCE+** **as** **needed) **. **  
- **Recruit** **volunteers** **(relational** **+** **clear** **next** **step) **. **  
- **Voter** **registration** **help** **(neutral,** **accurate,** **compliant** **—** **see** **§**4** **) **. **  
- **Follow** **up** **on** **interested** **people** **(from** **intake** **/ ** **events,** **not** **cold** **scrape) **. **  
- **Event** **reminders** **(opt**-**in** **and** **timing** **rules) **. **  
- **Thank**-**you** **calls** **/ ** **texts** **(per** **`THANK_YOU_...` **) **. **  
- **Fundraising** **call**-**time** **support** **(treasurer** **+** **MCE+** **governance) **. **  
- **Reactivation** **(MCE+owner;** **see** `BETA_VOLUNTEER_REACTIVATION_...` **). **

---

## 2. Workflow (governed)

1. **Audience** **/ ** **source** **approval** **—** **list** **provenance,** **no** **voter** **row** **in** **a** **public** **model** **;** **R2+** **/ ** **stewarded** **views** **only** **where** **allowed** **. **  
2. **Script** **approval** **—** **LQA+** **/ ** **MCE+** **per** **matrix;** **no** **solo** **ship** **. **  
3. **Compliance** **/ ** **opt**-**in** **check** **—** **not** **implied** **consent;** **DNC** **/ ** **do**-**not**-**contact** **honored** **(MI** **§**49** **) **. **  
4. **Task** **creation** **—** **`WorkflowIntake` ** **/ ** **`CampaignTask` ** with **claim** **/ ** **due** **(see** `STRATEGY_TO_TASK_EXECUTION_RUNBOOK.md` **, **`ADVANCE_...` **). **  
5. **Volunteer** **training** **gate** **—** **script** **read,** **compliance** **ack,** **role** **(5C** **+ ** **training** **index) **. **  
6. **Call** **/ ** **text** **execution** **—** **within** **approved** **tooling;** **no** **unmanaged** **bulk** **text** **. **  
7. **Outcome** **logging** **—** **result** **codes** **§**3** **(no** **raw** **PII** **in** **public** **views) **. **  
8. **Follow**-**up** **routing** **—** **triage,** **staff** **handoff** **when** **needed** **(5J** **/ **`WORKBENCH_OPERATOR_...` **). **  
9. **Thank**-**you** **/ ** **retention** **trigger** **—** **`THANK_YOU_...` **+ **`VOLUNTEER_RETENTION_...` ** as **governed** **. **

---

## 3. Result codes (standardize when product exists)

- **Interested** **—** **next** **step** **scheduled** **or** **task** **routed** **. **  
- **Needs** **ride** **/ ** **info** **—** **logistics** **/ ** **FAQ** **path** **. **  
- **Wants** **to** **volunteer** **—** **onboarding** **/ ** **P5** **placement** **(see** `ANYONE_CAN_ONBOARD_...` **). **  
- **Wants** **registration** **help** **—** **neutral** **facts** **only;** **escalate** **if** **legal** **edge** **(compliance) **. **  
- **Event** **yes** **/ ** **maybe** **/ ** **no** **—** **for** **RSVP** **/ ** **planning,** **not** **a** **public** **shame** **list** **. **  
- **Do** **not** **contact** **—** **honor;** **suppress** **future** **tasks** **. **  
- **Wrong** **number** **—** **remove** **/ ** **correct** **in** **stewarded** **tool** **only** **. **  
- **Hostile** **/ ** **escalate** **—** **safety,** **comms,** **press** **per** **`ESCALATION_PATHS` **. **  
- **Needs** **staff** **follow**-**up** **—** **P0** **/ ** **sensitive** **line;** **not** **a** **vol** **solo** **commitment** **on** **policy** **. **

---

## 4. Voter registration help (hard walls)

- **Neutral,** **accurate,** **and** **compliant** **—** **no** **partisan** **barriers** **in** **script** **. **  
- **Script** **owner** **and** **review** **cadence** **=** **MI** **§**49** **(treasurer/****counsel/****MCE** **as** **appropriate) **. **

---

## 5. Hard walls (non-negotiable)

- **No** **unmanaged** **bulk** **texting** **(vendor** **+** **approval** **+** **opt**-**in** **) **. **  
- **No** **unapproved** **scripts** **(including** **peer**-**to**-**peer** **“** **personal** **”** **templates) **. **  
- **No** **PII** **in** **public** **brief** **or** **unauth** **surfaces** **(5F,** **5I** **). **  
- **No** **GOTV** **/ ** **targeting** **claims** **without** **approved** **data** **policy** **(4B,** **MCE+** **;** **not** **asserted** **from** **sliders** **alone** **) **. **

---

**Last** **updated:** **2026-04-27** **(Pass** **5L** **) **
