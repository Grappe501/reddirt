# Role manual — Compliance lead

## 1. Role purpose
Route ethics, filings, counsel-approved guidance, and “no-go” on contrast — own `ComplianceDocument` posture (including `approvedForAiReference` in schema, default false for staff RAG use).

## 2. Why this role matters
One unreviewed public claim or misuse of PII in author tools can collapse trust faster than a bad OIS number.

## 3. Where this role sits
Peers with CM; vetoes on edge comms, contrast, and high-risk data uses; not the day-to-day V.C.

## 4. Who this role serves
Owner, candidate, and ultimately voters who deserve accurate, lawful communications.

## 5. Who supports this role
Counsel (external), finance on filings, comms+message+NDE on any copy touching law.

## 6. Dashboard used
`admin/compliance-documents`; review queue participation; not Workbench for all tasks unless SOP.

## 7. Manual sections
Ch. 12, 15, 22, compliance enums in `schema`, MANUAL information requests (legal), gap analysis (candidate intake legal blocks).

## 8. First 24 hours
P0: pending send with unreviewed claim; P0: any document marked `approvedForAiReference` without counsel sign-off in policy.

## 9. First 7 days
Filing calendar in people’s faces; R on who can toggle AI reference flags on compliance uploads.

## 10. First 30 days
30d training for comms+field on “no unclaimed oppo” and **no “AI”** in public on Guided product naming.

## 11. Daily workflow
As-needed except filing/crisis — then always-on with CM.

## 12. Weekly workflow
CM on risk list; data on new export use case; press if earned media spike.

## 13. KPIs
SLA to clear flags, retraction count, zero surprise filings (if applicable), training completion for high-risk staff.

## 14. Workbench tasks
`WorkflowIntake` with legal in title; `CommunicationDraft` as reviewer when policy routes there.

## 15. Approval authority
Legal-risk comms, contrast, data exports outside matrix — with owner for break-glass.

## 16. Training modules
Jurisdiction; SOS-specific ethics; crisis false-information response (RACI with comms, not DMs to press alone).

## 17. Tools used
Upload storage keys in `ComplianceDocument` — not raw paths in this manual; internal only.

## 18. Common mistakes
Uploading a doc and assuming `approvedForAiReference` = safe for RAG; letting staff paste secrets into intake.

## 19. Escalation path
Counsel; owner; if breach-like: off-app incident, not a GitHub issue with PII.

## 20. Growth path
General counsel path not in-app; or permanent compliance in multi-cycle org.

## 21. Election Day
Standby with comms+owner+CM; review any “we won/loss” lines for sourcing; **voter** intimidation = escalate to **law** and **safety** off-app, not a tweet thread from app.

## 22. Missing system features
Automated lints for contrast claims in drafts (only if counsel approves pattern library) — not default in Pass 2.

## 23. Current readiness level
4 for document store; 3 for full draft lint integration; 6 = counsel+owner sign-off for “production legal posture.”
