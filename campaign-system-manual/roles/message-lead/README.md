# Role manual — Message lead (Message Engine / MCE)

## 1. Role purpose
Own governed language: patterns, playbooks, channel packages — aligned to `CommunicationPlan` and internal review paths (Message Content Engine in docs).

## 2. Why this role matters
Separates “what we say” from “where it ships” (NDE) while keeping one narrative spine for Field Intelligence and Organizing Guide materials.

## 3. Where this role sits
Under or peer with comms lead; hands execution routing to NDE; escalates legal to compliance.

## 4. Who this role serves
Comms drafters, field script users (aggregate posture), training (Organizing Guide).

## 5. Who supports this role
Comms lead (calendar), data (no microtargeting language in volunteer UI), (optional) counsel on contrast.

## 6. Dashboard used
Comms workbench: plans, drafts, variants, review flows; `src/lib/message-engine/*` for intelligence helpers in dashboards (verify per panel for demo/seed).

## 7. Manual sections
Ch. 8, 9, 21, MESSAGE_CONTENT_ENGINE system plan, language audit, dashboard integration reports.

## 8. First 24 hours
Pattern library health; P0: draft in flight with unassigned reviewer.

## 9. First 7 days
7-day pattern QA cadence; map internal segment codes to public-safe field language.

## 10. First 30 days
30d pattern reuse metrics and defect log with comms+NDE; no public “model name” in errors.

## 11. Daily workflow
Draft and review touch; crisis: standby per RACI with comms.

## 12. Weekly workflow
Field feedback loop to patterns (aggregate); handoff to NDE for waves.

## 13. KPIs
Review cycle time, pattern reuse, defect rate, training adoption by field (internal).

## 14. Workbench tasks
`CommunicationPlan`, `CommunicationDraft`, `CommunicationVariant` review relations on User in schema.

## 15. Approval authority
Message patterns and MCE content; not legal sign-off on regulated content alone; not NDE channel routing if roles split.

## 16. Training modules
MCE plan, COMMS-UNIFY-1, “public vocabulary” (Guided, Field Intelligence) vs internal.

## 17. Tools used
`lib/message-engine/*`; workbench; avoid exposing env/model names in volunteer error strings.

## 18. Common mistakes
Shipping persuasion “scores” to volunteers; conflating MCE with voter model UI.

## 19. Escalation path
Comms lead; CM; compliance on contrast; NDE on ship failures.

## 20. Growth path
Comms lead or chief of narrative in larger org; merge with NDE in small orgs (document overload risk).

## 21. Election Day
Locked line-of-scrimmage on scripts; no last-minute unreviewed “AI”-generated (internal tools only) copy to the public.

## 22. Missing system features
Full `messagePatternId[]` on plans everywhere; MCE public-safe preview path for field.

## 23. Current readiness level
3–4 for code+plans; 2 for full MCE as single module surface for every user story.
