# Workflow — Campaign manager onboarding

## Purpose

Onboard a **CM** to **Workbench** muscle memory: intake triage, **WorkflowIntake** aging, comms and field coordination, **not** as sole owner of all technical systems.

## Entry point

- ` /admin/login` → ` /admin/workbench`; read `open-work` behavior

## User role

- **Campaign manager**; **owner** (handoff)

## System role

- Workbench as **operator home**; `CampaignTask` from workflows

## Data captured

- Decisions in tasks, comments, assignment fields; audit discipline

## Dashboard updates

- **Workbench**; optional OIS for situational awareness

## Workbench queue

- All open intakes; priority rules are **human** (policy)

## Approval path

- **Owner** for spend and hiring; **compliance** for sensitive sends

## KPI affected

- Median time-in-queue; program milestone burn-down (external tracker ok)

## Training needed

- Admin session security; PII; triage of `/api/forms` vs orchestrator

## Current implementation status

- **5** (Workbench) as production candidate; depends on **env/DB** health

## Missing pieces

- Playbooks embedded in app; automated escalation (optional)

## Next build steps

- SOPs in `chapters/07`; manual time study with fake intake (no PII)

**Related:** `workflows/TASK_QUEUE_AND_APPROVALS.md`
