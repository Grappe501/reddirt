# Campaign video transcript — editorial template

Copy for each video when entering a reviewed transcript.

```text
Video ID:
Public title:
Transcript source: CREATOR_SUPPLIED | YOUTUBE_CREATOR_CAPTIONS | YOUTUBE_AUTOMATIC_CAPTIONS | AI_GENERATED | MANUAL
Automatic or creator-supplied:
Reviewer:
Review date:
Publication approval: DRAFT | REVIEW_REQUIRED | APPROVED | PUBLISHED
Known proper names checked: Kelly Grappe · Secretary of State · …
Arkansas locations checked:
Organizations checked:
Election terminology checked: county clerk · ballot · voting systems · …
Final transcript (plainText):
Timestamp segments (optional):
  id / startSeconds / speaker / chapter / text
Editorial notes:
```

File placement (Pass 1): attach via `transcript` on the record in `src/content/media/campaign-media-registry.ts`, or add a module under `src/content/media/transcripts/` and import it.

**Never** set `transcript.status` to `PUBLISHED` until review protocol is complete.
