# Training module index — Pass 4

**Architecture:** **Levels** 0–7. Each **module** has **id** `M-xxx`. **Not** a shipped LMS. **Read:** `../TRAINING_AND_TRAINER_CERTIFICATION_SYSTEM.md`.

## Levels

| L | Name | Audience |
|---|------|----------|
| **0** | Welcome + campaign **values** | All |
| **1** | **Guided** **System** / **Workbench** **basics** (honest) | New volunteers, leads |
| **2** | **Role** **onboarding** (by playbook) | **Role**-specific |
| **3** | **Skill** **path** (e.g. phone, event, comms) | **Active** **vols** **/ **leads** |
| **4** | **Advanced** **leadership** (multi-county, crisis prep) | **Leads,** **CM** **-** **adjacent** |
| **5** | **Trainer** **certification** (Pass 3G + 4) | **Trainers** |
| **6** | **Regional** / **master** **trainer** | **Rarest**; **owner** sign-off |
| **7** | **Future** **candidate** **pipeline** (opt-in) | **Pipeline** only |

## Module cards

**Columns:** `id` · purpose · **roles** (who **must/should** take) · time · **prereq** **module** **ids** · **practice** · **assessment** · **badge** (internal) · **dashboard** **signal** (future) · **readiness** (0–6, **product** = **not** a **LMS** **\–** **today** = **0**-**2** for **\–** most **\–** **modules** **\–** = **\–** **manual** **only** **unless** **\–** **stated** **\–** **).

