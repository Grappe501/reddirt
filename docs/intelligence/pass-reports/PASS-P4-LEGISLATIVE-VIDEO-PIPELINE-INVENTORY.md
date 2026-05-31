# PASS P4 — Legislative Video Pipeline Inventory

**Active lane:** RedDirt/  
**Generated:** 2026-05-31  
**Governance:** INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED

## Inspected files

| Path | Role |
|------|------|
| `data/opposition/kim-hammer-election-record-bill-index.json` | 29 Hammer-tracked bills with Arkleg URLs |
| `data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json` | 545 bill grid rows from INTEL-4B ingest |
| `data/intelligence/generated/arkleg-review-shortlist.json` | 25 priority election-policy bills |
| `scripts/ingest-arkleg-legislator-opposition.ts` | Existing governed arkleg scraper (curl/cheerio, Sliq video parse) |
| P3 opposition archive store | Writings/clips/bills indexed |
| P2 claim ledger + citation engine | Claim/citation binding target |
| `src/lib/opposition/debateFilmRoom.ts` | Film room MVP (pre-P4) |

## Priority bill list

- **29 bills** bootstrapped from election record index into `priority-bill-registry.json`
- **CRITICAL/HIGH** priority for election/ballot/county administration topics where Hammer is sponsor
- Shortlist JSON provides additional 2025R election bills (HB1222, HB1693, SB207–210, etc.)

## Video archive discovery path

1. Bill page: `https://www.arkleg.state.ar.us/Bills/Detail?id={bill}&ddBienniumSession={session}`
2. **Meetings** section → Sliq Harmony links (`sliq.net`) with optional `mediaStartTime`
3. Heuristic: prefer committee meetings over floor convenes-only rows
4. Existing INTEL-4B script already implements `parseBillMeetings` + `pickCommitteePresentationMeeting`

## Known technical blockers

| Blocker | Mitigation |
|---------|------------|
| Arkleg may serve shell HTML to non-browser clients | Polite fetch + cache; existing curl UA pattern in INTEL-4B |
| No ffmpeg/audio extract wired in P4 MVP | `TRANSCRIPTION_DEFERRED` until `LEGISLATURE_AUDIO_EXTRACT=1` |
| OpenAI transcription needs local audio file | Provider gated on `LEGISLATURE_TRANSCRIPTION_ENABLED=1` + `OPENAI_API_KEY` |
| Live discovery off by default | `LEGISLATURE_LIVE_DISCOVERY=1` required for network fetch |
| Rate limits | Max 5 fetches/run, 1.5s delay, 7-day cache |

## Direct video URLs discoverable?

**Yes, when bill detail page parses successfully** — Sliq links appear in Meetings table. Shortlist currently has `probeVideos: false` so most URLs are null in dryrun output.

## Committee videos usable audio?

Sliq streams are typically video with audio; extraction requires download + ffmpeg (deferred in P4 MVP).

## Proposed automated retrieval approach

1. Load priority bill registry
2. For each CRITICAL/HIGH bill (within fetch budget): fetch/cache bill page
3. Parse Meetings → video candidates → video archive store
4. Queue transcription (deferred if no provider)
5. Chunk + speaker verify + citation + claim ledger + opposition archive
6. Feed film room + AI Brain rollups

## Transcription strategy

- Provider abstraction: `NOT_CONFIGURED` | `OPENAI` | `DEFERRED`
- No fabricated transcripts
- All segments `needsHumanReview: true`

## Speaker identification strategy

Multi-signal: chair recognition regex, bill number mentions, presentation window, sponsor metadata, diarization label if available. Only `SPEAKER_CONFIRMED` + human review → usable quote path.

## Implementation plan (P4)

Phases 2–15 as specified: registry, discovery, video store, transcription contract, sponsor detector, chunker, speaker verification, claim binding, film room 2.0, admin UI, scripts, tests, external video contract doc.
