# Role manual — Volunteer coordinator

## 1. Role purpose
Move signups to active, well-matched roles; partner with VAN/list policy (no public VAN) through data lead when matching.

## 2. Why this role matters
Reduces CM load on `WorkflowIntake` triage; improves first-week retention.

## 3. Where this role sits
Between public intake and field; handoff to P5, events, or P1 as appropriate.

## 4. Who this role serves
New volunteers and field who need quality placements.

## 5. Who supports this role
Field manager (turf), CM (priorities), admin (intake tools), (optional) data for match.

## 6. Dashboard used
`admin/volunteers/intake` (sheets), `admin/asks`, workbench for intake that are volunteer-facing.

## 7. Manual sections
Ch. 3–4, 7, 23, first-email workflow, CM gap doc (RACI with CM).

## 8. First 24 hours
Triage all new intakes in your scope; P0: safety-sensitive submissions.

## 9. First 7 days
Placement SLAs; duplicate merge policy; handoff to field for turf asks.

## 10. First 30 days
30d “activation funnel” with honest drop-off; improve one bottleneck with CM.

## 11. Daily workflow
AM: new intakes; PM: follow-ups; crisis days: 2x check.

## 12. Weekly workflow
Huddle with field; report activation KPIs to CM; no PII in email subject lines.

## 13. KPIs
Time to first action, show rate, duplicate rate, role-match satisfaction (light survey).

## 14. Workbench tasks
`WorkflowIntake` from `POST /api/forms`; `VolunteerAsk` creation; `CampaignTask` for “call new volunteer”.

## 15. Approval authority
Placement within policy; not comms, not spend, not voter file exports.

## 16. Training modules
PII, consent, Pathway language (Guided Campaign System public vocabulary; not “AI” in UI to volunteers).

## 17. Tools used
Handlers output `workflowIntakeId` — do not share raw IDs in public; internal ops only.

## 18. Common mistakes
Sending volunteer-level classification metadata from intakes to the volunteer as a “score.”

## 19. Escalation path
Field manager; CM; data lead on list match; compliance on harassment or minor reports.

## 20. Growth path
Field manager; head of “people” org; sideways to comms for volunteer-facing copy.

## 21. Election Day
Shift-fill triage; last-mile asks to fill GOTV; escalate confusion to field.

## 22. Missing system features
Automated “we received you” with ticket id safe for public; volunteer home dashboard with asks.

## 23. Current readiness level
4 for intake+asks when DB on; 3 for end-to-end automation of placement.
