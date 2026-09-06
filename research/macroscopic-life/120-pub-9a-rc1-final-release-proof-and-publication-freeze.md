# Macroscopic Life — PUB-9A

## RC1 Final Release Proof + Publication Freeze

**Status: FINAL FREEZE GATE BUILT — FREEZE NOT CLAIMED UNTIL LOCAL PASS**

PUB-9A is the terminal production-engineering gate for Book One RC1.

### Added

- `scripts/freeze-book-one-rc1.mjs`
- `scripts/run-pub-9a-final-freeze.ps1`
- `release/BOOK-ONE-PUBLICATION-FREEZE-POLICY.md`

### Required chain

PUB-9A runs the figure recovery/R3 closure gate, reruns the complete RC1 assembly gate, then requires:

- `RELEASE_CANDIDATE_READY`;
- Figures 2–16 verified R3, 15/15;
- post-injection manuscript integrity PASS;
- 45/45 exact unique endnote anchors;
- no release artifact drift from the hashes recorded by RC1.

Only then does it create:

`release/book-one-rc1-freeze-record.json`

with status `FROZEN`.

### Run

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9a-final-freeze.ps1
```

### Current truth

The freeze machinery is committed. This connector has not run the H-drive production chain and therefore **Book One RC1 is not claimed frozen yet**.

### What changes after PASS

The project exits manuscript/research engineering. The next work is export and publication production: page design, PDF/EPUB/print packaging, accessibility, front matter, metadata, web/print proof, and distribution preparation.

No additional global research pass, architecture pass, chapter rewrite, or figure redesign is authorized by default after freeze.

### Next phase

**PUB-9B — Publication Export Architecture + Print/EPUB/Web Production Plan**

Build the shortest production path from frozen RC1 to professional reader deliverables while preserving one canonical text and one canonical figure set across formats.
