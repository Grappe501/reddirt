# Macroscopic Life — PUB-9C-R11

## 46-Slot Exact-Anchor + Endnote Architecture

**Status: STATIC ARCHITECTURE BUILT — EXACT PHYSICAL ANCHORS NOT YET CLAIMED**

This pass retires the legacy 45-slot architecture from the revised-book path without deleting its historical records.

## New controls

### `book-one-endnote-insertion-manifest-pub-9c-v1.0.json`

Defines exactly **46** endnote slots. Notes 1–45 preserve their historical numbering. New note **46** belongs to Chapter 12 and carries the new consciousness-theory burden through BIB-032 and BIB-033.

The number is appended rather than renumbering Chapters 13–16. This preserves all previously assigned scholarly identifiers while allowing the revised Chapter 12 topic to be sourced.

### `book-one-exact-endnote-anchor-manifest-pub-9c-v1.0.json`

Defines 46 fresh anchor records, all intentionally `OPEN-EXACT-ANCHOR` until the revised master physically exists.

No old anchor SHA is inherited.

Note 46 includes only a preferred anchor seed, not a fabricated exact anchor:

> `Contemporary consciousness science contains competing theories emphasizing different mechanisms or signatures`

The full verbatim sentence and SHA must be taken from the physical revised master during reconciliation.

### `validate-pub-9c-46-slot-architecture.mjs`

Static validator requires:

- insertion slotCount = 46;
- anchor slotCount = 46;
- exactly 46 unique note IDs;
- complete IDs 1 through 46;
- exactly 46 unique chapter-slot assignments;
- Note 46 assigned to Chapter 12;
- Note 46 mapped to BIB-032 and BIB-033;
- consciousness amendment physically contains both authority IDs;
- historical anchor manifest still identifies itself as the old 45-slot architecture if present.

## Important numbering doctrine

The new consciousness note is **46**, even though it appears in Chapter 12 before notes 36–45 in reader order.

This is a deliberate stability choice: historical note identifiers 1–45 are preserved rather than renumbered after a late controlled manuscript amendment.

Publication rendering may display the stable scholarly IDs as assigned. If strict sequential first-appearance numbering is later required by the final book format, that must be a separate deterministic remapping pass with a crosswalk; it must not silently change the research control IDs.

## What is not claimed

- revised master materialized locally;
- 46 exact anchors resolved;
- 46 anchor hashes generated;
- markers injected;
- endnoted revised master generated;
- post-injection integrity PASS;
- RC1 ready.

Those require the physical checkout.

## Next gate

**PUB-9C-R12 — Revised-Master Exact Anchor Reconciliation + 46-Note Injection Harness**

The next tooling should operate only after R10 materializes the physical revised master. It must resolve all 46 anchors against that exact file, support multiple authorities per note, replace the staged `[12.4]` token deterministically, and prove reader-prose round-trip integrity after injection.
