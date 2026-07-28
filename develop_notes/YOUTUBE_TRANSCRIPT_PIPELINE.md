# YouTube transcript pipeline

**Mode:** `FILE_BACKED_ENCRYPTED_OAUTH`  
**Admin:** `/admin/media/youtube`  
**Public:** `/kelly-speaks`, `/kelly-speaks/[slug]`, `/kelly-speaks/search`

## Flow

1. Connect campaign YouTube via OAuth (encrypted refresh token at `data/integrations/youtube-oauth.sealed.json`).
2. Sync discovers uploads and caption tracks.
3. Preferred track downloaded (creator over ASR) and normalized into workspace drafts (`REVIEW_REQUIRED`).
4. Editors revise, approve, then **explicitly publish**.
5. Publish writes `src/content/media/transcripts/{videoId}.json` and registers in `overlays.ts` for production deploys.

## Hard rule

**No transcript is published automatically.** Sync and AI only create advisory drafts.

## Env

See `.env.example` (`YOUTUBE_OAUTH_*`, `YOUTUBE_TOKEN_ENCRYPTION_KEY`, `YOUTUBE_CHANNEL_ID`).

## Operator sync

```bash
npm run media:youtube-transcript-sync
```
