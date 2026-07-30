# Evidence Photo World-Class Upgrade

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior:** [`EVIDENCE_PHOTO_PRO_EDIT_PASS.md`](./EVIDENCE_PHOTO_PRO_EDIT_PASS.md)

## Goal

Bring Photo Pro Edit to parity with the Video suite: mutate after propose, preview before render, soft-archive, promote-from-assembly, readiness next-actions, and AI tools that sing in `photo_prep` — without inventing geography or deleting originals.

## Operator path

```text
Photos → set focus (click)
→ Pro Edit suite → Propose cut pack (look + slot chips)
→ Apply look / slots · Preview look
→ Confirm render (dialog) → assemblies registered in derivative ledger
→ Promote on assembly card (confirm) · Soft-archive when superseded
```

## What shipped

| Piece | Role |
| --- | --- |
| `photo-edit-plan.ts` | `updatePhotoEditProject` — set_meta / set_slots / toggle_slot |
| `photo-edit-preview.ts` | Cheap graded single-slot preview JPEG |
| `photo-readiness.ts` | Focus → Pro Edit → promote matrix |
| `photo-edit-store.ts` | `softArchivePhotoAssemblies` |
| `photo-look-presets.ts` | + film / bright / editorial looks |
| `photo-pro-render.ts` | Ledger bridge via `pushPhotoDerivativeRecord` |
| `media-derivatives-types` | `grade_full` + `story_9x16` kinds |
| `promote-photo-derivative.ts` | Promote by allowed assembly `publicSrc` |
| Photos **Pro Edit suite** UI | Slot chips, preview, promote, soft-archive, confirm dialog |
| AI tools | `update_photo_edit_project`, `preview_photo_edit_pack`, `soft_archive_photo_assemblies`, `get_photo_readiness_matrix` |
| Gates | `confirmRender` / `confirmArchive` / `confirmPromote` |

## Looks

`neutral` · `warm` · `cool` · `contrast` · `soft` · `punch` · `mono` · **film** · **bright** · **editorial**

## Doctrine

- Prefer Unknown; never invent geography
- Confirm gates for render / archive / promote
- No file deletes; soft-archive only
- Originals never overwritten; never auto-promote

## Acceptance

- [x] Update plan after propose (UI + AI)
- [x] Slot chips + Apply look/slots
- [x] Preview before Confirm render
- [x] Assemblies → derivative ledger → Promote
- [x] Soft-archive with confirmArchive
- [x] confirmPromote on AI promote
- [x] Readiness matrix tool
- [x] Photos Pro Edit suite UI
