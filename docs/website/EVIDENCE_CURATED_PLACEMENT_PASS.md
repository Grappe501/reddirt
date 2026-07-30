# Evidence Curated Placement Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Audit item:** #3 Curated Placement Propose (P1)

## Goal

Fit flags alone do not reorder curated `HOMEPAGE_*` ID tables. Operators get **ordered propose diffs** (gallery / Across Arkansas / Meet Kelly / hero) with preview, apply only via `confirmCurate:true`, hero stays **null** unless `allowHero` + Gold/HERO + known county, and every apply saves an undo snapshot.

## Operator SOP

```text
1. Workbench → Placement tab
2. Review Current curated (live TS)
3. Optional: check Allow hero propose
4. Propose placement → review current vs proposed + warnings
5. Write stub (optional paste aid) OR Apply (confirmCurate) → rewrites homepage-campaign-photos.ts
6. If wrong: Undo apply (confirmCurate) restores prior file from backup
7. Ship tab → commit/deploy when ready
```

## What shipped

| Piece | Role |
| --- | --- |
| `curated-placement-propose.ts` | Ordered diffs from fit + Gold seed + county diversity |
| `curated-placement-apply.ts` | Stub writer + gated rewrite + undo from `.ts.bak` |
| `curated-placement-store.ts` | Proposals + undo snapshots JSON |
| `EvidencePlacementPanel.tsx` | Placement tab UI |
| Actions | `proposeCuratedPlacementAction`, `applyCuratedPlacementAction`, `undoCuratedPlacementAction`, … |
| AI tools | `propose_curated_placement` / `apply_curated_placement` / `undo_curated_placement` / stub + list |
| Store | `data/campaign-media/curated-placement-proposals.json` |
| Stub | `data/campaign-media/curated-placement-stub.md` |
| Smoke | `scripts/smoke-curated-placement.ts` |

## Acceptance

- [x] Propose ordered diffs for gallery / Across AR / Meet Kelly / hero
- [x] Apply requires `confirmCurate:true` (no silent HOMEPAGE_* mutate)
- [x] Hero stays null unless `allowHero` + Gold/HERO + known county
- [x] Undo snapshot restores prior `homepage-campaign-photos.ts`
- [x] Stub markdown for review/paste
- [x] Workbench Placement tab
- [x] AI tools + brain rules
- [x] Smoke: refuse without confirm → apply → undo restores exact source
- [x] Docs on EVIDENCE_ENGINE

## Explicit out of scope

- Silent HOMEPAGE_* mutate from fit flags alone  
- Auto-hero without `allowHero`  
- Curated video ID tables (Across Arkansas video remains separate)  
- Auto-commit / auto-deploy after apply  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Curated Placement | _(this pass)_ | Placement tab + propose/apply/undo + smoke |
