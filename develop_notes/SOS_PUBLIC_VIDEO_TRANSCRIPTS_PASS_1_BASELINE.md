# SOS-PUBLIC-CAMPAIGN-VIDEO-TRANSCRIPTS-PASS-1 — Baseline

**Slice:** `SOS-PUBLIC-CAMPAIGN-VIDEO-TRANSCRIPTS-PASS-1.0`  
**Lane:** `H:\SOSWebsite\RedDirt` (active Kelly SOS public site — not `sos-public/`)  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting commit:** `8dd16d30`  
**Date:** 2026-07-28  

## Implementation mode

```text
FILE_BACKED
```

Typed campaign media registry under `src/content/media/` with optional transcript modules. No Prisma migration. Does not touch Submission/User parity surface. Track C remains **CLOSED**.

## Existing architecture (pre-change)

| Area | Finding |
|------|---------|
| Public app | `src/app/(site)/` Next.js App Router |
| Image media registry | `src/content/media/registry.ts` (stills) |
| Approved YouTube IDs (docs/JSON) | `data/public-experience/kelly-homepage-personality-approved-videos.json` |
| YouTube embed | `src/components/media/LazyYouTubeEmbed.tsx` (`youtube-nocookie`, click-to-play) |
| CampaignVideoCard / ShortCard | **Not implemented** (doctrine only) |
| VideoObject / JSON-LD | **Not found** for campaign videos |
| Kelly Speaks public route | **Not found** |
| Transcript disclosure | **Not found** (election-plan forum labs are separate/internal) |

## Commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Focused: `npm run agents:test-campaign-video-transcripts`

## Working tree (unrelated — do not stage)

`scripts/netlify-enforce-env-scopes.cjs`, election-plan auth, volunteer middleware, `src/middleware.ts`

## Constraints honored

- No YouTube OAuth / caption download / OpenAI ASR  
- No invented published transcripts  
- No Track C homepage personality implementation  
- No blocked Prisma migrations  
