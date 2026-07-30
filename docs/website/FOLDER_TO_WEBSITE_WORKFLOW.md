# Folder → Website workflow

**Status:** Live  
**Lane:** `RedDirt/`  
**Desk:** Evidence Workbench → **Arrival**

## Operator path (verified)

| Step | What you do | What works | Efficiency |
| --- | --- | --- | --- |
| 1 Drop | Put stills in `RedDirt/public/media/campaign-photos/` (nested OK) · masters flat in `…/campaign-video-masters/` · or drop zone | Yes — Prefer Unknown skips same-name (no -2/-3) | Paths + Copy path on Arrival |
| 2 Detect | Soft-watch (5s) while Arrival open · or Rescan | Yes — detect only | Fast poll |
| 3 Bring in | **Bring in → Identify** (primary) | Queues drafts · reports masters | One click to next desk |
| 4 Identify | County → Save → Route | Prefer Unknown clamp | Per-asset (required) |
| 5 Approve | County desk batch Approve | Skips Unknown | Confirm dialog |
| 6 Ship | Publish · Ship last mile · git commit/push | Local ≠ Netlify until commit | Explicit |

## UI

- Step rail: Drop · Detect · Bring in · Identify · Approve · Ship  
- **Do this next** banner with the one action that matters  
- Full Windows paths + copy  
- Progress chips to County / Publish  

## Doctrine

Detect ≠ Intake ≠ Save ≠ Approve ≠ Ship. Never silent Approve. Never invent geography.
