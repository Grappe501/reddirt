# Task template index — Pass 4

**Purpose:** SOP **labels** for `CampaignTask` + **Human** **triage** from `WorkflowIntake` (see `../SYSTEM_READINESS_REPORT.md` — not full automation for every row).

**Schema (each template):** **Trigger** → **owner** **role** → **default** **due** → **Priority** (P0–P3) → **Required** **data** (no PII in public docs) → **Surface** (Workbench, OIS, NDE, etc.) → **KPI** **touched** → **Approval?** (Y/N) → **Definition** **of** **done** → **Escalation** if **stale** (owner/slot).

**Templates (ids TT-01 … TT-35)**

1. **TT-01** First **volunteer** **follow**-**up** — V.C., 24h, P1, intake id, **WB**, TTF, N, 1st touch, CM if stuck  
2. **TT-02** **Welcome** **call** — V.C., 48h, P1, vol ref, **WB**, activation, N, call logged, CM  
3. **TT-03** **Power** **of** **1** **activation** — V.C., 72h, P2, —, **WB**, P1 hours, N, 1st deliverable, field  
4. **TT-04** **Power** **of** **5** **invitation** — P5 lead, 7d, P2, team, P5+**WB**, P5, N, invite sent, field  
5. **TT-05** **House** **party** **host** **ask** — **house**-party captain, 7d, P2, county, **WB**, host pipeline, **Y** if $, `CampaignEvent` draft, CM  
6. **TT-06** **Donor** **thank-**-**you** — finance-**adj** / **V.C.**, 72h, P1, donation ref, comms+**WB**, thank SLA, N, comms sent, **owner** on large $  
7. **TT-07** **Call-**-**time** **follow-**-**up** — call-time **manager**, 24h, P1, pledge ref, **WB**, call yield, **Y** to treasurer system, **logged**, treasurer on pledge  
8. **TT-08** **County** **party** **meeting** **request** — **meeting** **scheduler** + **steward**, 7d, P2, county, **WB**+cal, 75-map, N, `CampaignEvent` TBD+owner, CM  
9. **TT-09** **County** **party** **contact** **list** **request** — list **steward** + **CM**, 14d, P2, provenance, **WB**, list pipeline, **Y**, import gate doc or decline, **owner** if legal  
10. **TT-10** **County** **party** **post-**-**meeting** **72h** — **steward** / **V.C.**, 72h, P1, meeting id, **WB**, 72h%, N, `WorkflowIntake`+closed task, CM  
11. **TT-11** **Campus** **captain** **follow-**-**up** — **campus** lead, 7d, P2, status label, OIS+**WB**, ladder, N, OIS**/**task updated, CM  
12. **TT-12** **NAACP** **intro** / **map** **step** — **NAACP** **steward**, 14d, P2, no PII, **WB**, branch map, N, next step, CM (no fake branch)  
13. **TT-13** **Focus** **category** **listening** **request** — **focus** lead, 7d, P2, —, **WB**, intake, N, `WorkflowIntake` created, —  
14. **TT-14** **Faith** **/ **\–** **community** **invitation** — **faith** **steward**, 14d, P2, venue, **WB**+cal, invitation, **Y** on worship, `CampaignEvent` TBD, counsel on edge case  
15. **TT-15** **VFD** **event** **request** — **VFD** lead, 14d, P2, —, **WB**, lane, N, `CampaignEvent` or pass, field  
16. **TT-16** **Chamber** **request** — **chamber** lead, 14d, P2, —, **WB**, lane, N, next step, field  
17. **TT-17** **Listening** **tour** **host** **ask** — **listening** **coordinator**, 7d, P2, —, `COMMUNITY_...`+**WB**, tour, Y if paid assist, `CampaignEvent`, CM  
18. **TT-18** **Local** **host** **forward** **work** — **local** **host** cap / **advance**, 48h, P1, —, **WB**, immersion, N, no orphan hosts, **advance** lead  
19. **TT-19** **Event** **promotion** **package** — **comms/NDE/paid** per lane, 5d, P2, **$** check, NDE+**WB**+`Financial` if $, Y if spend, assets shipped, CM  
20. **TT-20** **Press** **release** **request** — **comms** lead, 48h, P1, —, comms+**WB**, on-time, **Y**, out or declined, **owner** if crisis  
21. **TT-21** **Postcard** **universe** / **\–** **tranche** — **postcard** lead, 7d, P2, treasurer, **WB**+fin, mail, Y, tranche+match codes, treas  
22. **TT-22** **Banner** **sponsor** **ask** — **visibility** lead, 7d, P2, **$** gate, **WB**+fin, visibility, Y, order matched to **CONFIRMED** spend, treas  
23. **TT-23** **Visibility** **placement** **confirmation** — sign **/** visibility, 7d, P2, permit, **WB**, coverage, Y if legal, on-site, field+counsel  
24. **TT-24** **Precinct** **data** **acquisition** — **voter-**-**file** **/ **\–** **data** **stewards**, 14d, P2, source, admin, sim inputs, Y, file ingested+logged, **owner** for export  
25. **TT-25** **Canvass** **turf** **prep** — field, 7d, P2, **no** PII in chat, **WB**+OIS, turf, N, list ready in policy, CM  
26. **TT-26** **Sign** **holder** **recruitment** — sign captain, 14d, P2, —, **WB**, sign %, N, **assignment**, field  
27. **TT-27** **GOTV** **shift** **recruit** — **GOTV** (future deep), 30d, P3, —, `gotv`+**WB**, shifts, Y if scripts, \~, CM  
28. **TT-28** **Election** **Day** **incident** **escalation** — **CM/owner** slot, 1h, P0, —, comms+**log**, **compliance**, Y, case log, **owner**  
29. **TT-29** **Training** **completion** **reminder** — **training** **director**, 3d, P3, module id, **WB**, M-module, N, complete,—  
30. **TT-30** **Trainer** **certification** **review** — **training** **director** + **owner** if policy, 7d, P2, rubric, **WB**, T1, Y, pass/fail, owner on dispute  
31. **TT-31** **Future** **candidate** **prospect** **follow-**-**up** — **pipeline** lead, 14d, P3, opt-in, **WB**, pipeline, N, `WorkflowIntake` **opt-**-**in** only, —  

(Additional **SOPs** can split TT-**xx**; **this** set covers the **user**-**requested** **list** in **\–** one **\–** pass.)

**Last updated:** 2026-04-28 (Pass 4)
