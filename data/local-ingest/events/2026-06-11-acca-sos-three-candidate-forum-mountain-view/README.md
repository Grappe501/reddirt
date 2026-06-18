# ACCA 2026 — SOS three-candidate forum (local drop)

**Event:** Arkansas County Clerks Continuing Education Conference  
**Session:** Secretary of State Candidates Moderated Panel Q & A  
**Date:** Thursday, **11 June 2026**, 1:00–3:00 PM (America/Chicago)  
**Venue:** Ozark Mountain Folk Center, Mountain View, AR  

**Candidates on stage:** Kelly Grappe (D) · Sen. Kim Hammer (R) · Dr. Michael Pakko (L)

## Drop your video here

Copy the recording into **this folder** (same directory as this README):

```
H:\SOSWebsite\RedDirt\data\local-ingest\events\2026-06-11-acca-sos-three-candidate-forum-mountain-view\
```

**Accepted formats:** `.mp4` · `.mov` · `.webm` · `.m4v` · or a `.zip` containing the video

**Suggested filename (optional):**

`2026-06-11-acca-sos-panel-kelly-hammer-pakko.mp4`

Large binaries are **gitignored** — they stay on your machine only.

## 7.5 GB (or any file over ~4 GB)

**Do not use the browser upload** in Forum transcript lab — the web UI caps at 4 GB and loads the whole file in memory.

1. Copy the file into **this folder** (Windows Explorer is fine — 7.5 GB is OK on disk).
2. Install **ffmpeg** on PATH if not already (`ffmpeg -version` in PowerShell).
3. From `RedDirt/` with Docker DB + `.env.local` (`DATABASE_URL`, `OPENAI_API_KEY`):

```powershell
cd H:\SOSWebsite\RedDirt
node scripts/run-with-h-drive-env.cjs npm run forum:ingest-acca-drop
```

This **transcribes in place** — your source MP4 is **never moved or deleted**. Files over 2 GiB skip the Prisma owned-media row (INT4 limit); the forum lab stores the local path and streams video on the Election Plan forum lab page. Whisper chunks audio (~12 min segments), runs v1 + v2 debate analysis, and updates `data/intelligence/forum-transcript-lab.json`.

Transcription may take **30–90+ minutes** for a 2-hour forum depending on chunk count and OpenAI latency.

**Fastest (forum lab — Whisper + debate prep analysis):**

1. Start dev: `npm run dev:full` from `RedDirt/`
2. Open **Admin → Intelligence → Forum transcript lab**  
   `/admin/intelligence/forum-transcript-lab`
3. Upload the file from this folder (or drag the video in the upload box)

**Alternative — index into Media Center (local DB):**

Add to `.env.local` (one line, semicolon if you add more roots later):

```
CAMPAIGN_MEDIA_INDEX_ROOTS=H:\SOSWebsite\RedDirt\data\local-ingest\events\2026-06-11-acca-sos-three-candidate-forum-mountain-view
```

Then from `RedDirt/`:

```bash
node scripts/run-with-h-drive-env.cjs npm run media:index-roots
```

**Alternative — Supabase watcher (if `SUPABASE_URL` + service role are set):**

Set `CAMPAIGN_MEDIA_WATCH_DIR` to this folder and run `npm run ingest:watch`.

## Intelligence manifest

Event metadata lives at `data/intelligence/acca-clerks-summer-conference-2026.json` (`sosCandidatesPanel` block).
