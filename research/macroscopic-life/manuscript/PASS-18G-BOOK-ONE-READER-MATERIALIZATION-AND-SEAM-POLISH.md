# PASS 18G — BOOK ONE READER MATERIALIZATION AND SEAM POLISH

## Status

**COMPLETE**

Reader object:

`research/macroscopic-life/manuscript/BOOK-ONE-READER-MATERIALIZED-v0.2.md`

Reader blob at materialization:

`352704b601addb61e6596d28a0581474c563c94e`

Materialization commit:

`0a72fcf7c035d1c1e88865f0226279ab8c7bc693`

Assembly workflow result:

**SUCCESS**

## What changed

Pass 18G creates a publication-reader layer above the frozen research sources. It does not rewrite canonical chapter source files.

The reader layer now:

1. preserves the sixteen-chapter architecture;
2. preserves the four-part structure;
3. renders Chapter 4 as **The Verb** and Chapter 11 as **The Choice**;
4. removes recognized prefreeze/freeze/pass-control sections from the reader stream;
5. removes production phrases such as `This manuscript is NOT FROZEN` and `Required next gate` from the reader stream;
6. preserves chapter prose and approved figure callouts/captions;
7. extracts chapter-local endnotes from the chapter-to-chapter reading stream;
8. collects those notes in Book One back matter under chapter-keyed headings;
9. preserves the provenance-rich canonical assembled object separately;
10. leaves every frozen/pre-freeze canonical source untouched.

## Two-object architecture

Book One now intentionally has two different assembled objects.

### Canonical provenance assembly

`BOOK-ONE-CANONICAL-ASSEMBLED-v0.1.md`

Purpose: preserve the literal canonical-source composition, including research apparatus where present.

### Reader materialization

`BOOK-ONE-READER-MATERIALIZED-v0.2.md`

Purpose: provide the continuous reader-facing manuscript in which chapter endings hand directly into the next chapter and scholarly apparatus is moved to back matter.

The reader object is derivative. Canonical sources remain authoritative for provenance, claim verification, and any future repair.

## Deterministic reader gates

The assembly workflow now proves:

- exactly 16 chapter headings;
- exactly four Part headings;
- no Chapter 17;
- Chapter 4 = **The Verb**;
- Chapter 11 = **The Choice**;
- a Book One `NOTES` back-matter section exists;
- Chapters 7–16 each receive a chapter-keyed notes heading;
- prefreeze/freeze control headings do not leak into reader prose;
- `Required next gate` does not leak into reader prose;
- `This manuscript is ... not frozen` does not leak into reader prose.

Workflow conclusion: **PASS**.

## Seam result

The largest Pass 18F seam defect is repaired.

Reader order is now:

`chapter ending → chapter break → next chapter opening`

rather than:

`chapter ending → endnotes → prefreeze controls → build instructions → next chapter opening`.

This exposes the intended chain of questions across the second half of the book:

`signal → memory → anticipation → goal → choice → individuality → reproduction → inheritance → selection → transition`.

## Compression disposition

Pass 18F authorized a possible 3–5% compression of repeated doctrine only if it could be done without casually mutating frozen source prose.

Pass 18G deliberately does **not** perform silent prose compression. The first and highest-value reader compression came from removing non-reader production apparatus from the main stream and relocating notes. This produces a materially cleaner reading experience while preserving canonical prose exactly.

Any further body-prose compression must therefore be done as an explicit, auditable reader-overlay/copyedit pass with before/after provenance. It may not be hidden inside the assembler.

That is the safer publication architecture.

## Reader-layer doctrine

The reader layer may perform only publication-safe transformations unless a later controlled pass explicitly authorizes prose edits:

- heading normalization;
- authorized title-only changes;
- Part divider insertion;
- apparatus relocation;
- production-control suppression;
- publication formatting;
- explicitly manifested copyedits.

It may not silently change scientific claims.

## Remaining risks

No architecture rebuild remains.

The main remaining publication risks are:

1. true body-prose repetition across Chapters 7–16;
2. final bibliography/endnote consistency and numbering/formatting;
3. figure placement against the reader object;
4. final copyedit for punctuation, capitalization, heading consistency, and references;
5. final hostile proof of the actual reader materialization.

## Readiness

Canonical chapter sources: `██████████ 100%`

Canonical source manifest: `██████████ 100%`

Scientific chapter freezes: `██████████ 100%`

Whole-book doctrine reconciliation: `██████████ 100%`

Whole-book architecture/seams: `██████████ 100%`

Canonical assembled object: `██████████ 100%`

Reader materialization: `██████████ 100%`

Production-control removal: `██████████ 100%`

Back-matter notes extraction: `██████████ 100%`

Reader deterministic gates: `██████████ 100%`

Body-prose compression/copyedit: `░░░░░░░░░░ 0%`

Final apparatus/source lock: `░░░░░░░░░░ 0%`

Final publication hostile proof: `░░░░░░░░░░ 0%`

## Final disposition

> **PASS 18G — COMPLETE.**

> **BOOK ONE NOW HAS A CLEAN, DETERMINISTIC 16-CHAPTER READER MANUSCRIPT.**

> **CANONICAL RESEARCH SOURCES REMAIN UNTOUCHED.**

Next recommended pass:

`PASS 18H — READER-LEVEL REPETITION COMPRESSION AND COPYEDIT OVERLAY`

This should be surgical, auditable, and limited to reader-level prose repetition and copyediting. It must not reopen the scientific architecture.
