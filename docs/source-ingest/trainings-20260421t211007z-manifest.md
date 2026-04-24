# Source ingest manifest — `Trainings-20260421T211007Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Trainings-20260421T211007Z-3-001` → `Trainings\`  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **72** files — **e-learning export** (“Voter registration” **Rise**/Articulate-style `content\` tree), **PR** HTML + workbook, **two** **`.zip`** archives (~5.4 MB + ~5.6 MB), **many** **AI-labeled** stock images. **47** files live under **`content\lib\`** (player/runtime); **`ingest-campaign-folder`** **skips** these paths by default ([`campaign-folder-skip.ts`](../../src/lib/ingest/campaign-folder-skip.ts) — **`content/lib`**).

**Dry-run ingest:** **Not run** — no **`--dry-run`** on folder ingest.

---

## Inventory by extension (all 72 files)

| ext | count |
|-----|------:|
| `.js` | 27 |
| `.jpg` | 16 |
| `.woff` | 13 |
| `.html` | 6 |
| `.css` | 5 |
| `.zip` | 2 |
| `.pdf` | 1 |
| `.docx` | 1 |
| `.ttf` | 1 |

---

## Files outside `content\lib\` (25) — primary manifest table

*These paths are candidates for `ingest-campaign-folder` (with **`--community-training`**, optional **`--include-zips`**) or **`ingest-briefing-zip`** on individual zips.*

| file_path (relative to `…\Trainings-20260421T211007Z-3-001\Trainings\`) | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|------------------------------------------------------------------------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `volunteer-campaign-content-creation-review-kelly-grappe-campaign-raw-LaOEbzJ2.zip` | `…LaOEbzJ2.zip` | `.zip` | 5614936 | 2026-04-21T21:48:33.595Z | Training export | `ingest-campaign-folder` **`--include-zips`** **or** `npm run ingest:briefings` pattern | **needs_review** | Vendor (Rise/Articulate), license | **PII** in name |
| `Voter registration\Voter reg outline.docx` | `Voter reg outline.docx` | `.docx` | 13691 | 2026-04-21T21:48:33.654Z | Training / field | `ingest-campaign-folder` **`--community-training`** | **needs_review** | Author | Outline doc |
| `Voter registration\content\goodbye.html` | `goodbye.html` | `.html` | 702 | 2026-04-21T21:48:34.095Z | E-learning shell | same | **needs_review** | — | End screen |
| `Voter registration\content\index.html` | `index.html` | `.html` | 197317 | 2026-04-21T21:48:35.126Z | E-learning main | same | **needs_review** | — | Large HTML — course body |
| `Voter registration\content\assets\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 113488 | 2026-04-21T21:48:40.120Z | Stock / AI imagery | same | **needs_review** | **AI** labeling if public | Root assets folder |
| `Voter registration\content\assets\A-diverse-group-of-Arkansa.jpg` | `A-diverse-group-of-Arkansa.jpg` | `.jpg` | 111340 | 2026-04-21T21:48:40.110Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\A-new-voter-who-is-voting-.jpg` | `A-new-voter-who-is-voting-.jpg` | `.jpg` | 62987 | 2026-04-21T21:48:40.129Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\X--YwIWW2oKtJ4Ll1T.jpg` | `X--YwIWW2oKtJ4Ll1T.jpg` | `.jpg` | 179810 | 2026-04-21T21:48:40.100Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\-HfKNT\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 100657 | 2026-04-21T21:48:40.341Z | Stock / AI imagery | same | **needs_review** | same | Subfolder `-HfKNT` |
| `Voter registration\content\assets\41wBBz\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 68492 | 2026-04-21T21:48:40.322Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\53X_Tp\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 80318 | 2026-04-21T21:48:40.307Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\5ALGHp\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 73743 | 2026-04-21T21:48:40.263Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\dE3XVb\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 76216 | 2026-04-21T21:48:40.277Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\IiHn8M\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 95515 | 2026-04-21T21:48:40.292Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\NhBZd_\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 115279 | 2026-04-21T21:48:40.215Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\O8r40Q\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 84538 | 2026-04-21T21:48:40.183Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\s0Irsh\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 107459 | 2026-04-21T21:48:40.163Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\s1sNMC\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 119999 | 2026-04-21T21:48:40.230Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\UlJw7u\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 92966 | 2026-04-21T21:48:40.245Z | Stock / AI imagery | same | **needs_review** | same | |
| `Voter registration\content\assets\xFNAXE\ai-generated-image.jpg` | `ai-generated-image.jpg` | `.jpg` | 65548 | 2026-04-21T21:48:40.197Z | Stock / AI imagery | same | **needs_review** | same | |
| `PR Media List\PR-001.html` | `PR-001.html` | `.html` | 12153 | 2026-04-21T21:48:40.467Z | Comms training | same **or** **`--comms`** | **needs_review** | — | |
| `PR Media List\PR-002.html` | `PR-002.html` | `.html` | 27897 | 2026-04-21T21:48:41.073Z | Comms training | same | **needs_review** | — | |
| `PR Media List\PR-001-intake.html` | `PR-001-intake.html` | `.html` | 45292 | 2026-04-21T21:48:41.199Z | Comms training | same | **needs_review** | — | |
| `PR Media List\PR-Tasks-Workbook.pdf` | `PR-Tasks-Workbook.pdf` | `.pdf` | 14287 | 2026-04-21T21:48:41.222Z | Comms training | same | **needs_review** | — | Small workbook |
| `PR Media List\building-a-local-campaign-press-list-…-raw-giI3wq3x.zip` | `…giI3wq3x.zip` | `.zip` | 5396536 | 2026-04-21T21:48:41.358Z | Training bundle | **`--include-zips`** / briefing zip | **needs_review** | — | PR guide archive |

**Absolute prefix:** `H:\SOSWebsite\campaign information for ingestion\Trainings-20260421T211007Z-3-001\Trainings\`

---

## Skipped by default: `Voter registration\content\lib\` (**47** files)

**`.js`** (27), **`.css`** (5), **`.woff`** (13), **`.ttf`** (1), **`.html`** (1 under `lib\sandbox`). These are **third-party player** assets — **intentionally skipped** in `ingest-campaign-folder` / zip walk unless **`--include-elearning-bundles`** (discouraged in script header).

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Trainings-20260421T211007Z-3-001" --community-training --include-zips` | **Live** **DB**; **skips** `content/lib` **by** **design**. |
| `npm run ingest:briefings` | Use when treating a **single** **`.zip`** like other briefing zips (see script docs). |

---

## Safety

- **No** voter file import from this folder — training only.  
- **AI-generated** imagery — label appropriately for **external** use.  
- **Zip** + **HTML** may embed **tracking** or **external** URLs — review before indexing.
