# PRODUCTION PASS 03 — INTERIOR TYPESETTING ARCHITECTURE

**Status: BUILT — READY FOR FIRST COMPOSED PROOF**

Date: 2026-09-06

## Authorities

Reader text:
`research/macroscopic-life/manuscript/BOOK-ONE-READER-MATERIALIZED-v0.4.md`

Front matter:
`research/macroscopic-life/production/PRODUCTION-PASS-01-FRONT-MATTER-AND-PUBLICATION-ARCHITECTURE.md`

Figure placement:
`research/macroscopic-life/production/PRODUCTION-PASS-02-FIGURE-PLACEMENT-MAP.md`

Publication figure register:
`research/macroscopic-life/visuals/BOOK-ONE-PUBLICATION-FIGURE-REGISTER-v2.json`

## Objective

Define the physical reading system before generating a PDF/EPUB. This pass establishes hierarchy, page behavior, figure behavior, notes behavior, accessibility, and proof gates. It does not rewrite Reader v0.4.

## Recommended first print proof

Use a **6 × 9 inch trade trim** for the first composed proof.

Reason: the manuscript is approximately 40,765 words plus notes and contains fifteen landscape-oriented scientific figures. A 6 × 9 proof gives a familiar serious-popular-science page while remaining large enough to test whether figures can survive single-page reduction. This is a proof choice, not yet a permanent commercial trim lock.

If figure legibility fails at 6 × 9, test 7 × 10 before redesigning figures or shrinking text below comfortable reading size.

## Page geometry

First-proof targets:

- trim: 6 × 9 in;
- mirrored margins;
- inside margin: approximately 0.80–0.90 in depending on binding/page count;
- outside margin: approximately 0.65–0.75 in;
- top: approximately 0.70–0.80 in;
- bottom: approximately 0.80–0.95 in;
- body text block should remain visually open rather than textbook-dense.

Exact gutter must be recalculated after final page count and binding choice.

## Body typography

Target character: serious, humane, contemporary popular science.

Use a highly readable serif body face with a broad italic/bold family and strong print rendering. Do not make the book look antique, devotional, futuristic, or like a technical manual.

First-proof targets:

- body: roughly 10.5–11.25 pt depending on chosen face;
- leading: roughly 14–15.5 pt;
- comfortable line length, preferably around 55–70 characters including spaces;
- first paragraph after headings: no indent;
- subsequent body paragraphs: modest first-line indent;
- no extra vertical gap between ordinary body paragraphs;
- block quotations and signature statements handled sparingly.

Do not use all-caps body prose except where the frozen manuscript/figure intentionally requires it.

## Heading hierarchy

### Part opener

New recto page where print geometry permits.

Large Part number/name with generous whitespace and the approved one-line Part divider copy.

No running head on Part opener.

### Chapter opener

New page.

Display chapter number and title with substantial whitespace.

No running head on opening page.

The first paragraph should enter cleanly without a decorative drop cap unless a later proof demonstrates a real benefit.

### H2 section heading

Clear but restrained. Keep with at least two lines of following prose.

Never strand an H2 at page bottom.

### H3

Use only when present/necessary. Visually subordinate to H2.

## Paragraph architecture

The manuscript's paragraph-driven rhythm is protected.

Typesetting must not visually recreate the earlier one-line-paragraph problem by adding excessive space between paragraphs.

Standalone signature lines may receive breathing room, but the compositor must distinguish an intentional signature from an ordinary short paragraph.

Do not convert prose into bullets for visual convenience.

## Running heads

Recommended:

- verso: `MACROSCOPIC LIFE`;
- recto: current chapter title.

Suppress on:

- half title;
- title page;
- copyright;
- epigraph;
- Part openers;
- chapter opening pages;
- intentionally blank pages.

Page numbers may remain on ordinary chapter pages and notes pages. Use restrained folios.

## Figures

Figures 02–16 are governed by the publication figure register.

Rules:

1. place as close as practical to the approved conceptual anchor;
2. never reduce figure text below comfortable print legibility merely to avoid a page turn;
3. prefer full text-block width;
4. if a landscape figure cannot survive portrait-page width, permit a rotated landscape page or dedicated landscape plate rather than destroying readability;
5. keep figure number/caption attached to figure;
6. do not split a figure across pages;
7. do not rewrite frozen figure copy during layout;
8. do not use old Figure 14 V3 or intermediate V4–V7;
9. Figure 14 authority is V8 only;
10. verify grayscale differentiation independently of color.

## Figure captions

Captions should be visually subordinate to body prose but fully readable.

Use a consistent format:

`Figure 14. Complexity, integration, and individuality are different claims.`

followed by the approved explanatory caption where required.

