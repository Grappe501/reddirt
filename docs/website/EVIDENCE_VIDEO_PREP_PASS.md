# Evidence Video Prep Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior boards:** 10-pass (locked) · Intake upgrade

## Goal

A **simple, strong video editing AI package** on top of Pass 6–8: one Prep action + gated encode tools + 9:16 social reframes — not a full NLE.

## Operator path

```text
Drop master → Videos tab → Prep package
  · tooling + master status
  · plan excerpts (optional query)
  · transcript intel
  · optional encode top 3 / poster (explicit checkboxes)
→ Encode clip / quote / manual window (source or 9:16)
→ Apply intel fields → Save speech evidence
```

## What shipped

| Piece | Role |
| --- | --- |
| `video-prep-package.ts` | Orchestrator → review packet |
| `prepSpeechVideoPackageAction` | Server action |
| Speeches **Video Prep** card | Query, Prep, manual window, quote→encode, 9:16 |
| AI tools | `prep_video_package`, `list_video_derivatives`, `apply_transcript_intelligence` |
| Encode gate | AI `encode_video_excerpt` requires `confirmEncode:true` |
| Vertical encode | `aspect: vertical_9x16` scale+crop 1080×1920 |
| Smoke | `scripts/smoke-video-prep-package.ts` |

## Acceptance

- [x] Prep package without silent encode (default)
- [x] confirmEncode / confirmPoster explicit
- [x] Manual start/end encode
- [x] Quote → encode from intel
- [x] 9:16 social reframe
- [x] AI tools + brain rules
- [x] Smoke green
- [x] Docs note on EVIDENCE_ENGINE

## Out of scope

- Owned Media / YouTube OAuth rewrite  
- Caption burn-in / SRT  
- Full NLE timeline  
- Auto-download YouTube masters  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Video Prep | `a76745ab` | Prep package + 9:16 + gated AI tools |
