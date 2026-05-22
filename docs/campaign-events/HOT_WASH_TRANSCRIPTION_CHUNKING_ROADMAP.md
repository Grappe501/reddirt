# Hot Wash transcription and chunking roadmap

**Status:** Scaffolded on media records and Hot Wash UI; not implemented.

---

## Pipeline states (per media item)

| Field | Values |
|-------|--------|
| `transcriptionStatus` | `not_started` → `queued` → `complete` \| `failed` |
| `chunkingStatus` | `not_started` → `queued` → `complete` \| `failed` |

---

## Phase 1 — Transcription

- Input: `audio/*`, `video/*`, speech documents
- Output: transcript text stored on media record or sidecar `.txt` next to file
- Human review before chunking
- Tools: `hotwash-speech-transcription` (scaffolded)

---

## Phase 2 — Chunking

- Split transcript + captions into chunks with event/county metadata
- Store in campaign knowledge base (vector DB TBD — not in RedDirt lane without integration packet)
- Tools: `hotwash-content-chunker` (scaffolded)

---

## Phase 3 — Memory attachment

- `event-memory-builder` — approved media + `_hotWash` notes per event
- `county-memory-builder` — roll up county learnings for workbench / AI tools

---

## Phase 4 — Image metadata enrichment (Steve vision)

- On upload: attach event id, title, date, county, city to file metadata
- Future: face / person identification → `detectedPeople[]` (never auto-publish PII without policy)

---

## UI

Hot Wash tab shows disabled buttons for each future action until backend exists.
