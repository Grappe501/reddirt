# Native Text Command Center (foundation)

**Lane:** `RedDirt/` only

## Vision

The campaign’s **text program** will live inside RedDirt: inbound handling, staff reply workflows, audiences, and internal test modes — all **governed** and visible in one place.

## Current state (foundation)

- **Twilio webhook** route exists for status and inbound signals (see capability map). Outbound SMS from other parts of the codebase remains **subject to headquarters policy**; this foundation slice **does not** enable send.
- **STOP / HELP** and opt-out handling must be **complete and tested** before any public texting.
- **Reply inbox** and **audience builder** are **planned** UI lanes — scaffolding only until the next build packets.

## Safety

- **SMS sending:** not activated by the Text + Reach foundation.
- **Bulk texting:** separate approval.
- **No live outreach** is enabled by the foundation slice alone.

## Staff links

- Hub: `/admin/workbench/communication-command-center/text-reach`
- Readiness JSON: `GET /api/admin/communication-command-center/text-reach-readiness` (diagnostics bearer)

See also [`text-reach-foundation.md`](./text-reach-foundation.md).
