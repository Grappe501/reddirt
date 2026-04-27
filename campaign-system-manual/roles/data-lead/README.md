# Role manual — Data lead

## 1. Role purpose
Steward voter file, match policy, exports, `RelationalContact` governance, and honesty of aggregates in OIS — PII owner in practice.

## 2. Why this role matters
Bad data destroys GOTV and erodes trust; good data under policy wins without microtargeting volunteers in public.

## 3. Where this role sits
Reports to CM; peers with compliance; blocks field/comms when use case violates policy.

## 4. Who this role serves
Field, GOTV, CM, and sometimes comms (segments) with approved segment labels only in staff views.

## 5. Who supports this role
Voter file vendor (off-app), admin for import runs, legal for DPA and retention.

## 6. Dashboard used
`admin/voter-import`, `admin/.../voters/[id]/model`, relational admin, (internal) reports — never a public voter browser for volunteers.

## 7. Manual sections
Ch. 15, DATA-1, IDENTITY-1, DATA_AND_PRIVACY_INDEX, gap analysis for policy; not legal advice in this repo.

## 8. First 24 hours
Export path audit; P0: any ad-hoc CSV in email — stop and rotate if needed per runbook.

## 9. First 7 days
Access matrix written; `User.linkedVoterRecord` policy with sign-off; test de-identified report to OIS.

## 10. First 30 days
30d import schedule; error budget; coordinate with GOTV lead on list windows.

## 11. Daily workflow
File season: queue-heavy; else: incident-driven and weekly integrity checks.

## 12. Weekly workflow
CM on “can we say this number publicly on OIS”; field on list issues; compliance on retention.

## 13. KPIs
Match quality, dup rate, export audit completeness, time to fix P0 data break.

## 14. Workbench tasks
Intakes that imply list requests; `CampaignTask` for re-run match, fix dup batch — sealed notes.

## 15. Approval authority
Exports, match automation parameters, new join keys for turf — with owner on break-glass.

## 16. Training modules
PII, incident response, NCOA/merge ethics, OIS “honest missing data” guardrails.

## 17. Tools used
`VoterFileSnapshot`, `VoterRecord`, `VoterModelClassification`, scripts in package.json (only with policy).

## 18. Common mistakes
Letting V.C. or field use raw VAN-like UI on the public web; screenshots with PII in Slack/chat.

## 19. Escalation path
CM; owner on break-glass; compliance on breach; counsel if legal process.

## 20. Growth path
Chief of data; regional data roles in multi-state (future); adviser to OIS on aggregates.

## 21. Election Day
Hotline support to GOTV; no novel exports; audit trail on any emergency list pull.

## 22. Missing system features
Full audit log on exports; role-scoped voter UI; automated red-team on mis-linked User↔Voter.

## 23. Current readiness level
4 for import+model; 3 for governance automation in-app; 6 only with DPA+training+audit (human).
