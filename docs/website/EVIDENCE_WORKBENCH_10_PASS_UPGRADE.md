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
| **2** | **Batch AI assist** *(this pass)* | “Suggest for selection” · shared-event clustering · apply-proposal review before write |
| **3** | Batch derivatives | Apply web/thumb/hero/square to N selected · progress + ledger |
| **4** | Derivative → placement | Promote a derivative as public `src` override or homepage/hero candidate with preview |
| **5** | Attention / face-aware crops | Manual focus point + attention crop kinds · AI cropAdvice → derivative |
| **6** | ffmpeg foundation | Install/detect local ffmpeg under `.local` · poster frames · clip probe |
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

---

## Tracking

Update this table when each pass lands (commit hash + one-line note).

| Pass | Commit | Note |
| --- | ---: | --- |
| 1 | `2098c843` | Batch metadata: multi-select + field-level apply + AI tool |
| 2 | shipped | Batch AI assist: cluster + suggest-for-selection + proposal review |
| 3–10 | — | — |
