# Macroscopic Life — Book One Production Plan

## Objective

Turn frozen RC1 into three professional reader surfaces — print/PDF, EPUB, and web — without creating three manuscripts.

## Canonical production chain

**Frozen RC1 → publication source bundle → format adapters → format proofs → cross-format parity proof → distribution package.**

### Phase 1 — Freeze proof

Do not begin export until `release/book-one-rc1-freeze-record.json` exists with `status: FROZEN`.

### Phase 2 — Publication source bundle

Assemble only frozen/verified inputs:

- endnoted reader master;
- final verified bibliography;
- Figures 2–16 from verified R3 registry;
- figure captions/alt-text source;
- publication version metadata.

Keep missing commercial metadata explicitly `OPEN`; never invent ISBN, imprint, price, copyright owner, distributor identifiers, or publication date.

### Phase 3 — Print/PDF

Target a restrained 6 × 9 trade-book interior provisionally. Preserve the deep-navy visual identity primarily in figures/section moments rather than flooding every text page with ink. Reader body should prioritize long-form legibility.

Proof in this order: typography → chapter openings → figures/captions → endnotes → bibliography → running heads/page numbers → widows/orphans → grayscale → final page-by-page hostile review.

### Phase 4 — EPUB

Generate from the same publication source bundle, not from the PDF. Use semantic HTML structure, reflowable body text, responsive figures, linked notes with backlinks, accessible alt text, and a generated navigation document.

### Phase 5 — Web

Treat the existing `/macroscopic-life` reader as a publication surface fed by the same canon. Display publication version, preserve chapter/figure/source deep links, and make mobile reading the primary hostile-review viewport.

### Phase 6 — Cross-format parity

For all three surfaces prove:

- 16 chapters in canonical order;
- exact act/chapter titles;
- 45 scholarly notes represented correctly;
- BIB authority set unchanged;
- Figures 2–16 mapped correctly;
- Eleven Test names unchanged;
- verdict/brake sentences unchanged;
- no format has unique scientific prose.

### Phase 7 — Distribution readiness

Only after content parity passes should we lock commercial/distribution metadata and generate retailer/printer-specific packages.

## Short-bow sequence

1. Freeze RC1 locally.
2. Build publication bundle.
3. Build print/PDF first because fixed layout exposes figure/caption/page problems fastest.
4. Build EPUB from canonical bundle.
5. Reconcile live web reader to frozen version.
6. Run cross-format parity proof.
7. Add approved distribution metadata.
8. Produce final packages.

This sequence deliberately avoids another research or editorial cycle.
