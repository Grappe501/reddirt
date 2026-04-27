# Workflow — Task queue and approvals (WorkflowIntake spine) — Pass 2A

## Purpose

Define how **`WorkflowIntake`**, **`WorkflowAction`**, **`CampaignTask`**, **comms**, **email workflow**, **social threads**, and **festival ingest** merge in the **Workbench** so operators do not miss work or duplicate effort. **Approvals** remain **human** across sensitive domains.

## End-to-end maps (exact files)

| Step | File / route | What happens |
|------|----------------|--------------|
| Client submit | Public pages using `POST /api/forms` | JSON body |
| API | `src/app/api/forms/route.ts` | Rate limit → `formSubmissionSchema` → `persistFormSubmission` or 503 if no DB |
| Persist | `src/lib/forms/handlers.ts` | `User` upsert; `Submission` create; **`createWorkflowIntakeForSubmission`** → `prisma.workflowIntake.create({ status: PENDING, metadata: { …, ai: classification } })` — use **internal** classification only; public UI = **Organizing Guide** categories when productized |
| Story | Same file, branch | story path before generic `Submission` pattern |
| Volunteer extras | Same | `VolunteerProfile` upsert; `Commitment` |
| Operator home | `src/app/admin/(board)/workbench/page.tsx` | Consumers of open-work |
| Unified list | `src/lib/campaign-engine/open-work.ts` | Merges **OPEN** `WorkflowIntake` statuses, **OPEN** `EmailWorkflowItem`, **OPEN** `CampaignTask`, **actionable** `CommunicationThread`, **pending** festival review |
| Hrefs in open-work | `open-work.ts` | `intakeHref` → `/admin/workbench/comms/plans/new?intakeId=…` (comms new page as entry), `taskHref`, `emailHref`, `threadHref` |
| Tasks | `/admin/tasks` + `CampaignTask` | Listed in open-work with links |
| Comms | `CommunicationPlan` | Optional `sourceWorkflowIntake` relation in schema (see `WorkflowIntake.communicationPlansSourced`) |
| Intake status enum | `prisma` `WorkflowIntakeStatus` | `PENDING` … `ARCHIVED` |

## Data captured (public forms)

- **PII** in `User` (email, name, phone, zip, county).  
- `Submission.content` = **sanitized** summary; `structuredData` may include `raw` with **emails redacted** via `redactPII` in handlers.  
- `WorkflowIntake.metadata` JSON: `formType`, interests, `ai` **classification** object if OpenAI ran — **operator-only** interpretation.  
- **No** public row shows classification as a **grade** on a person.

## When `DATABASE_URL` is missing

- `isDatabaseConfigured()` false in API → **503** JSON, **no** DB writes (see `src/lib/env`).

## Where operators review

- **`/admin/workbench`** (primary) — unified.  
- Direct: **`/admin/workbench/email-queue`**, **comms plan new w/ `intakeId`**, **`/admin/tasks`**, **social** workbench, **volunteer intake** docs.

## Where approvals **exist** in schema vs **missing** as productized policy

- **Present:** `CommunicationDraft` / variant **review** `User` relations; `FinancialTransaction` **CONFIRMED**; `ComplianceDocument` **approvedForAiReference**; event approval types in schema.  
- **Not automated:** “Campaign strategy” routing — **CM/owner** judgment; **triage** rules for **Volunteer** vs **comms** vs **data** are **SOPs**, not one engine.

## Campaign strategy → routing (future)

- `WorkflowIntake.countyId` and `metadata` can steer **territory**; **“strategy engine”** is **not** in repo as an automated decision system — document **RACI** in manual.

## Human role by step (default)

| Step | Role |
|------|------|
| First triage | **CM** or assigned **admin** |
| County-tagged intakes | **Field** / **V.C.** per policy |
| Comms from intake | **Comms** / **message lead** |
| Voter-impacting | **Data lead** + **compliance** |
| Close/decline | **CM** |

## KPIs

- Open intake count by **age bucket**; time to **IN_REVIEW**; conversion to `CONVERTED` or linked **plan/event**; duplicate detection rate (manual for now).

## Current implementation status

- **5** for **intake** creation and **4–5** for **open-work** merge quality (read-only unifier per code comments).  
- **4** for social/festival as additional sources of operator attention.

## Missing pieces

- **SLA** fields on intakes; **notification** to assignee; **client-visible** “we received you” without exposing internal status codes.

## Next build steps (manual, not code here)

- Pass 3: **SOP** per intake **source**; **glossary** mapping internal `metadata` → **Pathway** stage names for staff UI.

**Related:** `../SYSTEM_CROSS_WIRING_REPORT.md` §3 · DASHBOARD audit §19 · `prisma` `WorkflowIntake` · `../SYSTEM_READINESS_REPORT.md`

**WorkflowIntake from `/api/forms`:** **Yes** when DB configured — `persistFormSubmission` always calls `createWorkflowIntakeForSubmission` after `Submission` create (all non-error paths in handler reviewed Pass 2A).

**Last updated:** 2026-04-27 (Pass 2A)
