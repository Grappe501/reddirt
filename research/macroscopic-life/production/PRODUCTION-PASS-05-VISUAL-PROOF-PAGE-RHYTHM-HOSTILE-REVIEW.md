# PRODUCTION PASS 05 — VISUAL PROOF / PAGE-RHYTHM HOSTILE REVIEW

**Baseline proof:** `research/macroscopic-life/production/proofs/MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2.pdf`

**Frozen structural baseline commit:** `1adb5dce2b62323115fe4c675444608112f17243`

**Pass 04 freeze commit:** `fbfc20593aff5b7c468a9163b79d4bd39e0f52e1`

**Status: ACTIVE — VISUAL PRODUCTION GATE**

Date: 2026-09-07

## Mission

Production Pass 04 proved that Book One is structurally correct. Production Pass 05 must now determine whether the 180-page 6 × 9 object behaves like a professionally composed nonfiction book when encountered page by page.

This is not a prose-development pass and not another figure-anchor pass. The manuscript, chapter order, fifteen conceptual figure anchors, and protected Chapter 16 aperture are frozen. Pass 05 attacks presentation: reading rhythm, typography, page geometry, heading behavior, whitespace, density, page turns, figure-slot balance, and the visual continuity of the argument.

A structurally valid PDF can still be a bad book object. This pass exists to find those failures before artwork integration or release-candidate composition makes them expensive.

## Non-negotiable freeze

Pass 05 may not repair visual defects by casually editing frozen Reader prose.

The following remain locked unless a separately documented P0 production blocker proves reopening necessary:

- Chapters 1–16 and their order;
- Chapter 17 exclusion;
- the protected Chapter 16 final aperture;
- all fifteen Figure 02–16 conceptual anchors;
- substantive scientific claims and qualification language;
- Model A / Model B / Model C distinctions;
- frozen Reader v0.4 prose.

Visual problems should first be solved through composition variables: page breaks, keep-with-next behavior, widow/orphan control, paragraph spacing, heading spacing, figure sizing, caption geometry, allowable figure-page movement after the locked anchor, front/back matter breaks, and related typesetting rules.

## Hostile review doctrine

Do not ask whether a page is technically acceptable. Ask whether a demanding editor, book designer, scientist, or reader could point to the page and say that the production machinery is visible.

Every suspicious page must be classified. Do not silently repair pages without recording why they failed.

Severity:

- **P0** — publication blocker: missing/cropped/overlapping material, unreadable text, broken page geometry, structural corruption, protected text loss.
- **P1** — professional-quality blocker: severe orphan/widow, stranded heading, gross density imbalance, broken figure relationship, accidental blank/near-blank page, visually absurd page turn.
- **P2** — visible quality defect worth correcting: awkward whitespace, weak chapter-opening rhythm, poor paragraph/page balance, caption pressure, repeated mechanical pattern.
- **P3** — preference/polish only; do not destabilize the proof to chase it.

## Gate 1 — page geometry

Inspect all 180 pages for:

- 6 × 9 trim consistency;
- content outside safe text area;
- clipping or overlap;
- inconsistent margins;
- running elements entering text;
- accidental blank or near-blank pages;
- pages whose text block visibly jumps relative to surrounding pages.

Any geometry corruption is P0.

## Gate 2 — paragraph endings and beginnings

Audit every page transition for reader-hostile fragmentation.

Flag:

- one-line paragraph remnants at page tops;
- one-line paragraph beginnings stranded at page bottoms;
- single short lines separated from the paragraph body;
- page turns that interrupt a deliberately compact logical unit when a production adjustment could prevent it;
- repeated short-fragment pages that make continuous prose look like stacked statements rather than a book.

The governing principle is reading continuity, not merely classical typography terminology.

## Gate 3 — heading control

Every heading must earn the material beneath it.

Reject:

- a section heading as the last meaningful item on a page;
- a heading followed by only one line of body prose;
- a heading crowded against preceding prose;
- a heading with excessive dead space beneath it;
- inconsistent heading hierarchy or spacing;
- chapter/part headings whose visual treatment looks accidental.

Use keep-with-next and controlled page breaks before changing prose.

## Gate 4 — page-density rhythm

The v0.2 structural inspector already identified density extremes. Pass 05 must distinguish intentional low-density pages from accidental ones and determine whether high-density pages remain comfortable at final trim.

Known low-density candidates from v0.2 include pages 1, 4, 2, 97, 99, 22, 52, 35, 5, 134, 3, 21, 123, 122, 51, and 180. Many may be intentional title/part/opening pages. Each must be classified rather than automatically repaired.

Known high-density candidates include pages 171, 65, 174, 179, 157, 30, 158, 11, 27, 32, 56, 57, 54, 12, 177, 119, 59, 10, 55, and 66.

Review those pages first, then inspect the complete book so the audit does not become threshold-only.

## Gate 5 — chapter-opening rhythm

Inspect all sixteen chapter starts:

