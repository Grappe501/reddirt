# YouTube sync protocol

## Nightly / operator

```bash
npm run media:youtube-transcript-sync
```

Or Admin UI: **Run video + caption sync**.

## What sync does

- Discover channel uploads (metadata)
- Detect creator vs automatic captions
- Download + normalize into workspace drafts
- Notify editors (`NEW_TRANSCRIPT`, failures)

## What sync never does

- Overwrite APPROVED/PUBLISHED editorial text
- Auto-publish to the website
- Upload captions back to YouTube
- Invent titles for registry DRAFT placeholders that are editorial-locked

## Failure recovery

- OAuth expired → reconnect in Admin
- Caption unavailable → status UNAVAILABLE; optional Whisper fallback with local audio
- Rate limits → retry later; errors recorded on workspace `lastError`
