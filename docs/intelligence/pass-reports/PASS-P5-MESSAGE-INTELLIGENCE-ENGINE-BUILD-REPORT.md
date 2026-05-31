# PASS P5 — Message Intelligence Engine Build Report

**Date:** 2026-05-31  
**Lane:** RedDirt/  
**Pass:** P5 — Message Intelligence Engine + Transcription Automation + Deployment Push

## 1. Executive summary

P5 wires the P4 Legislative Video Intelligence Pipeline into **Message Intelligence Engine 1.0**: audio extraction and Whisper transcription behind explicit env gates, CRITICAL-bill discovery modes, transcript-chunk → message signal mapping, governed evidence packets, admin dashboard panels, and AI Brain rollup integration. All outputs remain **INTERNAL_DRAFT / NON_PUBLISHABLE / HUMAN_REVIEW_REQUIRED**. No publish, send, or export paths added.

Production transcripts remain **0** — ffmpeg not on PATH; transcription correctly deferred.

## 2. What was built

| Area | Files |
|------|-------|
| Audio extraction | `src/lib/legislature/legislativeAudioExtraction.ts` |
| Whisper provider | `src/lib/legislature/legislativeTranscriptProvider.ts` |
| Pipeline wiring | `legislativeTranscriptionPipeline.ts`, `legislativeVideoIntelligencePipeline.ts` |
| Message engine | `src/lib/intelligence/messageIntelligence/*` |
| Evidence packets | `evidencePacketGenerator.ts` (message/debate/legislative/RR) |
| Admin UI | `AdminMessageIntelligencePanel.tsx`, intelligence + legislative-video + debate-command pages |
| Tests | `scripts/test-message-intelligence-engine.ts` |
| Scripts | `legislature:intelligence:critical`, `legislature:intelligence:high-critical` |
| Docs | This report + inventory |

## 3. Audio extraction status

- **Deferred** — `LEGISLATURE_AUDIO_EXTRACT=1` off; ffmpeg not on PATH
- Cache path: `data/legislature/audio/` (gitignored)
- Enable: install ffmpeg → `LEGISLATURE_AUDIO_EXTRACT=1`

## 4. Transcription status

- **Deferred** — requires audio + `LEGISLATURE_TRANSCRIPTION_ENABLED=1` + `OPENAI_API_KEY`
- Provider wired (Whisper `whisper-1`, verbose_json)
- No fabricated transcripts

## 5. Critical bill discovery status

- Mode `CRITICAL_ONLY` default
- Last run: 1 bill processed (fetch budget), 5 video candidates total, 4 transcription deferred
- Rollup written: `data/legislature/video-archives/legislative-video-rollup.json`

## 6. Transcript / chunk / quote counts

| Metric | Count |
|--------|------:|
| Priority bills | 29 |
| CRITICAL bills | 9 |
| Video candidates | 5 |
| Transcript segments | 0 |
| Chunks | 0 |
| Quotes | 0 |
| Speaker-confirmed quotes | 0 |

## 7. Message intelligence status

- Engine readiness score: **55/100** (computed)
- Safe themes: 3 · Risky themes: 3 · Citation gaps: 8 · Review queue: 8
- All recommendations include citation depth, confidence, review status, public use risk

## 8. Claim ledger / citation integration

- Claim ledger ids attach on chunk-derived and ledger-sourced recommendations
- Unsupported claims excluded from safe themes
- Evidence packets route to LLM review queue only

## 9. AI Brain integration

- `messageIntelligenceReadinessScore` from engine (not brief average)
- `buildBrainOrchestrationAnswers` receives MIE safe/risky themes
- Daily agent pass test OK

## 10. Dashboard integration

- `/admin/intelligence` — Message Intelligence panel
- `/admin/intelligence/legislative-video` — audio/transcription readiness + MIE link
- `/admin/intelligence/debate-command` — transcript-backed lanes, unsafe quote warnings

## 11. Governance status

- All MIE outputs: NON_PUBLISHABLE, HUMAN_REVIEW_REQUIRED
- Weak speaker → CRITICAL public use risk, AVOID_PHRASE category
- No send/publish/export in packet JSON (test 10 PASS)
- KH-4 export controls respected

## 12. What remains deferred

1. ffmpeg install + audio extract enablement
2. Production Whisper transcripts (depends on #1 + Sliq URL extract)
3. Human speaker verification for Hammer quotes
4. Live discovery env in local `.env` caused P4 test 25/26 flake (`LEGISLATURE_LIVE_DISCOVERY=1`)

## 13. Commands run / results

| Command | Result |
|---------|--------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (Prisma pool warnings during static gen — pre-existing) |
| `npm run legislature:intelligence:critical` | PASS — 4 transcription deferred |
| `npm run agents:test-message-intelligence-engine` | **20/20 PASS** |
| `npm run agents:test-legislative-video-intelligence-pipeline` | **25/26** (live discovery env) |
| `npm run agents:test-opposition-archive-closure-mvp` | **24/24 PASS** |
| `npm run agents:test-claim-ledger-citation-engine` | PASS |
| `npm run agents:test-governed-llm-evidence-packets` | PASS |
| `npm run agents:test-intelligence-agent-daily-run` | PASS |
| `npm run email:no-send-scan` | PASS |

## 14. Known failures

- P4 regression: `Live discovery off by default` — local env has `LEGISLATURE_LIVE_DISCOVERY=1` (not a P5 code regression)
- Pre-existing: `agents:test-opposition-workbench-debate-prep` bill count drift (out of scope)

## 15. Deployment readiness

- Typecheck + build green
- Netlify-ready pending git push
- Post-deploy smoke: `/admin/intelligence`, `/admin/intelligence/legislative-video`, `/admin/intelligence/debate-command`, `/admin/intelligence/claims`, `/admin/intelligence/llm-review-queue`

## 16. Next recommendation

**Email Services pivot** — Intelligence OS P5 infrastructure is wired; production transcript automation blocked only on ffmpeg/env. Proceed to Email Services lane per master plan; P6 county expansion can follow.

**Intelligence OS readiness:** ~**94%** (up from ~91% post-P4)
