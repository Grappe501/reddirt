# PRODUCTION PASS 06 — RELEASE PACKAGE PREFLIGHT

Status: ACTIVE / PREFLIGHT LOCKED
Date: 2026-09-07

## Starting authority

Production Pass 06 begins from the frozen Production Pass 05 v0.3 baseline.

Freeze record:

`research/macroscopic-life/production/PRODUCTION-PASS-05D-V03-FREEZE.md`

Freeze commit:

`583c9ba7d66d1912355faf25fd448eda7b2d534b`

Canonical production proof:

`MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3.pdf`

Canonical production state:

- 182 pages
- Chapters 1–16 only
- chapter openings 16/16 approved
- figure containers 15/15 approved
- raw Part-control leaks 0
- P0 blockers 0
- P1 blockers 0
- protected Chapter 16 aperture intact
- Figure 07 locked to the Chapter 4 language/mechanism hinge
- Figure 14 V3 prohibited

The manuscript remains frozen. Production Pass 06 is not a prose-development pass.

## Why Pass 06 exists

The earlier final publication hostile proof identified the remaining work as production rather than manuscript development: publisher-ready styling, print/ebook note verification, image-resolution/color-space/accessibility checks, front-matter decisions, optional bibliography/index work, and final output proofs.

Pass 05 has now completed the 6x9 interior structural and visual proofing stage. Pass 06 therefore converts the frozen interior into a controlled release package without reopening the scientific reader.

## Pass 06 mission

Build and hostile-audit the publication release package around v0.3.

The pass has six controlled workstreams:

### 06A — Canonical asset manifest

Create a machine-readable release manifest identifying the exact frozen source reader, production runner, proof, anchor ledger, figure assets, notes apparatus, front matter, and governing freeze records. Every release artifact must be traceable to this manifest.

### 06B — Figure preflight

Audit every authorized figure used by v0.3 for:

- exact authorized version
- pixel dimensions
- effective print resolution at placed size
- aspect-ratio integrity
- clipping/cropping
- grayscale legibility
- color-space assumptions
- caption identity
- accessibility/alt-text readiness for digital publication

Figure 14 V3 remains prohibited. No older or alternate visual may silently enter the package.

### 06C — Front/back matter release audit

Verify the publication-facing treatment of:

- title page
- copyright/imprint placeholder state
- table of contents if included
- Part dividers
- Notes opener and Notes body
- acknowledgments/author note only if already authorized
- final narrative aperture separation from Notes

No new substantive authorial prose is authorized by this workstream.

### 06D — Print technical preflight

Audit the 6x9 PDF as a physical print object:

- trim size
- page boxes
- margins/gutter safety
- embedded fonts
- image resolution
- transparency/rasterization hazards
- line-art legibility
- page-number consistency
- accidental blank pages
- overprint/color assumptions where detectable
- PDF metadata and output identity

Any production repair must preserve the frozen chapter and figure anchor mappings unless an independently documented physical-production defect makes movement unavoidable.

### 06E — Digital/EPUB readiness map

Do not mechanically convert the book and call it finished. First create the digital transformation contract:

- chapter hierarchy
- Part hierarchy
- figure insertion points
- alt-text requirements
- Notes/endnote linkage
- protected ending treatment
- equations/special characters
- semantic headings
- navigation/TOC requirements
- no raw Markdown/control vocabulary

The EPUB path must be derived from the frozen reader and release manifest, not from PDF text extraction.

### 06F — Release-candidate hostile gate

Before a release candidate can be declared, rerun:

- complete structural regression
- chapter/order gate
- Chapter 17 exclusion
- protected final aperture gate
- all figure-anchor gates
- raw control-marker leak detection
- Notes/back-matter inspection
- print technical preflight
- figure technical preflight
- final rendered spot check

P0 must equal 0 and P1 must equal 0.

## Frozen regression map

Chapter starts:

`1:6, 2:15, 3:23, 4:29, 5:36, 6:43, 7:53, 8:64, 9:76, 10:87, 11:100, 12:110, 13:124, 14:135, 15:145, 16:155`

Figure pages:

`02:8, 03:9, 04:14, 05:18, 06:25, 07:29, 08:37, 09:43, 10:68, 11:85, 12:91, 13:109, 14:113, 15:153, 16:165`

These are regression gates, not layout suggestions.

## Reopening firewall

Pass 06 may not change Reader v0.4 prose merely to improve appearance, density, page count, or release convenience.

A manuscript reopening requires a documented defect that is substantive rather than cosmetic and must identify:

1. the exact frozen language at issue;
2. the scientific/narrative/source defect;
3. why a production-layer repair cannot solve it;
4. the smallest proposed prose change;
5. the regression burden created by reopening.

Absent that record, the Reader remains untouched.

## Pass 06 acceptance standard

Production Pass 06 may close only when:

- canonical release manifest exists and resolves every required asset;
- all 15 authorized figure containers resolve to approved assets;
- no prohibited Figure 14 version is used;
- print technical preflight has no P0/P1 failures;
- front/back matter has no P0/P1 failures;
- digital transformation contract is complete enough to build EPUB without guessing structure;
- v0.3 structural regression remains green;
- protected final aperture remains intact;
- Chapter 17 remains absent;
- raw production/Markdown control leaks equal zero;
- release-candidate provenance is reproducible from repository state.

## Execution order

The shortest safe route is:

`06A asset manifest → 06B figure preflight → 06C front/back matter → 06D print technical preflight → 06E EPUB contract → 06F release-candidate hostile gate`

Do not combine these into one opaque mega-pass. Each workstream should produce its own auditable artifact and commit so a defect can be isolated without destabilizing the frozen book.

## Immediate next slice

**PRODUCTION PASS 06A — CANONICAL RELEASE ASSET MANIFEST**

Inventory and lock the exact source, proof, figure, notes, front-matter, production-script, and provenance assets required to reproduce Book One from the frozen repository state. Identify missing release assets explicitly rather than inventing or silently substituting them.
