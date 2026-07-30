# Evidence Workbench — Intake Phase 1 (Arrival desk)

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Prior:** [`EVIDENCE_WORKBENCH_INTAKE_PHASE_0.md`](./EVIDENCE_WORKBENCH_INTAKE_PHASE_0.md)

## Goal

One **Arrival** surface for new stills **and** video masters — Bring into system, attach unmatched masters, Send to Identify.

## Operator path

```text
Drop stills → campaign-photos/
Drop masters → campaign-video-masters/ or .local/video-masters/
        │
        ▼
Arrival desk (Intake tab)
  · Rescan folders (required after Explorer drops)
  · Bring into system → intake stills; report master matches
  · Unmatched masters → Attach to speech OR Mark unmatched
        │
        ▼
Send to Identify
```

## What shipped

- Video master arrival rows (auto / attached / unmatched / held)
- Attachments store: `data/campaign-media/video-master-attachments.json`
- `findLocalVideoMaster` honors operator attachments
- Drop zone accepts images **and** videos
- Primary CTA: **Bring into system**
- Turbo collapsed under **Advanced**
- Docs + Phase 0 language retained

## Out of scope

- Soft-watch / polling (Phase 2)
- Owned Media bridge (Phase 4)
- Auto-Approve / registry rewrite

## Doctrine

Prefer Unknown. Intake ≠ Save ≠ Approve ≠ Attach ≠ Ship. Never silent Approve.
