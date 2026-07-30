# Evidence Speech Confirm / Publish Parity Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Audit item:** #4 Speech confirm/publish parity (P1)

## Goal

Video Prep / Pro Edit were ahead of confirmation. Speech overlays were empty; Approve flags did not affect public selectors; there was no photo-style batch publish/undo or readiness view. This pass closes **confirm → publish** for Speeches.

## Operator SOP

```text
1. Workbench → Videos tab
2. Speech confirm panel: select no-county / needs-publish (or multi-select readiness rows)
3. Batch Save counties / whatThisProves / do-not-claim (Unknown stays Unknown)
4. Batch Approve → Batch Publish (empty-county skipped on public-raising)
5. Optional: Homepage on + Propose placement for HOMEPAGE_*_VIDEO_ID → Apply confirmCurate
6. Undo last publish batch or placement apply if wrong
7. Ship tab → commit speech-evidence.json / placement when ready
```

## What shipped

| Piece | Role |
| --- | --- |
| `applySpeechEvidenceOverlay` | Honors `approvedForPublic` hold + `homepageCandidate` → `homepageEligible` |
| `isPublicMedia` | Hold off public when `approvedForPublic === false` |
| `batch-speech-evidence.ts` | Field-level batch Save |
| `batch-speech-publish.ts` | approve / hold / publish / homepage + undo ledger |
| `speech-readiness.ts` | Readiness matrix |
| `speech-confirm-queue.ts` | Queue buckets for Publish Queue + Videos |
| `speech-placement.ts` | Homepage video ID propose / apply / undo |
| `EvidenceSpeechConfirmPanel.tsx` | Videos tab confirm UI |
| Publish Queue | Speech confirm section |
| AI tools | queue / readiness / batch / placement |
| Smoke | `scripts/smoke-speech-confirm-publish.ts` |

## Acceptance

- [x] Overlay Approve / homepage / PUBLISHED affect merged public selectors
- [x] Batch geo / proof / do-not-claim Save
- [x] Batch Approve / Publish / Hold / Homepage + undo
- [x] Empty-county skipped on public-raising actions
- [x] Readiness matrix (overlay · county · transcript · intel · master · clips · assembly)
- [x] Speech confirm queue on Publish Queue + Videos
- [x] Homepage video placement propose (confirmCurate + undo)
- [x] AI tools + brain rules
- [x] Smoke green
- [x] Docs on EVIDENCE_ENGINE

## Explicit out of scope

- Silent Approve / invent geography  
- Silent HOMEPAGE_*_VIDEO_ID mutate without confirmCurate  
- Owned Media / OAuth rewrite  
- Full NLE / auto-encode  

## Empty-store bootstrap

`data/campaign-media/speech-evidence.json` may start as `"speeches": {}`. First Save or Batch Save creates overlays. Batch publish runs live in `batch-speech-publish-runs.json`.

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Speech Confirm/Publish | `bc1268e5` | Overlay parity + batch + readiness + placement |
