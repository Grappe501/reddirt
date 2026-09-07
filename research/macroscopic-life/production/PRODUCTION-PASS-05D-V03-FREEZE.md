# PRODUCTION PASS 05D — v0.3 FREEZE

Status: FROZEN / PASS
Date: 2026-09-07

## Purpose

This record closes Production Pass 05 after the rendered hostile review found one professional-quality blocker in v0.2: raw Reader control markup (`# PART II — THE WHOLE`) printed at the end of Chapter 2 before the designed Part II divider. Follow-up diagnostics also found the same class of raw `# PART` source heading surviving inside Notes.

The repair was made entirely in the v0.3 production runner. Frozen Reader prose, chapter order, scientific claims, figure concepts, figure anchors, and the protected final Chapter 16 aperture were not rewritten.

## Canonical repair

Canonical runner:

`research/macroscopic-life/scripts/build-book-one-proof-v03-runner.py`

Repair commit:

`226478290e70697da131bd3e7558a6181987905c`

The runner suppresses raw top-level `# PART ...` structural source markers from both chapter reading streams and Notes output while preserving the verified Figure 07 Chapter 4 hinge override:

> Nothing about the machine changed while we were talking. Only the verbs did.

No global source/version replacement is permitted.

## Passing build

GitHub Actions run:

`34092195161` — Macroscopic Life Pass 05D.2 Build v0.3 — SUCCESS

Artifact:

`macroscopic-life-pass05d2-v03-proof`

Artifact ID:

`10007228165`

Artifact digest:

`sha256:d9c2b51075347e9b58eb8a4c4a49ea853880da8f9a965246071c44a0c5c0ec21`

Canonical generated proof inside the artifact:

`research/macroscopic-life/production/proofs/MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3.pdf`

Canonical anchor ledger:

`research/macroscopic-life/production/proofs/MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3-ANCHORS.json`

Canonical regression report:

`research/macroscopic-life/production/proofs/MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3-REGRESSION.txt`

## Regression result

The passing run reported:

- page_count = 182
- raw_part_markup_leaks = []
- Chapters 1–16 = PASS
- Chapter 17 absent = PASS
- protected final aperture = PASS
- Figure set 02–16 = PASS
- Figure 07 frozen hinge = PASS
- Part markup suppression = PASS
- overall_status = PASS
- failures = none

The page-count increase from the 180-page v0.2 baseline occurs in Notes/back matter. It does not move any chapter opening or any figure placement. A local full-proof extraction check found no blank pages and no near-blank body pages beyond intentionally sparse front matter / Notes opener.

## Chapter opening regression

All chapter starts remain exactly on their v0.2 pages:

`1:6, 2:15, 3:23, 4:29, 5:36, 6:43, 7:53, 8:64, 9:76, 10:87, 11:100, 12:110, 13:124, 14:135, 15:145, 16:155`

Verdict: 16/16 PASS.

## Figure placement regression

All figure pages remain exactly on their v0.2 pages:

`02:8, 03:9, 04:14, 05:18, 06:25, 07:29, 08:37, 09:43, 10:68, 11:85, 12:91, 13:109, 14:113, 15:153, 16:165`

Verdict: 15/15 PASS.

Figure 14 V3 remains prohibited and is not part of this proof.

## Blank / sparse-page hostile check

Full v0.3 extraction found no pages with fewer than eight extracted characters. Pages below 80 characters were limited to:

- p1 — title page
- p4 — intentional front-matter aperture
- p167 — Notes opener

No accidental blank or near-blank production page was found.

## Visual acceptance

The successful v0.3 artifact rendered all designed Part-transition neighborhoods and the Figure 07 neighborhood. Those rendered pages were visually inspected after regression success.

Approved transition neighborhoods:

- pp21–23 — Chapter 2 ending / Part II / Chapter 3
- pp34–36 — preceding chapter ending / Part III / Chapter 5
- pp51–53 — preceding chapter ending / Part IV / Chapter 7
- pp98–100 — preceding chapter ending / Part V / Chapter 11
- pp122–124 — preceding chapter ending / Part VI / Chapter 13

Figure 07 neighborhood pp28–30 remains visually controlled and the figure remains attached to the frozen Chapter 4 language/mechanism hinge.

The complete Notes section pp167–182 was separately rendered and inspected after the 182-page result surfaced. The Notes opener is intentionally sparse; subsequent Notes pages are dense but readable reference material. The former raw `# PART IV — THE INDIVIDUAL` Notes leak is absent. No new P0 or P1 defect was found.

## Pass 05 closeout

P0 publication blockers: 0

P1 professional-quality blockers: 0

Chapter openings approved: 16/16

Figure containers approved: 15/15

Raw Part control-marker leaks: 0

Protected final aperture: PASS

Chapter 17: ABSENT

Structural freeze regression: PASS

Rendered transition regression: PASS

Notes/back-matter visual regression: PASS

## Freeze rules

v0.3 is now the canonical Production Pass 05 visual baseline.

Do not alter any of the following merely for page appearance:

- Reader v0.4 prose
- Chapters 1–16 or their order
- Chapter 17 exclusion
- protected final Chapter 16 aperture
- Figures 02–16 conceptual anchors
- Figure 07 hinge
- Model A / B / C distinctions
- frozen scientific claim language

Future production work must treat the v0.3 chapter and figure mappings above as regression gates. Any change that moves a frozen anchor or reopens manuscript prose requires an independently documented substantive reason rather than a cosmetic preference.

## Final verdict

**PRODUCTION PASS 05: PASS / FROZEN**

The original v0.2 P1 transition leak is repaired, the analogous Notes-path leak is repaired, all structural and conceptual anchors remain intact, and the resulting 182-page v0.3 object is approved as the next production baseline.
