# PRODUCTION PASS 04 — 6×9 STRUCTURAL PROOF HOSTILE REVIEW

**Proof:** `research/macroscopic-life/production/proofs/MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.1.pdf`

**Status: REJECT — ONE P1 PLACEMENT ARCHITECTURE FAILURE**

Date: 2026-09-07

## Executive verdict

The first composed proof successfully establishes that the frozen Book One manuscript can be materialized into a complete 6 × 9 book object. The PDF exists, is 180 pages, contains all sixteen chapters, contains all expected figure placeholders, contains no Chapter 17, and has no detected blank or near-blank pages.

The manuscript itself is not the problem.

The proof is rejected because the compositor does not yet obey the locked figure-placement architecture. It inserts all figures assigned to a chapter at the first section boundary. That is unacceptable for a book in which figures are scientific arguments tied to specific conceptual anchors.

This is a production-code defect, not a prose defect.

## PASS — complete book object

The structural inspector reports:

- 180 pages;
- Chapters 1–16 all present;
- no missing chapter;
- no Chapter 17;
- all expected numbered figure placeholders present;
- no blank or near-blank pages detected.

Chapter starts:

`1:6, 2:15, 3:23, 4:29, 5:36, 6:43, 7:53, 8:64, 9:76, 10:87, 11:100, 12:110, 13:124, 14:135, 15:145, 16:155`

## PASS — protected Chapter 16 aperture remains in frozen Reader v0.4

The deterministic PDF inspector originally reported:

`final_aperture_present=False`

That result is **not evidence of a manuscript loss**. Direct inspection of the frozen Reader v0.4 confirms the protected final aperture is present immediately before the Notes:

> **If individuality can be reorganized across levels, what determines where a new individual can—and cannot—emerge?**

The false negative is therefore an extraction/Unicode normalization limitation in the current inspector. The next inspector revision must normalize Unicode dashes/whitespace before testing protected prose.

No manuscript reopening is authorized.

## P1 — figure-placement architecture is not being honored

Current v0.1 placeholder pages include:

- Figures 02, 03, and 04 all on page 7;
- Figure 05 on page 15;
- Figure 06 on page 23;
- Figure 07 on page 29;
- Figure 08 on page 36;
- Figure 09 on page 43;
- Figure 10 on page 65;
- Figure 11 on page 86;
- Figure 12 on page 98;
- Figure 13 on page 109;
- Figure 14 on page 122;
- Figure 15 on page 154;
- Figure 16 on page 166.

The current compositor inserts a chapter's assigned figure block after the first `###` section heading. That implementation was sufficient only to prove that figure slots could survive pagination. It is not sufficient for publication composition.

The locked Production Pass 02 map says figures must appear at their specific conceptual anchors. This is especially obvious in Chapter 1:

- Figure 02 follows the nonhuman-senses sequence before the transition to instruments;
- Figure 03 follows the sustained temporal-mismatch argument;
- Figure 04 belongs late in the chapter after nested-scale intuition has been established.

Putting Figures 02–04 together near the beginning destroys the designed argument sequence.

## Required repair

Build **6×9 structural proof v0.2** with independent placement triggers for every numbered figure.

The compositor must stop using `chapter -> first section boundary` as the placement rule.

Use the locked placement map as authority:

- 02 — Ch1 nonhuman senses → before instruments;
- 03 — Ch1 temporal mismatch discussion;
- 04 — Ch1 late nested-organization / above-organism-scale movement;
- 05 — Ch2 scale transitions / candidate higher-level units before search discipline mistakes cooperation for discovery;
- 06 — Ch3 after map-line insufficiency, near formal boundary tests;
- 07 — Ch4 near frequency/resonance/electricity language discipline;
- 08 — Ch5 after higher-level variables, before central-controller temptation;
- 09 — Ch6 near worked recovery/regulation example before stronger agency language;
- 10 — Ch8 immediately after `Event A → persistent state M → later response difference`;
- 11 — Ch9 after the anticipation ladder is established;
- 12 — Ch10 after system-level tradeoffs before transition to choice;
- 13 — Ch11 after paragraph ending `Those functions can be investigated without first settling whether the swarm, colony, or another boundary should count as one biological individual.` and before `That is the next boundary we have to cross.`;
- 14 — Ch12 after `More Than One Individual`, paragraph ending `At larger scales that discipline becomes essential, because ambiguity otherwise favors whatever conclusion we already wanted.` and before `Many Becoming One`;
- 15 — Ch15 after strongest rival/model stack before selection-as-builder pivot;
- 16 — Ch16 after forest transition/model-comparison machinery and before `No Staircase to Earth` / final body-return movement.

Where a conceptual placement rule is not represented by a single exact frozen sentence, the production compositor may use a named section-boundary anchor only after the relevant prose has been identified in Reader v0.4. It may not guess by chapter order alone.

## Inspector repair

The v0.2 inspector must:

1. normalize Unicode with NFKC;
2. normalize em/en dashes and PDF extraction variants;
3. collapse whitespace before protected-aperture comparison;
4. report the extracted final Chapter 16 tail for deterministic audit;
5. verify each figure appears in the expected chapter and after its specified anchor;
6. retain 6 × 9 page-size, chapter-count, Chapter 17, blank-page, and text-density checks.

## P0/P1 matrix

PDF exists — PASS.

6 × 9 trim — PASS by compositor design; retain explicit inspection.

Sixteen chapters — PASS.

Chapter 17 absent — PASS.

Protected final aperture in frozen Reader — PASS.

Protected final aperture PDF-extraction check — INSPECTOR REPAIR REQUIRED.

All expected figure slots exist — PASS.

Figure slots in correct chapters — PASS.

Figure slots at locked conceptual anchors — **P1 FAIL**.

Figure 14 V3 used — PASS: no artwork inserted; V3 remains prohibited.

Frozen prose modified to fix layout — PASS: no prose edits authorized or required.

Blank pages — PASS.

Actual artwork legibility — NOT YET TESTABLE; final image binaries are not repository assets.

Visual page-level hostile proof — NOT YET COMPLETE.

## Disposition

> **PRODUCTION PASS 04 / PROOF v0.1: REJECTED AS A PUBLICATION PROOF, ACCEPTED AS A SUCCESSFUL STRUCTURAL PIPELINE PROTOTYPE.**

The proof has done its job: it exposed a real layout-engine defect before final figures were inserted.

Next production object: **MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2.pdf**, with anchor-aware figure placement and normalized protected-text inspection.