| id | purpose | who | time | prereq | practice | assess | badge | signal | R |
|----|---------|-----|------|--------|------------|--------|-------|--------|---|
| M-001 | **Values** + tone + **MCE/NDE** | all | 15m | — | 1 line personal commitment | 3/4 quiz | L0 | profile flag | 2 |
| M-002 | **Workbench** **\–** intakes **\–** tasks **(concept)** | L1+ staff adj | 30m | M-001 | read sample intake | check | L1-WB | task assigned | 1 |
| M-003 | **Data** **privacy;** no **\–** **PII** **in** **chat;** no **\–** **voter** **\–** to **\–** **ordinary** **vols** | all before **\–** **field** | 25m | M-001 | case study | pass/fail | L1-PII | M-003 done | 2 |
| M-004 | **Finance** **/ **\–** **compliance** **\–** **basics** (not legal advice) | **anyone** w/ $ touch | 30m | M-001 | read treasurer **\–** one **\–** pager | quiz | L1-FIN | admin note | 2 |
| M-005 | **P5** | P5+ | 20m | M-001 | invite **\–** **1** | leader sign-off | P5-101 | P5 start | 3 |
| M-006 | **House** **party** | **hosts** | 35m | M-001,M-005 | run-of-show | CM spot-check | L2-HP | event created | 2 |
| M-007 | **Call** **time** | **V.C.,** call-time mgr | 25m | M-001,M-004 | 3 practice **\–** **dials** | rubric | L3-CT | task closed | 2 |
| M-008 | **County** **party** | party **\–** **stewards,** **scheduler** | 40m | M-001,M-003 | map **1** **\–** **county** | CM review | L2-CP | `CampaignEvent` | 2 |
| M-009 | **Rural** | rural **\–** **lead,** field | 30m | M-008 | 1 **\–** **rural** **\–** **brief** | peer | L2-RUR | ladder note | 2 |
| M-010 | **Youth** **/ **\–** **campus** | campus, **youth** | 35m | M-001,M-003, **+** `MANUAL_...` **youth** | status **\–** **label** **1** **\–** **school** | safety **\–** **check** | L2-YTH | OIS or task | 2 |
| M-011 | **NAACP** / **\–** **community** | **NAACP** **\–** **stewards** | 35m | M-001 | **no** **\–** **invented** **\–** **branch** | map QA | L2-NA | mapping task | 2 |
| M-012 | **Focus** **\–** **category** | **focus** lead | 30m | M-001 | 1 **\–** **listening** | CM | L2-FC | intake | 2 |
| M-013 | **Event** **\–** **planning** | **event**-adj | 40m | M-001 | 1 **\–** **checklist** | after **\–** **action** | L2-EVT | `CampaignEvent` | 2 |
| M-014 | **GCal** + **\–** **event** **\–** **pipeline** | **schedulers** | 45m | M-002 | **1** **\–** **reconcile** | CM | L2-CAL | event status | 1 |
| M-015 | **Local** **\–** **host** **/ **\–** **advance** | **host,** **advance** | 40m | M-013 | day-of runbook | no-shows plan | L2-ADV | task | 2 |
| M-016 | **Faith** **\–** **invitation** | faith **\–** **stewards** | 30m | M-001 | **1** **\–** **invitation** **\–** **log** | counsel **\–** if **\–** **edge** | L2-FTH | log only | 2 |
| M-017 | **VFD** | VFD lead | 25m | M-001 | 1 **\–** **intro** | \– | L2-VFD | \– | 2 |
| M-018 | **Chamber** | chamber lead | 25m | M-001 | 1 **\–** **intro** | \– | L2-CHM | \– | 2 |
| M-019 | **Listening** **\–** **tour** | **listening** **\–** **coord** | 45m | M-001,M-003 | 1 **\–** **format** | CM | L2-LST | `CampaignEvent` | 2 |
| M-020 | **MCE** **(concept)** + **\–** **NDE** (concept) | **comms,** NDE, social | 40m | M-001 | **1** **\–** **draft** + **\–** **redline** | **MCE** **/ **\–** **comms** | L3-MCE | \– | 2 |
| M-021 | **Narrative** **\–** **Distribution** (ops) | NDE | 50m | M-020 | **1** **\–** **wave** | ship **\–** **rate** | L3-NDE | NDE **\–** **UI** if **\–** any | 2 |
| M-022 | **Paid** **\–** **media** **\–** **governance** | **paid,** comms | 45m | M-004 | **$** **\–** **gate** **\–** **exercise** | **treasurer** **\–** **review** on **\–** **buy** | L3-PAID | `Financial` match | 2 |
| M-023 | **Postcard** / **\–** **DM** | **postcard** lead | 35m | M-004 | **1** **\–** **tranche** | match **\–** **code** | L3-PC | order **\–** log | 2 |
| M-024 | **Signs** **/ **\–** **banners** / **\–** **visibility** | **visibility** lead | 35m | M-004 | **1** **\–** **placement** **\–** **log** | **permit** **\–** **check** | L3-VIS | task | 2 |
| M-025 | **Canvass** + **\–** **turf** + **\–** **privacy** | **field** + **\–** **precinct**-adj | 50m | M-003 | **1** **\–** **turf** **\–** **exercise** | no **\–** PII | L3-CANV | \– | 2 |
| M-026 | **GOTV** **(concept)** | **field,** lead | 40m | M-003,M-025 | \– | \– | L3-GV | TBD | 1 |
| M-027 | **Election** **Day** **\–** **visibility** | sign, **\–** **field** | 30m | M-024 | \– | \– | L3-EDV | \– | 1 |
| M-028 | **Trainer** **certification** | prospective **trainers** | 60m+ | M-021 **or** L4 **+** **M-002** | **1** **cohort** **observed** | rubric **TBD** | T1 | **CampaignTask** **(if** used) | 0 |
| M-029 | **Coaching** + **\–** **feedback** | **trains** **+** **leads** | 35m | M-028 (optional) | 1:1 | peer | T2 | \– | 0 |
| M-030 | **Future** **\–** **candidate** | **\–** L7, **\–** **opt-in** | 20m | M-001 | **1** **\–** **page** **\–** read | **owner** | L7-PIPE | `WorkflowIntake`? | 0 |

**R** = **readiness (0-6)**: for **productized** **training,** most modules are **0–2** (manual + tasks) until a real LMS/tracking ship; **do** not claim **4+** per role without `../SYSTEM_READINESS_REPORT.md` evidence.

**Last updated:** 2026-04-28 (Pass 4)
