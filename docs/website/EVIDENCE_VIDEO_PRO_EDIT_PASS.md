# Evidence Video Pro Edit Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior:** [`EVIDENCE_VIDEO_PREP_PASS.md`](./EVIDENCE_VIDEO_PREP_PASS.md)

## Goal

A **pro-suite cut of AI video editing** operators can drive through Evidence Workbench + AI tools: Edit Project → confirm render with concat/crossfade, looks, loudnorm, captions, and multi-aspect export — not a full visual NLE.

## Operator path

```text
Drop master → Videos → Video Prep (plan / encode clips)
→ Pro Edit → Propose Pro Edit (cut list + look / transition / captions / aspects)
→ Review clips → Confirm render
→ Assemblies under /media/campaign-derivatives/_video/
```

AI path: `propose_video_edit_project` → operator asks to render → `render_video_edit_project` with `confirmRender:true` → `list_video_assemblies`.

## What shipped

| Piece | Role |
| --- | --- |
| `video-look-presets.ts` | Looks, transitions, caption modes, aspect vf |
| `video-edit-types.ts` / `video-edit-store.ts` | Projects, captions, assemblies JSON |
| `video-edit-director.ts` | Propose cut list (plan or intel) — no silent render |
| `video-caption-package.ts` | Verbatim SRT from transcript windows |
| `video-pro-render.ts` | Segment → concat/xfade → look+loudnorm → aspect pack |
| Speeches **Pro Edit** card | Propose / Confirm / assemblies preview |
| AI tools | `propose_video_edit_project`, `render_video_edit_project`, `list_video_assemblies` |
| Store | `data/campaign-media/video-pro-edits.json` |
| Smoke | `scripts/smoke-video-pro-edit.ts` |

## Capabilities (this pass)

- Multi-clip assembly (hard cut; crossfade for **2** clips)
- Looks: neutral / warm / cool / contrast
- Loudness normalize (`loudnorm`)
- Captions: none / sidecar SRT / burn-in (verbatim transcript only)
- Export aspects: source, 9:16, 1:1, 16:9
- Gated render (`confirmRender:true`)
- Masters never overwritten; temps under `.local/temp/video-pro-edit/`

## Acceptance

- [x] Propose before render (UI + AI)
- [x] confirmRender gate
- [x] Crossfade 2-clip + hard-cut fallback
- [x] Look + loudnorm + multi-aspect pack
- [x] Caption modes without inventing lines
- [x] Speeches Pro Edit card
- [x] Smoke green
- [x] Docs note on EVIDENCE_ENGINE

## Explicit out of scope

- Full visual NLE / multi-track mixer  
- LUT marketplace  
- YouTube OAuth / auto-download  
- Auto-publish without confirm  
- Owned Media rewrite  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Pro Edit | _(this pass)_ | Director + confirm render + Speeches UI |
