# Workflow — Candidate onboarding (system use)

## Purpose

Align the **candidate** with available briefs, comms process, and **message engine** discipline — without conflating candidate time with day-to-day Workbench work.

## Entry point

- `admin/candidate-briefs/*`; **CM** scheduling; public site go-live process

## User role

- **Candidate**; **CM**; **comms**; **compliance**

## System role

- Briefs and editorial pages; **not** a replacement for legal counsel

## Data captured

- Briefing docs in repo/DB; schedule metadata in tools where present

## Dashboard updates

- **N/A** for daily; public homepage/story as published

## Workbench queue

- Intake only when candidate request flows through `WorkflowIntake` (e.g. event request)

## Approval path

- **Counsel** for legal; **CM** for schedule; **comms** for public copy; **compliance** for claims

## KPI affected

- Message consistency, schedule adherence, crisis response time (internal)

## Training needed

- Press boundaries; PII; finance/compliance handoffs

## Current implementation status

- **3–4** (brief routes + public site); not a “candidate portal”

## Missing pieces

- Dedicated candidate app slice if desired; integration with **Narrative distribution** waves

## Next build steps

- Document RACI in chapter 12; keep manual procedural

**Related:** `chapters/12-candidate-and-campaign-manager-system`
