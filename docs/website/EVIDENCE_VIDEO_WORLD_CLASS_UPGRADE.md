# Evidence Video World-Class Upgrade

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior:** [`EVIDENCE_VIDEO_PRO_EDIT_PASS.md`](./EVIDENCE_VIDEO_PRO_EDIT_PASS.md)

## Goal

Upgrade the Evidence Workbench video editing suite to a world-class operator console: editable cut lists, N-clip crossfade chains, SRT+VTT captions with preview, gated poster/render/archive, and matching AI tools — without inventing spoken lines or deleting media.

## Operator path

```text
Drop master → Video Prep (plan / encode)
→ Pro Edit suite → Propose cut list
→ Reorder / trim / drop clips · Apply look/aspects · Preview captions
→ Confirm render (N-clip crossfade + SRT/VTT + aspect pack)
→ Soft-archive assemblies when superseded (files kept)
```

## What shipped

| Piece | Role |
| --- | --- |
| `video-edit-cutlist.ts` | Reorder / trim / drop / set_meta (never invents quotes) |
| `video-caption-package.ts` | Cue builder, SRT+VTT, `previewEditCaptions` |
| `video-pro-render.ts` | N-clip `crossfadeChain` with hard-cut fallback |
| `video-edit-store.ts` | `softArchiveVideoAssemblies` (note + reorder; no deletes) |
| `speech-readiness.ts` | Next-action when clips/master exist but no assemblies |
| Speeches **Pro Edit suite** UI | Cut-list editor, aspect chips, caption preview, soft-archive |
| Server actions | `updateVideoEditCutListAction`, `previewVideoEditCaptionsAction`, `softArchiveVideoAssembliesAction` |
| AI tools | `update_video_edit_cutlist`, `preview_video_edit_captions`, `soft_archive_video_assemblies` |
| Gates | `confirmPoster` / `confirmRender` / `confirmArchive` |

## Capabilities

- Editable cut list (↑↓ reorder, trim start/end, drop)
- Crossfade chain for N≥2 clips (pairwise; concat fallback)
- Captions: preview cues; sidecar writes **SRT and VTT**; burn-in still verbatim
- Export aspects: source, 9:16, 1:1, 16:9 (toggle before propose / apply meta)
- Soft-archive assembly records — files never deleted
- Readiness nudges Pro Edit when clips exist without assemblies

## Doctrine

- Prefer Unknown; never invent spoken lines or geography
- Confirm gates for encode / poster / render / archive
- No file deletes; soft-archive only
- Masters never overwritten

## Acceptance

- [x] Cut-list update path (UI + AI)
- [x] Caption preview before burn-in
- [x] SRT + VTT sidecar write
- [x] N-clip crossfade chain
- [x] Soft-archive with confirmArchive
- [x] confirmPoster on AI poster extract
- [x] Speeches Pro Edit suite UI
- [x] Brain / video_prep mode docs updated
