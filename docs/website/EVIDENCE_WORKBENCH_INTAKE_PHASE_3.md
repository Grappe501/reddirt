# Evidence Workbench — Intake Phase 3 (declutter + preview)

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Prior:** [`EVIDENCE_WORKBENCH_INTAKE_PHASE_2.md`](./EVIDENCE_WORKBENCH_INTAKE_PHASE_2.md)

## Goal

Strong defaults on Arrival: clear primary actions, nested→flat preview, dedupe warnings, event-night preset.

## What shipped

- **Primary bar:** Bring into system + Send to Identify (Event night → Bring → Identify)
- **Secondary:** Rescan · Soft-watch · Advanced Turbo (hidden in event night)
- **Intake preview:** `buildArrivalIntakePreview()` — copy nested / reuse flat / skip registry|drafts|basename collision (no -2/-3)
- **Dedupe warnings** surfaced before Bring into system
- **Event night** toggle (localStorage) — collapses how-to/Turbo; primary jumps to Identify after intake
- How-to collapsed by default

## Operator path (event night)

```text
Event night on
  → Drop / soft-watch toast
  → Review preview warnings
  → Event night · Bring → Identify
  → Identify desk (draft filter)
```

## Out of scope

- Owned Media bridge (Phase 4)
- Auto-Intake from soft-watch
- Silent Approve / registry rewrite

## Doctrine

Prefer Unknown. Detect ≠ Intake ≠ Save ≠ Approve. Collisions skip — never invent duplicate filenames.
