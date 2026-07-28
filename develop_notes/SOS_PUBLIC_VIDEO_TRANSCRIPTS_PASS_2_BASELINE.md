# SOS-PUBLIC-CAMPAIGN-VIDEO-TRANSCRIPTS-PASS-2 — Baseline

**Slice:** `SOS-PUBLIC-CAMPAIGN-VIDEO-TRANSCRIPTS-PASS-2.0`  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting commit:** `9ee9aa31`  
**Date:** 2026-07-28  

## Implementation mode

```text
FILE_BACKED_ENCRYPTED_OAUTH
```

No Prisma migration. Track C remains **CLOSED**. Submission/User surface untouched.

## Audit summary

| Area | Finding |
|------|---------|
| Pass 1 foundation | Registry, `/kelly-speaks`, disclosure, VideoObject — shipped |
| YouTube Data API | API-key search sync only (`src/lib/integrations/youtube/`) — no captions OAuth |
| Google OAuth prior art | Gmail sealed tokens (`token-crypto` + AES-256-GCM); Calendar plain JSON (do not copy) |
| OpenAI | `src/lib/openai/client.ts`; Whisper prior art in forum lab |
| Admin auth | `requireAdminPage` / `assertAdminApi` + `ADMIN_SECRET` |
| Netlify | No app `netlify/functions`; googleapis pruned from server handler — prefer fetch + auth-library where available; heavy Whisper/batch via operator scripts |
| Storage choice | Encrypted OAuth file + workspace JSON under `data/campaign-media/`; published overlays under `src/content/media/transcripts/` |

## Hard rules for this pass

- Never auto-publish transcripts
- Never invent Kelly speech text for production
- Never commit OAuth tokens or API keys
- Do not reopen Track C / homepage personality
- Do not touch blocked Prisma migrations

## Commands

- `npm run typecheck`
- `npm run agents:test-campaign-video-transcripts`
- `npm run agents:test-campaign-video-transcripts-pass2`
- `npm run build` (when feasible)
- Operator: `npm run media:youtube-transcript-sync`
