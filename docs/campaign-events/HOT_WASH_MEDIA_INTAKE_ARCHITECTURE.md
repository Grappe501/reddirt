# Hot Wash media intake architecture

**Lane:** `RedDirt`  
**Operator routes:** Event drilldown Hot Wash tab · `/admin/campaign-events/media-approval`  
**Storage root:** `data/campaign-events/media/` (gitignored except `.gitkeep`)

---

## Goals

1. Attach photos, videos, speeches, and documents to calendar events after they occur.
2. Keep uploads in **pending** folders grouped by **uploader** until the campaign manager approves.
3. Never merge pending files into the official **county archive** without approval.
4. Scaffold transcription, chunking, public link upload, and SEO-facing publish for later passes.

---

## Data model

Index file: `data/campaign-events/media/media-index.json`

Each item (`HotWashMediaRecord`) includes:

- Event linkage: `eventRecordId`, `eventTitle`, `eventDate`, `county`, `countySlug`, `city`
- Uploader: `uploaderName`, `uploaderEmail`, optional `uploaderPhone`, `uploadSource`
- File: `originalFilename`, `storedPath`, `mimeType`, `mediaType`
- Workflow: `approvalStatus` (`pending` | `approved` | `rejected` | `needs_review`)
- Pipeline (scaffolded): `transcriptionStatus`, `chunkingStatus`, `countyArchiveStatus`
- Future: `detectedPeople`, `aiEventMetadata` (empty this pass)

Hot Wash **text notes** live on the ledger fact card as `_hotWash` (not in the media index).

---

## Folder layout

Deterministic builder: `src/lib/campaign-events/media/media-path-builder.ts`

| Status | Pattern |
|--------|---------|
| Pending | `{countySlug}/{YYYY-MM-DD}/{eventSlug}/pending/{uploaderSlug}/{file}` |
| Approved | `{countySlug}/{YYYY-MM-DD}/{eventSlug}/approved/{file}` |
| Rejected | `{countySlug}/{YYYY-MM-DD}/{eventSlug}/rejected/{file}` |

Unknown county → `unknown-county/`.

Uploads **never** land directly under `approved/` on intake.

---

## Admin upload flow

1. Open `/admin/campaign-events/{recordId}` → **Hot Wash** tab.
2. Use **Admin upload** (multipart server action `uploadHotWashMediaAction`).
3. File written under `pending/{uploaderSlug}/`; index appended with `approvalStatus: pending`.
4. Panels show counts by type: photos, videos, speeches, documents, uploader groups, pending, approved archive.

Preview (images): `GET /api/admin/campaign-events/media/{mediaId}` (admin session required).

---

## Campaign manager approval workflow

Route: `/admin/campaign-events/media-approval`

| Action | Metadata | Files |
|--------|----------|-------|
| **Approve** | `approved`, `countyArchiveStatus: published` | `rename` to `approved/` when safe |
| **Reject** | `rejected`, reason stored | `rename` to `rejected/` when safe; **never delete** |
| **Needs review** | `needs_review` | No move |

If `rename` fails, metadata still updates; UI shows planned `approvedArchivePath`.

---

## Uploader grouping

`loadEventMediaBundle()` groups all items for an event by `uploaderName|uploaderEmail`.  
Hot Wash **Uploader submissions** panel lists each group; pending queue shows uploader on every card.

---

## Public upload (future)

Scaffold page: `/campaign-events/upload/[eventToken]`  
Design doc: `HOT_WASH_PUBLIC_UPLOAD_FUTURE.md`

Not enabled this pass (no token issuance, no anonymous upload API).

---

## Transcription and chunking roadmap

Per-item fields exist; UI shows disabled actions on Hot Wash tab:

1. Transcribe speech (audio/video)
2. Extract quotes · summarize remarks
3. Chunk into AI knowledge base
4. Attach to county / event memory
5. Auto county archive (only after CM approval + future automation gate)

See `HOT_WASH_TRANSCRIPTION_CHUNKING_ROADMAP.md`.

---

## AI tool catalog

Added under lifecycle **Hot Wash / Learning** in `ai-tools-supplement.ts`:

- `hotwash-media-upload` (functional)
- `hotwash-video-intake` (partial)
- `hotwash-speech-transcription` (scaffolded)
- `hotwash-content-chunker` (scaffolded)
- `county-media-archive-publisher` (partial)
- `uploader-grouping-tool` (functional)
- `campaign-manager-media-approval` (functional)
- `event-memory-builder` (scaffolded)
- `county-memory-builder` (scaffolded)

---

## Local run

From `RedDirt/`:

```bash
npm run dev
```

1. Log in at `/admin/login` (`ADMIN_SECRET` in `.env`).
2. Open workbench → event → drilldown, or `/admin/campaign-events/{recordId}`.
3. Hot Wash tab → upload a test image (no real PII in smoke tests).
4. Open `/admin/campaign-events/media-approval` → approve or reject.
5. Confirm files under `data/campaign-events/media/` and `media-index.json`.

---

## Out of scope (this pass)

- Public unauthenticated upload links
- Video/speech transcription
- Vector DB chunking
- Automatic county-folder publishing without CM
- Cloud storage migration
- Face/person identification in images (metadata fields reserved)
