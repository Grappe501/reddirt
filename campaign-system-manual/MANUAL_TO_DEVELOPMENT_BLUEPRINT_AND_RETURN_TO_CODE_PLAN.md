# Manual to development — blueprint and return-to-code plan (Manual Pass 5L)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Bridge** **document** **between** **book**-**first** **manual** **work** **and** **RedDirt** **engineering** **—** **not** **a** **commit** **to** **dates** **or** **a** **shipped** **roadmap,** **not** **a** **0**-**6** **grade** **change** **(see** `SYSTEM_READINESS_REPORT.md` **). **

**Ref:** `ASK_KELLY_LAUNCH_PRIORITY_AND_FIRST_RELEASE_SCOPE.md` · `MANUAL_PROJECT_STATUS_AND_REMAINING_WORK_REPORT.md` · `MANUAL_PASS_5H_COMPLETION_REPORT.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `WORKBENCH_OPERATOR_RUNBOOK.md` · `ANYONE_CAN_ONBOARD_CAMPAIGN_CULTURE_AND_PATHWAY_SYSTEM.md` · `PHONE_BANK_TEXT_BANK_AND_CONTACT_FLOW_SYSTEM.md` · `CAMPAIGN_TOOL_STACK_OPERATING_SYSTEM_MAP.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**45**–**49

---

## 1. Exact** **status** **(Pass** **5L** **honesty) **

- **The** **manual** **is** **complete** **through** **Pass** **5K** **before** **this** **pass** **(see** `MANUAL_PASS_5K_COMPLETION_REPORT.md` **and** **index** **files) **. **  
- **Pass** **5L** **adds** **: ** **anyone**-**can**-**onboard** **culture** **+ ** **P5** **/ ** **P20** **placement** **doctrine,** **phone** **/ ** **text** **banking** **contact** **flow,** **full**-**stack** **tool** **map,** **theory** **stack,** **learning**-**community** **doctrine,** **and** **this** **return**-**to**-**code** **bridge** **. **  
- **No** **0**-**6** **readiness** **lift** **is** **claimed** **from** **documentation** **alone** **;** **readiness** **stays** **as** **in** **`SYSTEM_READINESS_REPORT` ** **until** **product** **proof** **and** **owner** **sign**-**off** **. **

---

## 2. Coding** **return** **path** **(recommended** **order) **

1. **Finish** **/ ** **verify** **the** **5H** **Ask** **Kelly** **first**-**release** **build** **per** **`ASK_KELLY_LAUNCH_...` ** **§**1** **(website** **review** **/ ** **editing** **flow,** **candidate** **onboarding,** **beta,** **suggestion** **box,** **approval** **feed** **) **. **  
2. **Candidate** **website** **review** **/ ** **edit** **packet** **flow** **(5G** **+ ** **5H** **) ** **—** **governed** **deltas,** **impact** **triage,** **not** **auto**-**publish** **on** **high**-**impact** **. **  
3. **Beta** **volunteer** **onboarding** **+** **suggestion** **box** **+** **approval** **feed** **(same** **5H** **spine) **. **  
4. **Workbench** **morning** **brief** **/ ** **approval** **/ ** **forecast** **surfaces** **(5I,** **5J** **) **. **  
5. **Claim** **landing** **+** **escalation** **timers** **(5J,** **5K,** **`ADVANCE_...` **;** **RACI**-**governed) **. **  
6. **Anyone**-**can**-**onboard** **invitation** **/ ** **help** **path** **(this** **pass,** `ANYONE_CAN_ONBOARD_...` **+ ** **MI** **§**49** **) **. **  
7. **Phone** **/ ** **text** **banking** **task** **workflow** **(`PHONE_BANK_...` **+ ** **MI** **§**49) **. **  
8. **Retention** **dashboard** **(aggregate** **governed,** `VOLUNTEER_RETENTION_...` **+ ** **MI) **. **  
9. **Strategy** **slider** **/ ** **refinement** **console** **(post**-**5H,** `CANDIDATE_STRATEGY_...` **+ ** **hard** **walls) **. **

**Sequencing** **rule** **from** **prior** **passes** **(unchanged) **: **5H** **§**1** **is** **not** **reordered** **to** **build** **unrelated** **major** **subsystems** **first** **(see** `ASK_KELLY_LAUNCH_...` **, **`MANUAL_PASS_5J_...` **, **`MANUAL_PASS_5K_...` **). **

---

## 3. What** **must** **be** **true** **before** **coding** **starts** **(gates) **

- **RACI+** **LQA+** **matrix** **/ ** **escalation** **/ ** **comms** **owners** **named** **for** **the** **packet** **(not** **“** **someone** **will** **own** **it** **”) **. **  
- **PII+** **VFR+** **donor+** **rules** **in** **writing** **(manual** **+ ** **DPA) **, **not** **only** **in** **chat** **. **  
- **Vendor+** **compliance+** **opt**-**in** **decisions** **for** **SMS** **/ ** **phone** **(MI** **§**49) **. **  
- **No** **invented** **production** **metrics** **or** **dollar** **totals** **in** **docs** **as** **“** **truth** **”** without **treasurer** **/ ** **ledger** **(3H) **. **  
- **First** **packet** **approval** **from** **owner+** **MCE+** **as** **listed** **in** **MI** **§**49** **(first** **coding** **packet) **. **

---

## 4. What Cursor (or any dev agent) should verify before engineering

- **`SYSTEM_READINESS_REPORT` ** **+ ** **`SYSTEM_CROSS_WIRING_REPORT` ** **(RedDirt) ** **for** **actual** **routes** **/ ** **models,** **not** **manual** **claims** **. **  
- **`APPROVAL_AUTHORITY_MATRIX` ** **+ ** **`ESCALATION_PATHS` ** for **governance** **on** **sends,** **$,** **and** **sensitive** **. **  
- **Open**-**work** **+ **`WorkflowIntake` ** **+ **`CampaignTask` ** **actual** **wiring** **(Pass** **2A** **) **. **  
- **No** **VFR** **/ ** **PII** **in** **public** **or** **unauth** **contexts;** **5F**-**5H** **rules** **. **  
- **5L** **manuals** **treated** **as** **design** **inputs** **, ** **not** **as** **skip**-**LQA** **tickets** **. **

---

## 5. Recommended** **first** **engineering** **packet** **(after** **owner** **agrees) **

**Start** **with** **the** **5H** **spine** **(verified** **in** **repo) **: ** public **/ ** **beta** **Ask** **Kelly** **surfaces,** **candidate** **website** **review** **to** **admin** **packet** **, ** **suggestion** **+ ** **approval** **queue** **, ** **with** **RACI** **and** **naming** **rules** **from** **Pass** **5D**-**5G**-**5H** **. **

**Run** **in** **parallel** **only** **where** **staff** **capacity** **exists** **: ** **5I/5J** **brief** **+ ** **forecast** **(design** **already** **in** **manual) **, ** **not** **a** **replacement** **for** **5H** **per** **prior** **pass** **repeated** **notes** **. **

**Post**-**5H** **(not** **blocking** **5H) **: ** **anyone**-**can**-**onboard,** **phone**-**/ ** **text**-**bank,** **retention,** **strategy** **console,** **per** **5L** **+ ** **5K** **—** **all** **with** **MCE+** **/ ** **MI** **§**48**-**49** **. **

---

**Last** **updated:** **2026-04-27** **(Pass** **5L** **) **
