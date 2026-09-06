# Macroscopic Life — PUB-9C

## Print Interior System + PDF Proof Architecture

**Status: PRINT SYSTEM BUILT — FINAL PDF EXPORT REMAINS GATED**

PUB-9C defines the physical reading system before committing the book to a printer-specific implementation.

### Added

- `publication/BOOK-ONE-PRINT-INTERIOR-SYSTEM.md`
- `publication/book-one-print-layout-contract-v1.0.json`
- `scripts/proof-print-publication-source.mjs`

### Provisional physical direction

6 × 9 inch trade-book interior, single-column long-form reading, cream/white editorial field, restrained deep navy technical identity, and color figures that must remain intelligible in grayscale.

The trim is provisional. Printer-specific gutter, bleed, binding, paper, spine, and production-font choices remain open until the distribution path is selected.

### Deterministic print gate

Before layout, the source proof requires:

- 16 chapters;
- exactly 45 note markers + 45 definitions;
- all Eleven canonical Test names;
- locked verdict language;
- no editorial/build leakage;
- a READY frozen publication source bundle.

### Figure rule

Only verified R3 Figures 2–16 enter the print adapter. Scientific labels, brakes, legends, axes, caveats, and test names may never be cropped for aesthetics.

### Design goal

The body pages should disappear behind the argument. Visual drama is concentrated at act openings and figures rather than turning every page into a poster. The result should feel like a serious scientific field book with moments of scale and wonder.

### Current truth

No final PDF is claimed. RC1 must first pass the local freeze chain, the publication bundle must be built, and the print-source proof must pass.

### Next gate

**PUB-9D — Fixed-Layout Print Adapter + First Interior Proof Build**

Build the actual deterministic adapter that consumes the frozen publication bundle and verified R3 figures, generates a non-distribution interior proof, and emits machine-readable page/figure/note integrity diagnostics for hostile review.
