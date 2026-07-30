# Evidence Workbench — Intake Phase 4 (bridges)

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Prior:** [`EVIDENCE_WORKBENCH_INTAKE_PHASE_3.md`](./EVIDENCE_WORKBENCH_INTAKE_PHASE_3.md)  
**Integration packet:** Steve-requested Phase 4 build (this pass)

## Goal

Optional bridges without silent publish: Owned Media → Evidence draft (confirm), stronger YouTube-id master matching, draft→registry graduation helper (clipboard / Ship only).

## What shipped

### Owned Media → Evidence
- `listOwnedMediaEvidenceBridgeCandidates` — IMAGE assets not already in drafts/registry by filename
- `importOwnedMediaToEvidenceDraft` — **confirm-only**; LOCAL_DISK copy → `campaign-photos/` + intake draft
- Arrival **Bridges · Phase 4** UI: Import draft per row
- Never Approves

### Speech master YT-id
- Auto-match prefers **youtube-id**, then speech-id, then fuzzy
- Arrival badge shows confidence (`youtube-id` / `speech-id` / …)
- Unmatched suggestion dropdown tags `[youtube-id]` when applicable

### Draft → registry graduation
- Arrival Bridges: ready count + **Copy ready TS blocks** (clipboard)
- Deep-link to Publish **Ship last mile** for full graduation assist
- Still never mutates `campaign-photo-registry.ts`

## Doctrine

Prefer Unknown. Detect ≠ Intake ≠ Save ≠ Approve ≠ Graduate. Confirm required on every bridge write.
