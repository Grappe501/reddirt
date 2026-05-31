# PASS P5 — Message Intelligence + Transcription Inventory

**Date:** 2026-05-31  
**Lane:** RedDirt/  
**Scope:** Wire P4 legislative video pipeline into Message Intelligence Engine 1.0

## ffmpeg availability

| Check | Status |
|-------|--------|
| `ffmpeg` on PATH | **NOT AVAILABLE** (deferred) |
| `LEGISLATURE_AUDIO_EXTRACT=1` | Off by default |
| Audio cache dir | `data/legislature/audio/` (gitignored) |

**Enable:** Install ffmpeg → set `LEGISLATURE_AUDIO_EXTRACT=1` → run `npm run legislature:intelligence:critical`

## Audio extract readiness

- Module: `src/lib/legislature/legislativeAudioExtraction.ts`
- Functions: `isAudioExtractionEnabled`, `detectFfmpegAvailability`, `extractAudioForVideoCandidate`, `summarizeAudioExtractionReadiness`
- **Status:** `AUDIO_EXTRACTION_DEFERRED` until ffmpeg + env flag

## OpenAI / Whisper env readiness

| Variable | Required |
|----------|----------|
| `LEGISLATURE_TRANSCRIPTION_ENABLED=1` | Yes |
| `OPENAI_API_KEY` | Yes (never commit) |

- Module: `src/lib/legislature/legislativeTranscriptProvider.ts`
- **Status:** Provider wired; transcription deferred without audio + env gates
- No fabricated transcripts

## Video / transcript / chunk counts (inventory time)

| Metric | Count |
|--------|------:|
| Priority bills | 29 |
| CRITICAL bills | 9 |
| Video candidates (SB486 discovery) | 4 |
| Transcript segments (production) | 0 |
| Transcript chunks | 0 |
| Verified Hammer quotes | 0 |

## Message intelligence readiness

| Component | Status |
|-----------|--------|
| `messageIntelligenceEngine.ts` | Built |
| `legislativeChunkMessageMapper.ts` | Built |
| Claim ledger integration | Wired |
| Evidence packet types (message/debate/legislative/RR) | Wired |
| Admin panels | Wired |
| Readiness score (computed) | ~35–55 without chunks; scales with verified claims + chunks |

## P4 blockers resolved in P5

1. Audio extraction module (was stub in P4)
2. OpenAI Whisper provider behind env gates
3. Pipeline modes: `CRITICAL_ONLY`, `HIGH_AND_CRITICAL`, `ALL_PRIORITY`
4. Rollup JSON: `data/legislature/video-archives/legislative-video-rollup.json`
5. Message Intelligence Engine 1.0 consuming briefs, ledger, legislative chunks, debate, archive, county briefs

## Build plan (P5 execution)

1. ✅ Inventory (this doc)
2. ✅ `legislativeAudioExtraction.ts`
3. ✅ `legislativeTranscriptProvider.ts` + pipeline wiring
4. ✅ Pipeline modes + npm scripts `legislature:intelligence:critical` / `high-critical`
5. ✅ `messageIntelligenceEngine.ts` + `legislativeChunkMessageMapper.ts`
6. ✅ Admin dashboard wiring (`/admin/intelligence`, legislative-video, debate-command)
7. ✅ Evidence packet generator extensions
8. ✅ `agents:test-message-intelligence-engine`
9. Validation suite + build report
10. Git commit + push + Netlify verification

## Deferred (honest)

- Production transcripts until ffmpeg installed and Sliq URLs extract successfully
- Speaker-verified Hammer quotes (0 until human review)
- Email Services pivot recommended after P5 validation green
