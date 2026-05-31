# PASS P4 — Legislative Video Intelligence Pipeline Build Report

**Active lane:** RedDirt/  
**Date:** 2026-05-31  
**Governance:** INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED

---

## 1. Executive summary

Pass P4 delivers an **automated legislative video intelligence pipeline** and **Debate War Room 2.0** integration. The system can discover Arkansas committee/floor Sliq video links from bill pages, queue processing, defer transcription honestly when no provider is configured, chunk/verify speaker attribution (unit-tested), bind timestamp citations to the P2 claim ledger, and feed film room + AI Brain rollups.

**Live discovery verified:** With `LEGISLATURE_LIVE_DISCOVERY=1`, SB486 yielded **4 Sliq video candidates** with `mediaStartTime` anchors. **0 transcripts/chunks in production** — transcription deferred until audio extract + ASR provider configured (no fabrication).

---

## 2. What was built

- Priority bill registry (29 bills from election record)
- Polite arkleg fetcher with cache, rate limits, fetch budget
- Source packet discovery (Meetings → Sliq URLs)
- Video candidate + processing queue store
- Transcription pipeline contract (DEFERRED / OpenAI hook)
- Sponsor presentation window detector
- Transcript chunker + speaker verification layer
- Claim ledger + opposition archive binding
- Debate Film Room 2.0 (legislative clips, committee quotes, verification warnings)
- Admin UI `/admin/intelligence/legislative-video`
- Pipeline scripts + 26-test validation suite
- External video expansion contract (not implemented)

---

## 3. Files changed

### New: `src/lib/legislature/`

- `legislativeGovernance.ts`, `legislativeFetch.ts`
- `priorityBillRegistry.ts`
- `arkansasLegislativeSourceDiscovery.ts`
- `legislativeVideoArchiveStore.ts`
- `legislativeTranscriptionTypes.ts`, `legislativeTranscriptionPipeline.ts`
- `sponsorPresentationDetector.ts`, `legislativeTranscriptChunker.ts`, `speakerVerification.ts`
- `legislativeClaimIngest.ts`, `legislativeOppositionIngest.ts`
- `legislativeVideoIntelligenceRollup.ts`, `legislativeVideoIntelligencePipeline.ts`
- `externalVideoSourceTypes.ts`

### New scripts

- `scripts/discover-legislative-videos-for-priority-bills.ts`
- `scripts/process-legislative-video-queue.ts`
- `scripts/chunk-legislative-transcripts.ts`
- `scripts/ingest-legislative-chunks-to-claims.ts`
- `scripts/run-legislative-video-intelligence-pipeline.ts`
- `scripts/test-legislative-video-intelligence-pipeline.ts`

### Updated

- `debateFilmRoom.ts`, `debateReadinessSignals.ts`, `debateCommandCenter.ts`
- `messageIntelligenceLayer.ts`, `intelligenceAgentOrchestrator.ts`
- `package.json`

### New admin

- `src/app/admin/(board)/intelligence/legislative-video/page.tsx`

### New data (generated)

- `data/opposition/kim-hammer-profile/priority-bill-registry.json`
- `data/legislature/video-archives/video-candidates.json` (4 candidates after live SB486 fetch)
- `data/legislature/cache/*.json` (bill page cache)
- `data/legislature/source-packets/SB486-2021-2021R.json`

### Docs

- `PASS-P4-LEGISLATIVE-VIDEO-PIPELINE-INVENTORY.md`
- `EXTERNAL_VIDEO_INTELLIGENCE_EXPANSION_PLAN.md`
- This build report

---

## 4–10. Status summary

| Component | Status |
|-----------|--------|
| Priority bill registry | **29 bills** (9 CRITICAL) |
| Legislative discovery | **Real** — Sliq URLs from bill Meetings |
| Video queue | **Real** — 4 candidates (SB486) |
| Transcription | **Deferred** — no provider/audio extract |
| Speaker verification | **Real** — regex + multi-signal (26 tests) |
| Transcript chunking | **Real** — code path tested with fixtures |
| Citation/timestamp binding | **Real** — cit-src-leg-video + cit-anchor-leg |
| Claim ledger binding | **Real** — ingest path ready; 0 production claims (no transcripts) |
| Opposition/film room | **Real** — film room shows legislative fields + warnings |
| AI Brain | **Real** — 10 new legislative answer fields |

---

## 11. Debate war room integration

Film room now includes:
- `legislativeClipCount`, `topHammerCommitteeQuotes`, `billsWithTranscriptCoverage`, `speakerVerificationWarnings`
- Legislative chunk items with timestamp ranges and `needsVerification` flags

Debate command center shows legislative video panel + top committee quotes.

---

## 12. Automation status

| Step | Automated? |
|------|------------|
| Load priority bills | Yes |
| Discover source packets | Yes (with `LEGISLATURE_LIVE_DISCOVERY=1`) |
| Find video candidates | Yes — verified SB486 → 4 Sliq links |
| Queue processing | Yes |
| Transcribe | **Deferred** — requires audio extract + ASR |
| Chunk + verify speaker | Yes (when segments exist) |
| Citation + claims | Yes (when chunks exist) |
| Update rollups | Yes |

---

## 13. Deferred (environment limits)

- Audio download/extract from Sliq (ffmpeg)
- OpenAI/local Whisper transcription
- Production transcript segments (0 — honest)
- Production chunks/quotes (0 — honest)

Enable path: `LEGISLATURE_LIVE_DISCOVERY=1` → discover → `LEGISLATURE_AUDIO_EXTRACT=1` + `LEGISLATURE_TRANSCRIPTION_ENABLED=1` + `OPENAI_API_KEY`

---

## 14. Commands run

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run agents:test-legislative-video-intelligence-pipeline` | **26/26 PASS** |
| `npm run legislature:intelligence:run` | PASS (0 chunks — discovery off) |
| `LEGISLATURE_LIVE_DISCOVERY=1 legislature:discover-videos` | **4 video candidates** |
| `npm run agents:test-opposition-archive-closure-mvp` | **24/24 PASS** |
| `npm run build` | Running |

---

## 15. Known failures

None in P4 test suite. Transcription/chunking at scale blocked until ASR + audio extract wired.

---

## 16. Next recommended pass (P5)

**Message Intelligence Engine** — wire legislative chunks into message intelligence scoring, county overlays, and governed LLM evidence packets once transcripts exist. Expand external video contract (YouTube/media) with same governance.

**Readiness:** ~88% → **~91%** (pipeline real; transcript depth deferred)

---

## P5 recommendation for Steve

Run `LEGISLATURE_LIVE_DISCOVERY=1` on all CRITICAL bills (budget 5/run), then wire ffmpeg audio extract + OpenAI Whisper to close the automation loop. Until then, operators can use discovered Sliq URLs + `mediaStartTime` for manual verification while the queue holds honest DEFERRED status.
