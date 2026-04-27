# Role manual — Admin (operator / technical)

## 1. Role purpose
Operate the Workbench, execute imports and queues under policy, and keep the production stack healthy — not the org-chart “admin” in all cases. Technical gate: `ADMIN` session in app.

## 2. Why this role matters
Without reliable operators, `WorkflowIntake` ages, mail backs up, and fest ingest stalls — the Campaign Operating System looks “broken” even when code is sound.

## 3. Where this role sits
Under CM; may matrix to data/comms/field for specialized queues; not owner unless explicitly on-call for keys.

## 4. Who this role serves
CM and department leads with SLAs, not the public (except as side effect of site uptime).

## 5. Who supports this role
Owner (keys, vendors), (optional) IT for DNS/Netlify, data for exports policy.

## 6. Dashboard used
Full `(board)` and selected `admin` routes per assignment — see `ROUTE_INVENTORY` — not every route for every person.

## 7. Manual sections
Ch. 7, 16–18, 20 (internal only), `SYSTEM_CROSS_WIRING_REPORT`, `NETLIFY_FIRST_DEPLOY`, deployment doc.

## 8. First 24 hours
Key rotation literacy (not values in doc); P0: site down, webhook failing, 503 on forms at scale.

## 9. First 7 days
Runbook for `netlify` build, `DATABASE_URL` at build, `open-work` data sources, cron health.

## 10. First 30 days
30d audit: who has ADMIN access; backup verification with owner; PII in logs scan.

## 11. Daily workflow
Triage: open work; check cron/webhook noise; on ED: staffing model per CM.

## 12. Weekly workflow
Changelog of env changes (no values); capacity planning with CM on intakes; plugin Next health.

## 13. KPIs
Mean time to restore, queue age by source, false alerts, export audit hits.

## 14. Workbench tasks
All merged in `open-work` — you may be assignee on `WorkflowIntake` and `EmailWorkflowItem` per policy.

## 15. Approval authority
Ops; not new strategy; not legal on contrast; not spend — escalate.

## 16. Training modules
PII, incident response, Prisma “prod vs staging” discipline, webhooks, rate limits on public APIs.

## 17. Tools used
`npm` scripts per README in lane; `netlify` config; do not run destructive SQL from chat; no DB changes from this manual pass.

## 18. Common mistakes
Sharing `ADMIN` cookie; `console.log` of intake JSON in prod without redaction; running ingest on PII in CI logs.

## 19. Escalation path
CM; data on export; owner on break-glass and secrets; **counsel** if leak suspected.

## 20. Growth path
Head of ops, DB reliability, SRE in larger campaign tech orgs.

## 21. Election Day
War-room ops; CM still owns comms; you own uptime and log capture for post-mortem under retention policy.

## 22. Missing system features
MFA/SSO for admin; key rotation in UI; per-route RBAC (today: largely one gate).

## 23. Current readiness level
4 for operator spine with cookie auth; 3 for “production campaign security” (MFA+RBAC) — not 6 in Pass 2 review.
