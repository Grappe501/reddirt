# Workflow — Message creation to distribution (MCE + NDE)

## Purpose

Connect **governed language** (Message engine / MCE) to **governed reach** (Narrative distribution / NDE) and channel execution (comms, social, email, local surfaces).

## Entry point

- ` /admin/workbench/comms/plans/new` (optionally `sourceWorkflowIntakeId`); ` /admin/narrative-distribution`

## User role

- **Comms lead**, **message lead**; **CM** for major waves

## System role

- `CommunicationPlan`, `CommunicationDraft`, `CommunicationSend` / broadcasts; NDE types in `narrative-distribution`

## Data captured

- Plan metadata, draft bodies, **segment** labels (internal); compliance flags in workflow

## Dashboard updates

- NDE and comms UIs; **OIS** may show “message intelligence” panels where wired (see message integration reports) — **verify demo vs real**

## Workbench queue

- Review tasks, launch tasks, localization tasks in NDE (conceptual)

## Approval path

- **Message lead** and **comms**; **compliance**; **counsel** when required; **no** volunteer approval of broadcast law posture

## KPI affected

- Time from approved plan to send; error/retraction count; field usage of patterns (aggregate)

## Training needed

- Public **vocabulary** (not “AI”); MCE/NDE distinction; COMMS-UNIFY-1 fork reality

## Current implementation status

- Comms: **4–5**; MCE/NDE: **2–3** (plans > full automation)

## Missing pieces

- End-to-end `metadataJson` keys across plans and NDE; telemetry on use

## Next build steps

- Ship narrative wave IDs on plans per NDE system plan; update manual when stable

**Related:** `chapters/08-…`, `chapters/09-…` · `../maps/MESSAGE_AND_DISTRIBUTION_MAP.md`
