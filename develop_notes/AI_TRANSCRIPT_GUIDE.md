# AI transcript guide

## When AI is allowed

Only when YouTube has **no captions** (`caption.downloadStatus = NONE`).

```ts
applyAiFallbackTranscript({ youtubeVideoId, absoluteAudioPath, author })
```

## Rules

- Source stored as `AI_GENERATED`
- Status forced to `REVIEW_REQUIRED`
- Never auto-publish
- Internal advisory summaries/quotes require separate human approval
- Do not treat AI advisory as public copy

## Whisper

Uses existing OpenAI client (`OPENAI_API_KEY`, model `whisper-1`).
