# Evidence Workbench — 10-pass capability upgrade

**Status:** Active  
**Lane:** `RedDirt/` only  
**Goal:** Make the Evidence Workbench + AI tooling the campaign’s most powerful local media confirmation / prep console — without inventing geography or overwriting originals.

**Hard rules (every pass):** No deletes of campaign originals · Unknown stays Unknown unless operator confirms · local write gate · no secrets · no cross-lane imports.

---

## Capability north star (after Pass 10)

| Operator need | Outcome |
| --- | --- |
| Label one event’s stills fast | Multi-select batch metadata + field-level apply |
| Trust AI assistance | Tools ground every suggestion; batch AI proposes, operator commits |
| Prep photos for site / social | Derivatives catalog + promote into placement |
| Prep video for clips | Transcript plans → ffmpeg encode when available |
| Keep albums honest | Batch approval / hold + album refresh once |
| Audit what changed | Batch operation ledger + undo-last-batch |

---

## Pass map

| Pass | Theme | Ships |
| --- | --- | --- |
| **1** | **Batch metadata** | Multi-select photos · field-level apply · shared event fields · one album refresh · AI tool `batch_apply_photo_evidence` |
| **2** | **Batch AI assist** | “Suggest for selection” · shared-event clustering · apply-proposal review before write |
| **3** | **Batch derivatives** | Apply web/thumb/hero/square to N selected · progress + ledger |
| **4** | **Derivative → placement** | Promote a derivative as public `src` override or homepage/hero candidate with preview |
| **5** | **Attention / focus-point crops** | Manual focus point + focus crop kinds · AI cropAdvice → derivative |
| **6** | **ffmpeg foundation** *(this pass)* | Install/detect local ffmpeg under `.local` · poster frames · clip probe |
| **7** | Video clip encode | Export timed excerpts from plans · store under campaign-derivatives |
| **8** | Transcript intelligence | Chapter/quote tools · claim extraction tied to evidence fields · do-not-claim |
| **9** | Batch publish controls | Multi approve / hold / homepage flags · consent-aware · county album bulk refresh |
| **10** | Ops polish | Batch undo · operation history UI · keyboard multi-select · smoke pack · docs lock |

---

## Pass 1 acceptance

- [x] Select multiple filtered photos
- [x] Choose which form fields to apply
- [x] Write overlays for all selected in one action
- [x] Consent hold still blocks public flags without confirmation
- [x] County albums refresh once after batch
- [x] AI catalog includes batch apply tool (gated writes)

## Pass 2 acceptance

- [x] Cluster selection by shared event/date/county cues (local)
- [x] Suggest for selection (AI) proposes shared fields — no auto-write
- [x] Proposal review card with warnings / recommended fields
- [x] Operator explicitly applies proposal or dismisses
- [x] Mixed-geography selections withhold county/city from default apply list
- [x] AI tool `cluster_photo_selection` (read-only)

## Pass 3 acceptance

- [x] Select derivative kinds (web/thumb/hero/square/…) for the current selection
- [x] Create derivatives for up to 40 photos × 4 kinds
- [x] Chunked progress feedback in the workbench
- [x] Batch run recorded in `media-derivatives.json` ledger (`batchRuns`)
- [x] AI tool `batch_create_photo_derivatives` (gated; originals untouched)

## Pass 4 acceptance

- [x] Promote a derivative as `publicSrcOverride` (path-scoped to photo id)
- [x] Optional homepage / featured / hero / approved flags on promote
- [x] Placement preview before/after promote
- [x] Clear override restores registry original src
- [x] Live photo merge applies override for public surfaces
- [x] AI tool `promote_photo_derivative`

## Pass 5 acceptance

- [x] Click photo to set normalized focus point (object-contain aware)
- [x] Persist `focusX` / `focusY` (+ optional cropAdviceNote) on overlay
- [x] Create `focus_hero_16x9` / `focus_portrait_4x5` / `focus_square_1x1` from focus
- [x] Map AI `cropAdvice` → focus crop kind and write derivative
- [x] AI tools `create_focus_crop` + `create_derivative_from_crop_advice`
- [x] Smoke: `scripts/smoke-focus-crop.ts`

## Pass 6 acceptance

- [x] Prefer `H:/SOSWebsite/.local/ffmpeg/bin` (then env / PATH)
- [x] `ensure-local-ffmpeg.cjs` verifies or extracts essentials zip into `.local`
- [x] ffprobe local masters (duration / codecs / optional clip window bounds)
- [x] Extract poster JPEG into `/media/campaign-derivatives/_video/` + ledger `videoPosters`
- [x] Speeches panel: Probe ffmpeg / Probe local video / Extract poster
- [x] AI tools `probe_local_video` + `extract_video_poster`
- [x] Smoke: `scripts/smoke-ffmpeg-foundation.ts`

---

## Tracking

Update this table when each pass lands (commit hash + one-line note).

| Pass | Commit | Note |
| --- | ---: | --- |
| 1 | `2098c843` | Batch metadata: multi-select + field-level apply + AI tool |
| 2 | `5de3a7fe` | Batch AI assist: cluster + suggest-for-selection + proposal review |
| 3 | `efe09c10` | Batch derivatives: kinds × selection + progress + ledger runs |
| 4 | `9099b7fd` | Derivative → placement: publicSrcOverride + homepage/hero promote |
| 5 | `2268ffe3` | Focus-point crops + cropAdvice → derivative |
| 6 | *(pending commit)* | ffmpeg .local detect + poster + clip probe |
| 7–10 | — | — |
