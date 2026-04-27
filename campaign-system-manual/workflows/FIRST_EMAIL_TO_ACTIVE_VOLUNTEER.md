# Workflow — First email to active volunteer

## Purpose

Move a new supporter from first touch to a **concrete, scheduled** campaign action and optional role path.

## Entry point

- Email tools (SendGrid, etc.); web forms that POST to `/api/forms`; in-person capture that lands in the same handler where applicable.

## User role (human)

- **Volunteer** (recipient); **volunteer coordinator** / **field** (placer)

## System role (product)

- `POST /api/forms` → `persistFormSubmission` → `WorkflowIntake` (when DB available); optional classification; operator review on Workbench

## Data captured

- Form payload (schema in `formSubmissionSchema`); `Submission` / submission linkage; `WorkflowIntake` row; not raw PII in manual examples

## Dashboard updates

- **Public:** not automatic until member product ships. **Admin:** workbench “open work,” tasks as generated from intake rules

## Workbench queue

- `WorkflowIntake` in open-work sets (`open-work.ts`); assignment fields if used

## Approval path

- **Operator** triage; comms/CM for sensitive; no automatic legal approval in code

## KPI affected

- Time to first action; conversion from signup to shift; duplicate rate

## Training needed

- Privacy, consent, response SLAs, handoff to county/field SOPs

## Current implementation status

- **4–5** (integrated path) when `DATABASE_URL` set; 503 if DB not configured in dev

## Missing pieces

- **Authenticated** volunteer home with first-action tiles; full placement automation

## Next build steps

- **Pass 2 manual:** time each sub-step with test submission (no PII)  
- Product: connect asks (`VolunteerAsk`) to intake where appropriate

**Related:** `../SYSTEM_READINESS_REPORT.md` (§19) · DASHBOARD audit