`1:6, 2:15, 3:23, 4:29, 5:36, 6:43, 7:53, 8:64, 9:76, 10:87, 11:100, 12:110, 13:124, 14:135, 15:145, 16:155`

Questions:

- Does each opening clearly feel like a chapter opening?
- Is the first body paragraph positioned consistently?
- Does a figure landing on or near the opening overwhelm the chapter hierarchy?
- Does the facing-page relationship feel intentional?
- Are short preceding chapter tails creating ugly transitions?
- Does the opening rhythm become monotonous or mechanical across sixteen chapters?

## Gate 6 — part-transition rhythm

Inspect all part pages and adjacent pages. A part divider should create intentional breathing room, not look like missing content.

Confirm part naming/order independently because the v0.2 extraction reported repeated Roman numerals in its raw `part_pages` field. Determine whether this is merely extraction behavior or a visible labeling defect. Any actual visible mislabeled Part is P0/P1 depending on effect.

## Gate 7 — figure-slot page balance

Structural placement is frozen, but visual behavior is not.

Inspect Figure 02–16 slots at pages:

`02:8, 03:9, 04:14, 05:18, 06:25, 07:29, 08:37, 09:43, 10:68, 11:85, 12:91, 13:109, 14:113, 15:153, 16:165`

For each figure evaluate:

- visual dominance relative to prose;
- whitespace above/below;
- whether the page reads in the intended order;
- whether the figure splits a paragraph or argument unnaturally;
- whether the following page begins awkwardly;
- whether a one-page anchor-to-figure offset remains visually coherent;
- whether the eventual caption has enough room without crushing body text.

Do not move a figure before its locked conceptual anchor.

## Gate 8 — facing-page / spread audit

Review the book as spreads, not just isolated pages.

Look for:

- two extremely dense facing pages creating a wall of gray;
- two sparse pages creating accidental emptiness;
- chapter or part openings on visually weak sides;
- a figure facing another visually dominant page;
- headings mirrored in ways that look algorithmic;
- abrupt changes in text-block depth.

A book is experienced as a sequence of spreads.

## Gate 9 — front and back matter

The beginning and ending of the object require their own rhythm.

Audit title/front matter for intentional recto/verso behavior, hierarchy, blank-page purpose, and transition into Part I / Chapter 1.

Audit the end matter for a controlled transition out of Chapter 16. The final aperture must retain rhetorical breathing room and must not be visually buried by notes, production debris, or an awkward page break.

## Gate 10 — readability at physical trim

The proof must be judged at actual 6 × 9 scale, not merely enlarged on a monitor.

Check:

- body type comfort;
- line length;
- leading;
- paragraph differentiation;
- heading contrast;
- footnote/endnote readability where applicable;
- figure/caption minimum readable size;
- visual fatigue across consecutive dense pages.

Do not approve merely because text can be read at 150–200% zoom.

## Required audit output

Produce a page-level defect ledger with at least:

`page | spread | chapter/part | element | severity | defect | proposed production repair | structural-freeze risk | status`

Also produce:

1. complete P0/P1 list;
2. P2 polish queue;
3. chapter-opening matrix;
4. figure-page visual matrix;
5. density-extreme classifications;
6. spread-level problem list;
7. front/back matter verdict;
8. explicit statement that no frozen prose or anchor was changed unless separately authorized.

## Pass criterion

Production Pass 05 passes only when:

- P0 = 0;
- P1 = 0;
- all 180 pages have been represented in the visual audit, directly or through a deterministic page/spread inspection workflow;
- all sixteen chapter openings are approved;
- all fifteen figure slots are visually approved as production containers;
- the final Chapter 16 aperture has acceptable visual breathing room;
- remaining P2/P3 issues are either corrected or explicitly accepted;
- Pass 04 structural gates remain green after any production-code changes.

## Mandatory regression

After every composition repair batch, rerun the complete v0.2 structural hostile gate. A visual improvement that breaks an anchor, loses protected prose, duplicates a figure, introduces Chapter 17, or creates a blank page is a regression and must be rejected.

## Execution sequence

1. Render or rasterize the current v0.2 proof into page images/contact sheets suitable for visual inspection.
2. Run deterministic geometry/density/heading/page-transition heuristics to create a suspicion queue.
3. Review high-risk pages first: density extremes, chapter openings, part transitions, figure pages, Chapter 16 tail.
4. Review every remaining spread.
5. Write the page-level defect ledger before repairs.
6. Repair P0/P1 defects in small production-code batches.
7. Recompose proof.
8. Rerun structural hostile gate.
9. Re-run visual inspection on changed pages plus adjacent spreads.
10. Resolve or consciously accept P2/P3 findings.
11. Freeze the successful visual proof as the next production baseline.

## Current disposition

> **PASS 05 IS OPEN. PASS 04 v0.2 REMAINS THE FROZEN STRUCTURAL BASELINE.**

The next engineering action is to build the visual-inspection workflow and generate the first complete page/spread defect ledger. Do not begin by rewriting manuscript prose.