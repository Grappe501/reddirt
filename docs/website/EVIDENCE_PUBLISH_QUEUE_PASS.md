# Evidence Publish Queue Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Audit item:** #1 Unknown → Save → Approve backlog (P0)

## Goal

Close the ops loop for proof density: live **Publish Queue** with Unknown / Draft / Turbo pending / Needs approval / Approved counts, one-path Turbo→Apply→Save→Batch Approve, and a **density snapshot** wired into [`EVIDENCE_DENSITY.md`](./EVIDENCE_DENSITY.md).

## Operator path

```text
Workbench → Publish Queue (default tab)
  · see live backlog buckets
  · Turbo Unknown / draft backlog (proposals only)
  · Photos → Apply identify → Save
  · Batch Approve needs-approval (Unknown + consent still skipped)
  · Refresh density snapshot (+ optional evening log)
  · Commit data/campaign-media/ to ship
```

## What shipped

| Piece | Role |
| --- | --- |
| `evidence-publish-queue.ts` | Live queue selectors + turbo target ids |
| `evidence-density-snapshot.ts` | JSON snapshot + density doc Unknown/counties update |
| `EvidencePublishQueuePanel.tsx` | Queue tab UI |
| Workbench default tab | `queue` |
| Actions | `getEvidencePublishQueueAction`, `refreshEvidenceDensitySnapshotAction`, `runPublishQueueTurboAction` |
| AI tools | `get_evidence_publish_queue`, `refresh_evidence_density_snapshot`, `run_publish_queue_turbo` |
| Store | `data/campaign-media/evidence-density-snapshot.json` |
| Smoke | `scripts/smoke-evidence-publish-queue.ts` |

## Acceptance

- [x] Live Unknown / Draft / Needs approval / Approved / Turbo / Consent counts
- [x] Turbo backlog targets Unknown+draft only; never Approves
- [x] Batch Approve from queue still skips Unknown county
- [x] Density snapshot + EVIDENCE_DENSITY Unknown/counties from approved stills
- [x] Evening log fields in snapshot JSON
- [x] AI tools + brain rules
- [x] Smoke green
- [x] Docs note on EVIDENCE_ENGINE

## Explicit out of scope

- Auto-Approve / invent geography  
- Silent rewrite of `campaign-photo-registry.ts` (stub only — see Ship Checklist)  
- Curated HOMEPAGE_* mutate (audit #3 — now gated via Placement Propose; see EVIDENCE_CURATED_PLACEMENT_PASS.md)  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Publish Queue | `429f141e` | Queue tab + density snapshot |