Avoid tiny captions. Scientific caveats in captions are part of the argument, not legal fine print.

## Equations / symbolic doctrine

Expressions such as

`PA = Performance(H) - Performance(B)`

should be set as clean display mathematics when isolated by the manuscript, but the book should not acquire a textbook-equation aesthetic.

Preserve symbols such as `≠`, arrows, and inequality relationships exactly.

Test EPUB fallback for all symbols.

## Notes

Keep scholarly notes in back matter by chapter.

Recommended architecture:

# Notes

## Chapter 1 — The Window

1. ...

## Chapter 2 — The Search

1. ...

and so on.

Note numbers may restart per chapter because the locked apparatus is chapter-local.

For ebook, note markers should link bidirectionally when the production format supports it.

For print, note markers must remain unobtrusive enough not to disrupt popular-science reading.

## URLs / DOI / identifiers

In print notes, prefer DOI identifiers and concise scholarly references over visually disruptive raw tracking URLs.

Do not invent missing publication data.

For EPUB, links may be active while displayed text remains typographically clean.

## Front matter pagination

Use conventional roman numerals for visible front-matter folios if visible folios are desired. Suppress folio display on title/copyright/epigraph as appropriate.

Arabic page 1 should begin with Chapter 1 or Part I according to final design choice. Preferred first proof: Part I is unnumbered display matter; Chapter 1 begins Arabic page 1.

## Widows, orphans, and bad breaks

Final proof must eliminate:

- stranded section headings;
- single-line paragraph widows/orphans where reasonably avoidable;
- signature lines separated from the paragraph they hinge on;
- captions separated from figures;
- notes headings stranded at page bottoms;
- Part title pages landing verso unless intentionally designed;
- accidental blank pages without production purpose.

Do not solve bad breaks by editing frozen prose unless all typographic remedies fail and a reopening rule is explicitly triggered.

## Hyphenation and justification

First proof should test professionally justified body text with controlled hyphenation against ragged-right alternatives.

Preferred target: justified text if spacing remains even and rivers are controlled.

Avoid three or more consecutive hyphenated line endings where possible.

Do not allow aggressive hyphenation of scientific terms merely to improve color.

## Accessibility

Publication proof must include:

- adequate text contrast;
- figure meaning not dependent on color alone;
- grayscale figure proof;
- meaningful EPUB alt text for every figure;
- logical heading hierarchy in EPUB;
- real text rather than rasterized body copy;
- accessible table of contents/navigation;
- Unicode verification for mathematical/scientific symbols.

## EPUB architecture

EPUB should be reflowable rather than a fixed-layout facsimile unless figure behavior forces a publisher-specific exception.

Each chapter should be a logical navigation unit.

Part dividers should appear in the TOC hierarchy but not overwhelm navigation.

Figures should scale responsively with tap/zoom support where reader software permits.

## Print proof sequence

Proof 1 — structural composition:
front matter + all sixteen chapters + notes + figure placeholders/authorized figures.

Proof 2 — visual correction:
fix page rhythm, figure scale, bad breaks, captions, running heads, notes flow.

Proof 3 — hostile print proof:
read at actual size; inspect every figure in grayscale; verify every note marker; inspect first/last page of every chapter and Part.

Proof 4 — release candidate:
only P0/P1 production defects may change.

## No-prose-edit rule

Reader v0.4 is frozen.

The typesetter may adjust:

- line/page breaks;
- typographic quotation/apostrophe forms if meaning is unchanged;
- nonsemantic spacing;
- heading presentation;
- folios/running heads;
- caption placement;
- note-link mechanics.

The typesetter may not silently adjust:

- wording;
- punctuation that changes meaning;
- equations;
- model labels;
- scientific qualifiers;
- signature lines;
- chapter titles;
- final Chapter 16 aperture.

## Acceptance matrix

Publication figure register superseded — PASS.

Figure 14 V8 only — PASS.

Old Figure 14 V3 quarantined — PASS.

6 × 9 first-proof geometry defined — PASS.

Typography hierarchy defined — PASS.

Paragraph architecture protected — PASS.

Running-head behavior defined — PASS.

Figure behavior defined — PASS.

Notes architecture defined — PASS.

Equation/symbol handling defined — PASS.

Accessibility requirements defined — PASS.

EPUB architecture defined — PASS.

Proof sequence defined — PASS.

No-prose-edit rule defined — PASS.

## Disposition

> **PRODUCTION PASS 03 — INTERIOR TYPESETTING ARCHITECTURE: COMPLETE.**

The next production task is to build the **first composed 6 × 9 proof object** from the frozen front matter, Reader v0.4, notes, and publication figure register. That proof should be treated as a layout prototype, not a new manuscript version.