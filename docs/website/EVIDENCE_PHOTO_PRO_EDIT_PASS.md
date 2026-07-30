# Evidence Photo Pro Edit Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior:** Video Pro Edit · Turbo Ingest · 10-pass derivatives

## Goal

A **pro-suite stills editor** that matches or surpasses Video Pro Edit for photos: Edit Project → confirm render with looks, focus-aware multi-aspect pack (including story 9:16), optional sharpen, and promote *suggestions* — never silent promote, never overwrite originals.

## Operator path

```text
Photos → click focus (optional) → Pro Edit
  · choose look / use focus / sharpen
  · Propose Pro Edit
  · review slots + promote hint
  · Confirm render
→ Assemblies under /media/campaign-derivatives/{photoId}/pro-*
→ Promote still a separate explicit step
```

AI path: `propose_photo_edit_project` → operator asks to render → `render_photo_edit_project` (`confirmRender:true`) → `list_photo_assemblies`.

## What shipped

| Piece | Role |
| --- | --- |
| `photo-look-presets.ts` | Looks (warm/cool/contrast/soft/punch/mono/neutral) + export slots |
| `photo-edit-types.ts` / `photo-edit-store.ts` | Projects + assemblies JSON |
| `photo-edit-director.ts` | Propose pack from inspect/crop plan/focus/turbo fit |
| `photo-pro-render.ts` | Confirm render graded multi-aspect JPEG pack |
| Photos **Pro Edit** card | Propose / Confirm / assemblies preview |
| AI tools | `propose_photo_edit_project`, `render_photo_edit_project`, `list_photo_assemblies` |
| Store | `data/campaign-media/photo-pro-edits.json` |
| Smoke | `scripts/smoke-photo-pro-edit.ts` |

## Capabilities vs video

| | Video Pro Edit | Photo Pro Edit |
| --- | --- | --- |
| Propose → confirm | Yes | Yes |
| Looks | 4 | **7** (adds soft/punch/mono) |
| Multi-aspect pack | source/9:16/1:1/16:9 | full + hero + 4:5 + 1:1 + **story 9:16** + web + thumb |
| Focus-aware crops | N/A | **Yes** |
| Captions | SRT/burn-in | N/A (stills) |
| Auto-promote | No | No (promote hint only) |

## Acceptance

- [x] Propose before render (UI + AI)
- [x] confirmRender gate
- [x] Focus-aware cover crops when focus set
- [x] Look grade + optional sharpen
- [x] story_9x16 + multi-slot pack
- [x] Photos Pro Edit card
- [x] Smoke green
- [x] Docs note on EVIDENCE_ENGINE

## Explicit out of scope

- Full layer compositor / healing brush  
- LUT marketplace  
- Auto-promote / auto-approve  
- Overwriting `campaign-photos` masters  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Photo Pro Edit | `b628432d` | Director + confirm render + Photos UI |
