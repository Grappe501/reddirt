# Macroscopic Life — PUB-6G Figure Production and Export Gate

## Status

PUB-6G — FIGURE PRODUCTION SYSTEM: LOCKED

**Important:** PUB-6B through PUB-6F created the scientific and narrative specifications for the figure set. They did **not** create final publication assets. PUB-6G defines the production system that converts those specifications into the actual figures.

No figure may be marked `FINAL` merely because an image has been generated.

---

# 1. Canonical Figure Inventory

## Act I — The World We Cannot See
- Figure 1 — The Embedded Observer
- Figure 2 — Same Landscape, Different Worlds
- Figure 3 — The Clock Is Another Sense

## Act II — When Many Become One
- Figure 4 — The Civilization Inside Your Skin
- Figure 5 — The Ladder of Individuality
- Figure 6 — Where Does the Individual End?

## Act III — The Body Knows More Than the Cell
- Figure 7 — The Body Electric
- Figure 8 — No Cell Holds the Blueprint
- Figure 9 — Rebuilding What Is Missing
- Figure 10 — Memory Is a Physical Consequence of the Past
- Figure 11 — Living Ahead of Now

## Act IV — When the Network Begins to Think
- Figure 12 — No Neuron Knows Your Name
- Figure 13 — The Nervous System We Built Outside Ourselves
- Figure 14 — Civilization Under the Organism Test
- Figure 14A — Earth at Night, De-Anthropomorphized — optional

## Act V — We Are the Microbe
- Figure 15 — The Beautiful-Idea Trap
- Figure 16 — The Macroscopic Life Test Matrix
- Figure 17 — Evidence That Would Move the Needle
- Figure 18 — Nested Without Diminishment
- Figure 18A — The Research Program — optional foldout/appendix candidate

**Core set:** 18 figures.

Optional figures 14A and 18A are not required for the first publication build unless layout review demonstrates that they materially improve comprehension.

---

# 2. Production Principle

These are not decorative AI illustrations.

They are **scientific communication assets**.

The correct production model is hybrid:

1. diagram architecture and scientific content are human/author controlled;
2. generative image tools may create selected illustrative components or backgrounds;
3. labels, arrows, scales, legends, taxonomies, matrices, and causal structure remain deterministic/editable;
4. every final figure is checked against the manuscript claim it accompanies;
5. no generated visual detail is treated as evidence.

---

# 3. Shared Visual System

## Tone

**Awe under restraint.**

The reader should feel that ordinary biology is stranger and more profound than intuition suggests, without the book visually advertising mysticism.

## Style

- modern scientific editorial illustration;
- documentary/scientific realism where anatomy or organisms matter;
- clean systems diagrams where mechanism matters;
- subtle field-notebook influence for annotations;
- generous negative space;
- limited visual clutter;
- no science-fiction HUD aesthetic;
- no psychedelic cosmic-energy aesthetic.

## Visual hierarchy

Each figure should have, where appropriate:

1. figure number/title;
2. primary visual claim;
3. explanatory labels;
4. legend/key;
5. brake/boundary note when misinterpretation risk is high;
6. manuscript caption.

## Recurring semantic conventions

Use consistent visual distinctions for:

- physical matter flow;
- energy flow;
- information/signal flow;
- regulatory feedback;
- boundary;
- uncertainty/speculation;
- local state;
- system-level state.

The exact production palette may be selected during asset construction, but semantic meaning must remain consistent across all acts.

---

# 4. Master Asset Structure

Recommended repository structure:

```text
research/macroscopic-life/visuals/
  specs/
  working/
  review/
  final/
  source/
  captions/
  manifests/
```

For each figure:

```text
fig-01-embedded-observer/
  fig-01-spec.md
  fig-01-source.*
  fig-01-working.png
  fig-01-review.png
  fig-01-final.png
  fig-01-final.svg        # when diagram/vector appropriate
  fig-01-print.tif        # only if required by final publisher workflow
  fig-01-alt-text.md
  fig-01-provenance.md
```

Do not require every format for every figure. Vector-first diagrams should preserve SVG/PDF-capable source; raster illustrations should preserve the highest-resolution source available.

---

# 5. Figure Production Workflow

Every core figure moves through these states:

`SPEC LOCKED → SOURCE BUILD → COMPOSITE → SCIENCE REVIEW → CLAIM REVIEW → ACCESSIBILITY REVIEW → EXPORT → HOSTILE REVIEW → FINAL`

## Gate A — Spec lock

The corresponding PUB-6B–6F specification exists and the figure's scientific job is explicit.

## Gate B — Source build

Create the underlying diagram/illustrative components. Generated imagery is permitted here but must not contain final scientific labels relied upon for accuracy.

## Gate C — Composite

