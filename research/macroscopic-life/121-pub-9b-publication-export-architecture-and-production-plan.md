# Macroscopic Life — PUB-9B

## Publication Export Architecture + Print / EPUB / Web Production Plan

**Status: ARCHITECTURE BUILT — EXPORTS GATED ON RC1 FREEZE**

PUB-9B defines the shortest path from frozen Book One RC1 to professional publication surfaces.

### Added

- `publication/book-one-export-architecture-v1.0.json`
- `publication/BOOK-ONE-PRODUCTION-PLAN.md`
- `scripts/build-publication-source-bundle.mjs`

### Central rule

**One frozen text. One verified figure set. Multiple presentation adapters.**

Print/PDF, EPUB, and web may differ in layout and interaction, but not in scientific prose, citation burden, figure meaning, Eleven Test names, or verdict language.

### Production order

1. RC1 local freeze PASS.
2. Frozen publication source bundle.
3. Print/PDF interior and hostile proof.
4. Reflowable EPUB and accessibility proof.
5. Frozen-version reconciliation of the live web reader.
6. Cross-format parity proof.
7. Approved commercial/distribution metadata.
8. Final publication packages.

### Metadata safety

ISBN, imprint/publisher, copyright owner, publication date, price, and distributor identifiers remain `OPEN` until supplied or explicitly approved. The production system may never invent them.

### Current truth

The export architecture is ready. The publication bundle builder deliberately refuses execution until the local RC1 freeze record exists and every frozen artifact still matches its recorded hash.

### Next gate

**PUB-9C — Print Interior System + PDF Proof Architecture**

Build the fixed-layout book interior system first: trim/grid, typography hierarchy, act/chapter openings, figure placement rules, caption/endnote/bibliography treatments, front/back-matter slots, and automated content-integrity proof. Do not generate a final distribution PDF until RC1 is locally frozen and commercial metadata is approved.
