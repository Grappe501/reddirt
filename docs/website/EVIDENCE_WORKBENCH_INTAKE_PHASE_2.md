# Evidence Workbench — Intake Phase 2 (soft-watch)

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Prior:** [`EVIDENCE_WORKBENCH_INTAKE_PHASE_1.md`](./EVIDENCE_WORKBENCH_INTAKE_PHASE_1.md)

## Goal

Detect new stills and video masters **while Arrival is open** — without auto-Intake or Approve.

## Behavior

```text
Arrival desk open + Soft-watch on
        │
        ▼
Poll every 8s (pauses when tab hidden or action pending)
  · Refresh still + master lists
  · If new file ids/keys appear → toast banner
        │
        ▼
Operator clicks Bring into system (or Dismiss)
  · Never silent Intake / Approve from the poller
```

## What shipped

- Soft-watch toggle (default on) on Arrival
- `listArrivalSoftWatchAction` — light poll (no speech catalog every tick)
- Toast: N new stills · M new masters — not auto-intaken
- Status line: last scan time
- Manual Rescan still available
- Copy updated (Phase 0/1 “no auto-watch” retired)

## Out of scope

- OS-level chokidar for Evidence (Owned Media watcher stays separate)
- Auto-Intake / Turbo from soft-watch
- Phase 3 declutter / Phase 4 Owned Media bridge

## Doctrine

Prefer Unknown. Detect ≠ Intake ≠ Save ≠ Approve. Never silent Approve.