Assemble image, diagram, arrows, labels, scales, legends, and explanatory notes.

## Gate D — Science review

Check anatomy, mechanisms, units, relationships, terminology, species examples, chronology, and scientific boundaries.

## Gate E — Claim review

Ask: **Does the picture claim more than the chapter does?**

If yes, revise the picture even if it is visually beautiful.

## Gate F — Accessibility review

- readable typography;
- adequate contrast;
- meaning not encoded by color alone;
- useful alt text;
- legible at intended print size.

## Gate G — Export

Create publication-ready output from approved source.

## Gate H — Hostile review

PUB-6H attacks the final figures for pseudoscientific implication, analogy leakage, visual overclaiming, and scientific ambiguity.

Only then can the asset be `FINAL`.

---

# 6. Export Standard

Until a specific publisher imposes different requirements, use these working targets:

## Raster

- master kept at highest practical resolution;
- target at least 300 ppi at intended print dimensions for continuous-tone imagery;
- lossless PNG for working/editorial review where appropriate;
- TIFF only when required by publication workflow;
- avoid repeated lossy recompression.

## Vector

- preserve editable vector source for diagrams;
- SVG for repository/web workflows where practical;
- print PDF/EPS equivalent may be produced at book-layout stage if required.

## Text

- final labels should be vector/editable whenever practical;
- never depend on AI-generated embedded text;
- spell-check every label independently of image generation.

## Color

- master can remain in a broad digital color workflow until publisher/printer requirements are known;
- test grayscale readability;
- do not encode scientific category by hue alone.

---

# 7. AI-Generated Component Rules

Generative image tools can be useful for:

- conceptual nested-scale scenes;
- atmospheric but restrained backgrounds;
- organism/environment illustrations;
- non-data-bearing visual metaphors;
- selected anatomical or naturalistic base imagery that will be independently checked.

They should **not** be trusted to generate:

- accurate scientific labels;
- quantitative axes;
- molecular structures requiring precision;
- anatomical details without review;
- taxonomic relationships;
- data charts;
- causal arrows;
- mathematical notation;
- measurement scales;
- the Macroscopic Life scoring matrix.

Those components should be constructed deterministically.

---

# 8. Provenance Ledger

Every final figure gets a provenance note recording:

- figure number/title;
- specification source;
- production date/version;
- whether generative tools were used;
- what portions were generated;
- what portions were manually/deterministically constructed;
- scientific sources used to validate content;
- known simplifications;
- reviewer status;
- final asset filenames.

This protects the project from losing track of how a visually persuasive scientific claim was constructed.

---

# 9. Caption and Alt-Text Gate

Every core figure requires two separate text artifacts.

## Caption

Explains what the reader should conclude and, where necessary, what the figure does **not** establish.

## Alt text

Describes the meaningful visual structure so a reader who cannot see the image can recover the argumentative function of the figure.

Alt text should not merely repeat the caption.

---

# 10. Production Order

Do not build the figures randomly.

Recommended production sequence:

### Batch 1 — Establish visual language
1. Figure 1 — The Embedded Observer
2. Figure 7 — The Body Electric
3. Figure 14 — Civilization Under the Organism Test
4. Figure 16 — The Macroscopic Life Test Matrix

These four deliberately span the book's major visual modes: conceptual illustration, biological mechanism, comparative systems assessment, and deterministic framework diagram.

Once these four visually agree, lock the production language.

### Batch 2 — Act I + Act II
Figures 2–6.

### Batch 3 — Act III
Figures 8–11.

### Batch 4 — Act IV
Figures 12–13, then optional 14A decision.

### Batch 5 — Act V
Figures 15, 17, 18, then optional 18A decision.

---

# 11. Completion Dashboard

At PUB-6G creation:

- figure specifications: **18/18 core — LOCKED**
- shared visual system: **LOCKED**
- production workflow: **LOCKED**
- export requirements: **LOCKED pending publisher-specific overrides**
- provenance standard: **LOCKED**
- captions conceptually specified: **18/18**
- final rendered core figures: **0/18**
- hostile-reviewed figures: **0/18**

This status is intentional and must remain honest. A specification is not a rendered asset.

---

# 12. PUB-6G Acceptance Gate

PUB-6G is complete when:

- the canonical 18-figure core inventory is fixed;
- all figure specs have a common production system;
- production states and review gates are explicit;
- deterministic vs generative responsibilities are separated;
- export standards are defined;
- provenance and accessibility requirements are defined;
- the first four-figure style-lock batch is identified.

## Result

**PUB-6G establishes the factory. It does not falsely mark unrendered figures as complete.**

The immediate production task after this gate is to create the Batch 1 assets — Figures 1, 7, 14, and 16 — then use those to lock the visual language before rendering the remaining fourteen core figures.
