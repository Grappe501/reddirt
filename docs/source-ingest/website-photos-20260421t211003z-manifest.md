# Source ingest manifest — `Website photos-20260421T211003Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Website photos-20260421T211003Z-3-001` → `Website photos\`  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **32** files — **owned media** for web/social: **HEIC** / **JPG** / **PNG** / **JPEG** stills, **two** **QuickTime** **`.mov`** ( **~69.7 MB** + **~8.9 MB** ). **EXIF** / **location** / **device** metadata likely on phone captures.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## Inventory by extension (case as on disk)

| ext (variants) | count |
|----------------|------:|
| `.JPG` | 18 |
| `.HEIC` / `.heic` | 8 |
| `.PNG` | 4 |
| `.MOV` / `.mov` | 2 |
| `.jpeg` | 1 |

**Total size (approx):** ~**107 MB** on disk (dominated by `copy_….mov`).

---

## File inventory

| file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `copy_E0C632F9-5CA8-428F-B51B-C340B470EA9C.mov` | `.mov` | 69698499 | 2026-04-21T21:49:15.198Z | Owned media / video | `ingest-campaign-folder` | **needs_review** | License, subject consent if people featured | **~66.5 MB** — long transcode/embed cost |
| `IMG_1572.heic` | `.heic` | 691170 | 2026-04-21T21:49:13.874Z | Owned media / photo | same | **needs_review** | Photographer / device | |
| `IMG_1573.heic` | `.heic` | 1749049 | 2026-04-21T21:49:14.202Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_2824.JPG` | `.JPG` | 985214 | 2026-04-21T21:49:13.736Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_4103.JPG` | `.JPG` | 235124 | 2026-04-21T21:49:13.792Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_4598.MOV` | `.MOV` | 9324004 | 2026-04-21T21:49:14.308Z | Owned media / video | same | **needs_review** | same | **~8.9 MB** |
| `IMG_5149.HEIC` | `.HEIC` | 1739162 | 2026-04-21T21:49:14.347Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_5166.HEIC` | `.HEIC` | 2243603 | 2026-04-21T21:49:13.985Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_6663.HEIC` | `.HEIC` | 1508348 | 2026-04-21T21:49:13.830Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_6860.PNG` | `.PNG` | 917532 | 2026-04-21T21:49:14.171Z | Owned media / graphic | same | **needs_review** | same | |
| `IMG_6925.JPG` | `.JPG` | 209293 | 2026-04-21T21:49:13.681Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7286.PNG` | `.PNG` | 1145543 | 2026-04-21T21:49:13.907Z | Owned media / graphic | same | **needs_review** | same | |
| `IMG_7385.PNG` | `.PNG` | 1328714 | 2026-04-21T21:49:14.059Z | Owned media / graphic | same | **needs_review** | same | |
| `IMG_7385(1).PNG` | `.PNG` | 1328714 | 2026-04-21T21:49:14.037Z | Owned media / graphic | same | **needs_review** | same | Duplicate byte size vs `IMG_7385.PNG` |
| `IMG_7451.HEIC` | `.HEIC` | 2490213 | 2026-04-21T21:49:14.143Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7771.HEIC` | `.HEIC` | 1905695 | 2026-04-21T21:49:14.015Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7852.JPG` | `.JPG` | 142568 | 2026-04-21T21:49:13.918Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7859.HEIC` | `.HEIC` | 2054871 | 2026-04-21T21:49:13.951Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7898.HEIC` | `.HEIC` | 2296277 | 2026-04-21T21:49:14.092Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7948.JPG` | `.JPG` | 879152 | 2026-04-21T21:49:14.109Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7949.JPG` | `.JPG` | 228728 | 2026-04-21T21:49:13.887Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7950.JPG` | `.JPG` | 143666 | 2026-04-21T21:49:14.320Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7953.JPG` | `.JPG` | 142380 | 2026-04-21T21:49:13.801Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7954.JPG` | `.JPG` | 600646 | 2026-04-21T21:49:13.763Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7955.JPG` | `.JPG` | 320909 | 2026-04-21T21:49:13.718Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7956.JPG` | `.JPG` | 642295 | 2026-04-21T21:49:13.779Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7957.JPG` | `.JPG` | 248196 | 2026-04-21T21:49:13.705Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7958.JPG` | `.JPG` | 407926 | 2026-04-21T21:49:13.749Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7959.JPG` | `.JPG` | 480745 | 2026-04-21T21:49:13.856Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7961.JPG` | `.JPG` | 197986 | 2026-04-21T21:49:14.154Z | Owned media / photo | same | **needs_review** | same | |
| `IMG_7962.JPG` | `.JPG` | 121127 | 2026-04-21T21:49:13.841Z | Owned media / photo | same | **needs_review** | same | |
| `Insta Social SOS Teamplate.jpeg` | `.jpeg` | 165470 | 2026-04-21T21:49:13.694Z | Owned media / social template | same | **needs_review** | Design source | Filename typo **Teamplate** → **Template** |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\Website photos-20260421T211003Z-3-001\Website photos\`

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Website photos-20260421T211003Z-3-001"` | Default **briefing** preset is fine; add **`--comms`** if ops tags as **social** pipeline. Supports **image** + **video** per `ingest-campaign-files-core.ts`. **Live** **DB**. |

**Optional:** `npm run ingest:kellymedia` only if this tree is in scope for that script’s **default** paths (see script — usually **not** this folder unless steered).

---

## Safety

- **Strip or review** **EXIF** before **public** **publish** if policy requires.  
- **Video** and **crowd** photos — **consent** / **event** context as appropriate.  
- **No** voter targeting from media assets alone.
