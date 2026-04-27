# Role manual — Voter file / data steward (day-to-day)

**Pass 4 book-style playbook:** [voter-file-data-steward.md](../../playbooks/roles/voter-file-data-steward.md)

## 1. Role purpose
Execute **import**, **hygiene**, **match** **QA**, and **pre-export** checks under **data** lead’s policy — not **strategy** or **messaging** ownership.

## 2. Why this role matters
**Garbage** in **VoterRecord** = **garbage** **asks** and **unfair** to **field**; **steward** reduces **wasted** dials and **compliance** pain.

## 3. Where this role sits
Under **data** lead; **touches** **field** through **list** **delivery** and **Q**; **not** a **comms** author.

## 4. Who this role serves
**Field**, **GOTV**, and **data** lead.

## 5. Who supports this role
**IT** (env), **vendors** of file (off-app contract), **compliance** on **exposure**.

## 6. Dashboard used
`admin/voter-import`, `voters/[id]/model` (verify access); **no** public surface.

## 7. Manual sections
Ch. 15, **data** model inventory, 12 (CM boundary), 22 (GOTV lists).

## 8. First 24 hours
**Log** and **as-of** date; **P0** **dup** and **NCOA** **flags**; **red**-team a **test** **export** for **PII** **bleed**.

## 9. First 7 days
**Reconciliation** w/ **field** on **naming** of **turf** keys; **list** for **1** program only.

## 10. First 30 days
**SOP** for **weekly** **delta** import; **error** **budget** and **KPIs** w/ **data** lead.

## 11. Daily workflow
**During** file **seasons**: **queue**; **else** **incident**-driven.

## 12. Weekly workflow
**Match** **rate** and **churn** report to **data** lead; **GOTV** lead in **final** month **daily** touch.

## 13. KPIs
**Error** %, **dup** %, **time** to **fix** a **P0** **break**; **not** public.

## 14. Workbench tasks
**N/A** in classic sense — **Jira-** like items can be `CampaignTask` for “re-run match” with **sealed** **notes**.

## 15. Approval authority
**No** new **data** use policy; **data** lead signs **exports**; **owner** break-glass.

## 16. Training modules
**PII** **handling**; **export** **logging**; **NIST**-style opsec (campaign-appropriate); **jurisdiction** on **VBM** if relevant.

## 17. Tools used
`VoterFileSnapshot`, `VoterRecord`, `VoterModelClassification` (where allowed); **scripts** in `package` only with **data** lead sign-off.

## 18. Common mistakes
**Ad-hoc** **CSV** in **email**; **screenshots** w/ PII; **relying** on **unverified** `match` in **scripts**.

## 19. Escalation path
**Data** lead → **compliance** → **owner**; **if** **breach**-like: **off-app** runbook, not **chat** logs.

## 20. Growth path
**Data** lead; sideways to **analyst** for **OIS** (aggregate only) if skills fit.

## 21. Election Day
**Hotline** to **GOTV** w/ **prewritten** list **SOP**; no **inventing** at **3pm**.

## 22. Missing system features
**Immutable** **audit** **log** for **export**; **role**-scoped **voter** **UI** (partial today).

## 23. Current readiness level
**4** for **import**+**model** **surface**; **3** for **governance** **automation** and **RACI** in-app.
