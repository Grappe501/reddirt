# MACROSCOPIC LIFE — PUB-5A VISUAL PRODUCTION BIBLE & ASSET PIPELINE

## Status

**PUB-5A COMPLETE — VISUAL PRODUCTION PIPELINE LOCKED / PROTOTYPE PRODUCTION UNBLOCKED**

PUB-4 established what Book One's visual system means. PUB-5A establishes how actual visual assets move from specification to publication without losing scientific, epistemic, accessibility, or cross-media integrity.

Governing production rule:

> **No image becomes a book figure merely because it is beautiful. It becomes a book figure only after its claim, evidence class, mechanism, caption, accessibility, provenance, and prohibited inference all survive review.**

---

# 1. PRODUCTION OBJECTIVE

PUB-5 will convert the locked visual architecture into actual assets through a prototype-first pipeline.

We do not mass-produce 45–55 visuals before proving the system.

We first build six prototype families that collectively stress every major requirement:

1. Observer Window — Class A/B
2. Body Electric — Class A, maximum scientific risk
3. Memory Chain — Class B/A
4. Civilization Test — Class B, maximum conceptual risk
5. Eleven Ways to Break Macroscopic Life — Class B / dense information design
6. Intelligent Cell opening + closing pair — Class C, maximum speculative/emotional risk

Only after these survive PUB-5H style lock should the remaining registry scale into production.

---

# 2. ASSET DIRECTORY ARCHITECTURE

Recommended repository structure:

```text
research/macroscopic-life/
  visuals/
    README.md
    registry/
      figure-production-registry.md
      evidence-cards/
    prototypes/
      observer-window/
      body-electric/
      memory-chain/
      civilization-test/
      eleven-tests/
      intelligent-cell-pair/
    production/
      act-1/
      act-2/
      act-3/
      act-4/
      act-5/
    source-material/
      references/
      data/
      rights-ledger/
    exports/
      print/
      ebook/
      web/
      presentation/
      audio-companion/
    archive/
```

No production asset should be stored without a figure ID.

---

# 3. FILE NAMING STANDARD

Canonical base:

`ML-B1-C##-[H|F|S|CARD]##`

Examples:

`ML-B1-C07-F01`

`ML-B1-C14-S01`

`ML-B1-C16-CARD03`

Asset variants append purpose and version:

`ML-B1-C07-F01-master-v01.svg`

`ML-B1-C07-F01-print-v01.pdf`

`ML-B1-C07-F01-web-v01.webp`

`ML-B1-C07-F01-mobile-v01.svg`

`ML-B1-C07-F01-alt-v01.md`

`ML-B1-C07-F01-evidence-card-v01.md`

Never use names such as `final-final2.png`.

---

# 4. SOURCE OF TRUTH HIERARCHY

For every figure:

1. **PUB-2 / v0.4.1 scientific source-of-truth**
2. **PUB-3 / v0.5 publication voice**
3. **PUB-4 figure architecture and epistemic class**
4. **figure evidence card**
5. **master visual asset**
6. **derived exports**

A derived export may never silently alter scientific meaning.

If art conflicts with scientific source-of-truth, art loses.

---

# 5. FIGURE LIFECYCLE

Every substantive figure moves through these states:

**SPECIFIED**
→ **SOURCED**
→ **WIREFRAMED**
→ **DRAFTED**
→ **SCIENTIFIC REVIEW**
→ **REVISION**
→ **ACCESSIBILITY REVIEW**
→ **DETACHMENT / SCREENSHOT REVIEW**
→ **CROSS-MEDIA EXPORT**
→ **FINAL FIGURE LOCK**

No state may be skipped for P0 figures.

---

# 6. FIGURE PRODUCTION REGISTRY

Each figure registry row tracks:

- Figure ID
- Chapter
- Title
- Evidence class
- Speculation distance if Class C
- Priority P0/P1/P2
- Format
- Claim
- Scientific risk tier
- Source status
- Rights status
- Wireframe status
- Draft status
- Scientific review status
- Accessibility status
- Caption status
- Alt-text status
- Screenshot test
- Print export
- Ebook export
- Web export
- Presentation export
- Audio-companion text
- Final lock
- Version
- Notes

Allowed status values:

`NOT STARTED | IN PROGRESS | BLOCKED | REVIEW | REVISE | PASS | LOCKED | REMOVED`

---

# 7. EVIDENCE CARD — REQUIRED TEMPLATE

Every P0/P1 evidence-bearing figure receives:

```text
FIGURE ID:
TITLE:
CHAPTER:
EVIDENCE CLASS: A / B / C
SPECULATION DISTANCE: C1 / C2 / C3 / N/A
PRIORITY:
RISK TIER: RED / AMBER / GREEN

CLAIM SHOWN:
WHAT IS OBSERVED:
WHAT IS MODELED:
WHAT IS SPECULATIVE:

PHYSICAL MECHANISM:
SPECIES / SYSTEM:
PHYSICAL / ORGANIZATIONAL SCALE:
UNITS / QUANTITIES IF RELEVANT:

SOURCE 1:
SOURCE 2:
ADDITIONAL SOURCES:
DATA SOURCE:
IMAGE SOURCE / RIGHTS:

KNOWN SIMPLIFICATIONS:
UNCERTAINTY:
ALTERNATIVE INTERPRETATION:
PROHIBITED INFERENCE:

CAPTION DRAFT:
ALT TEXT DRAFT:
AUDIO DESCRIPTION:

GRAYSCALE PASS:
MOBILE PASS:
SCREENSHOT / DETACHMENT PASS:
SCIENTIFIC REVIEWER:
SCIENTIFIC REVIEW STATUS:
ACCESSIBILITY REVIEW STATUS:
RIGHTS STATUS:
FINAL STATUS:
```

---

# 8. ASSET TYPES

## VECTOR-FIRST

Use for:

- mechanisms;
- flows;
- matrices;
- timelines;
- networks;
- test cards;
- boundary diagrams;
- conceptual systems maps.

Preferred master characteristic: resolution-independent and editable.

## RASTER / ILLUSTRATION

Use for:

- cinematic chapter heroes;
- thought experiments;
- environmental scenes;
- speculative scale transitions;
- textured scientific illustration where vector would become sterile.

Maintain a high-resolution master and separate publication exports.

## HYBRID

Use when a photographic/illustrative base needs scientifically controlled labels, overlays, scale, or epistemic boundaries.

Keep base and overlay logically separable.

---

# 9. GENERATIVE ART POLICY

Generative tools may assist with Class B/C illustration and non-data-bearing visual exploration.

They may not be trusted as a source of scientific anatomy, quantitative geometry, species-specific structures, measured data, or factual labels.

For Class A:

- scientific geometry/mechanism must be independently specified;
- generated imagery is reference/draft material unless verified/redrawn;
- labels and causal relationships must come from the evidence card, not from the image model;
- generated scientific-looking textures never count as data.

For Class C:

- generated art must preserve visible hypothesis status;
- no fake scan/microscopy/satellite-data appearance;
- no invented anatomical `evidence`;
- screenshot test mandatory.

Locked rule:

> **Image generation can propose a composition. It cannot adjudicate a scientific claim.**

---

# 10. SOURCE / RIGHTS POLICY

Every external visual input receives one rights state:

`ORIGINAL | PUBLIC DOMAIN | LICENSED | PERMISSION REQUIRED | REFERENCE ONLY | REJECTED`

Do not assume internet availability equals reuse permission.

For redraws/adaptations:

- record original source;
- record whether factual structure is common scientific knowledge or a distinctive copyrighted expression;
- redraw from underlying facts/data where appropriate rather than tracing distinctive art;
- cite/adapt according to publisher/legal requirements.

Rights review occurs before final lock, not after layout is finished.

---

# 11. DATA VISUALIZATION POLICY

If actual numerical data are plotted:

- preserve source values;
- store source dataset/reference;
- label axes and units;
- do not truncate or transform axes deceptively;
- document transformations;
- distinguish missing values from zero;
- distinguish model output from measurement;
- never invent values to make a conceptual point.

If numbers are not necessary, use qualitative conceptual graphics instead of fake quantitative charts.

---

# 12. ARROW / LINE SEMANTICS

Production legend must remain stable across the book.

Recommended semantic families:

**solid directional arrow** — physical movement/defined flow

**signal arrow** — information/signal transmission

**regulatory connector** — activation/inhibition/constraint; exact symbols defined per figure

**timeline connector** — temporal progression

**dashed hypothesis connector** — proposed/unestablished relationship

No line may mean merely `these things seem related.`

---

# 13. EPISTEMIC BADGES

Book-wide badges:

**OBSERVED**

**MODEL**

**HYPOTHESIS**

Optional context labels:

**THOUGHT EXPERIMENT**

**SPECULATIVE — NOT OBSERVATIONAL EVIDENCE**

Badges must remain readable in grayscale and not depend solely on color.

Class C detached assets should retain status labeling whenever practical.

---

# 14. CAPTION PRODUCTION PIPELINE

Caption is produced alongside the figure, not after art lock.

Caption draft stages:

1. literal description;
2. established mechanism;
3. simplification/uncertainty;
4. chapter relevance;
5. prohibited inference if needed;
6. eighth-grade comprehension edit;
7. scientific reconciliation;
8. final voice edit.

A caption may correct unavoidable simplification.

It may not rescue a fundamentally misleading image.

---

# 15. ALT-TEXT / AUDIO PIPELINE

Every P0/P1 figure receives both:

- concise alt text for visual access;
- expanded audio description when the argument materially depends on layout/relationships.

Audio description should explain information, not decorative appearance first.

Class C audio always identifies speculative status.

No essential scientific argument may exist only in a picture.

---

# 16. REVIEW ROLES

A single person may perform multiple roles during prototyping, but the functions remain distinct.

### VISUAL ARCHITECT

Protects figure purpose and book-wide grammar.

### SCIENTIFIC REVIEW

Checks factual claim, mechanism, scale, terminology, species/system, uncertainty, and prohibited inference.

### SKEPTICAL / HOSTILE REVIEW

Asks how the image could be misread as stronger evidence than exists.

### ACCESSIBILITY REVIEW

Checks grayscale, hierarchy, final-size readability, alt text, mobile adaptation, reading order.

### EDITORIAL REVIEW

Checks caption voice, redundancy with prose, page-turn rhythm, and reader comprehension.

### RIGHTS REVIEW

Checks source, adaptation, license, attribution, and publication rights.

---

# 17. RED-RISK FIGURE GATE

RED figures require two review rounds:

**ROUND 1 — mechanism / claim review before polished art**

**ROUND 2 — hostile review after polished art**

RED includes at minimum:

- membrane potential;
- tissue bioelectricity;
- resonance/frequency if retained;
- aura if retained;
- regeneration/target state;
- collective intelligence flagship;
- whole-only information;
- Earth-at-night broken analogy;
- Civilization Test;
- candidate whole;
- final `we are the microbe` spread.

---

# 18. PROTOTYPE REVIEW SCORECARD

Prototype figures are scored on eight dimensions, each as:

`FAIL | WEAK | PASS | STRONG`

Dimensions:

1. Scientific integrity
2. Evidence-class clarity
3. Eighth-grade comprehension
4. Visual hierarchy
5. Emotional power
6. Accessibility
7. Cross-media resilience
8. Book identity / recognizability

A prototype cannot style-lock with a FAIL in any dimension.

Scientific integrity and evidence-class clarity must be at least **STRONG** for RED-risk prototypes.

---

# 19. MASTER STYLE TARGET

The production style remains:

> **documentary science + field notebook + modern systems map + restrained cosmic scale**

Desired emotional experience:

> **evidence pinned to the wall of an investigation whose room keeps getting larger.**

Avoid:

- corporate infographic polish;
- generic textbook clip art;
- sci-fi HUDs;
- psychedelic mysticism;
- glossy `future technology` clichés;
- childish educational cartooning;
- sterile academic diagrams with no narrative hierarchy.

---

# 20. VISUAL DENSITY RULE

A page does not earn a figure merely because a figure was planned.

During production, consolidate aggressively when:

- two figures teach the same relationship;
- caption repeats nearby prose;
- visual adds decoration but no understanding;
- visual pacing becomes exhausting;
- a full spread is not justified by conceptual importance.

Current registry is an upper production inventory, not a quota.

Target after consolidation remains approximately **45–55 substantive visual moments**.

---

# 21. PROTOTYPE 1 — OBSERVER WINDOW PRODUCTION BRIEF

## Target

`ML-B1-C02-S01`

Purpose:
Establish Book One's signature observer-window grammar.

Must prove:

- Class A examples can coexist with Class B framing;
- sensory/spatial/temporal limits can be understood instantly;
- changing the window does not imply hidden phenomenon exists;
- system can remain visually constant while observer access changes.

Prototype deliverables:

- wireframe;
- master spread;
- print test;
- mobile adaptation;
- alt text;
- evidence card;
- caption;
- screenshot test.

---

# 22. PROTOTYPE 2 — BODY ELECTRIC PRODUCTION BRIEF

## Target

`ML-B1-C07-F01` + possible relationship to `C07-S01`

Purpose:
Prove that invisible electrical biology can look astonishing without mystical visual shorthand.

Must prove:

- membrane potential is physically understandable;
- ions/channels/pumps/gradients are legible;
- near-electroneutral bulk is not misrepresented;
- electricity is not drawn as aura;
- mechanism remains understandable at eighth-grade level.

Mandatory RED review.

---

# 23. PROTOTYPE 3 — MEMORY CHAIN PRODUCTION BRIEF

## Target

`ML-B1-C10-S01`

Purpose:
Prove abstract functional concepts can be visually memorable while implementation differences remain clear.

Locked chain:

**PAST EVENT → PHYSICAL TRACE → PERSISTENCE → RETRIEVAL/REACTIVATION → ALTERED FUTURE RESPONSE**

Must prove:

- functional definition is obvious;
- neural/immune/cellular/external examples do not collapse into one mechanism;
- mobile/audio versions retain sequence.

---

# 24. PROTOTYPE 4 — CIVILIZATION TEST PRODUCTION BRIEF

## Target

`ML-B1-C14-S01`

Purpose:
Prove the book can show civilization's astonishing macroscopic capabilities without visually declaring organismhood.

Must preserve separate columns:

**PROPERTY PRESENT?**

and

**EVIDENCE FOR INDIVIDUALITY?**

Must show weak/unestablished reproduction, heredity, selection, unified action, conflict suppression, and boundary evidence honestly.

No aggregate organism score.

Mandatory RED hostile review after polished art.

---

# 25. PROTOTYPE 5 — ELEVEN TESTS PRODUCTION BRIEF

## Target

`ML-B1-C16-S01` + CARD01–CARD11

Purpose:
Prove dense falsification content can remain inviting.

Every card preserves equal weight for:

**WHAT WOULD STRENGTHEN**

and

**WHAT WOULD WEAKEN**

No `pass = organism.`

Prototype must test:

- spread overview;
- individual card readability;
- mobile stack;
- presentation sequence;
- audio ordering.

---

# 26. PROTOTYPE 6 — INTELLIGENT CELL PAIR PRODUCTION BRIEF

## Targets

`ML-B1-C01-H01`

and

`ML-B1-C16-H01 / final spread`

Purpose:
Prove the opening and ending can deliver emotional scale without presenting the hypothesis as revelation.

Opening emotional state:

**claustrophobic wonder**

Closing emotional state:

**open possibility under disciplined uncertainty**

The compositions must visibly rhyme.

The closing observer gains methods, not supernatural sight.

No outer organism is revealed.

Mandatory RED review.

---

# 27. VERSIONING RULE

Draft versions increment numerically:

`v01, v02, v03...`

A locked figure receives:

`-LOCKED`

Example:

`ML-B1-C07-F01-master-v06-LOCKED.svg`

If scientific meaning changes after lock, reopen versioning rather than silently replacing the asset.

---

# 28. CHANGE CONTROL

Changes are classified:

### TYPE 1 — COSMETIC

Spacing, typography, non-semantic layout.

### TYPE 2 — EXPLANATORY

Label/caption/hierarchy changes without altering scientific claim.

### TYPE 3 — EPISTEMIC

Changes what is observed, modeled, speculative, causal, or inferred.

### TYPE 4 — SCIENTIFIC

Changes mechanism, species/system, quantitative relationship, or scientific conclusion.

Type 3 and 4 changes require renewed evidence-card review.

RED figures require hostile review after Type 3/4 changes.

---

# 29. CROSS-MEDIA EXPORT MATRIX

Each locked P0 figure should produce as applicable:

### PRINT

full-resolution master with final-size readability checked.

### EBOOK

reflow-aware or fixed-layout asset; text remains readable on common screens.

### WEB

responsive asset plus alt text and optional expanded explanation.

### MOBILE

recomposed, not merely shrunk, when complexity requires.

### PRESENTATION

progressive reveal may be used but scientific meaning remains identical.

### AUDIO COMPANION

linear verbal description and optional companion-page reference.

No medium receives a stronger claim than another.

---

# 30. PRODUCTION QA COMMANDMENTS

1. Never draw a conclusion because it looks better.
2. Never let color carry the only distinction.
3. Never invent a number for visual authority.
4. Never use a brain icon to mean intelligence by default.
5. Never use glow to mean energy/bioelectricity/life/consciousness.
6. Never let `emergence` replace mechanism.
7. Never hide an inconvenient weak criterion.
8. Never turn a conceptual boundary into a literal membrane without evidence.
9. Never let an illustration become more certain than its caption.
10. Never let alt text become more certain than the illustration.
11. Never let a mobile simplification change the argument.
12. Never treat generated imagery as scientific evidence.
13. Never let beauty outrank provenance.
14. Never let speculation repair missing data.
15. Never forget that the hypothesis must be able to lose.

---

# 31. PUB-5A COMPLETION GATES

PUB-5A is complete when:

- directory architecture is defined;
- naming/versioning is locked;
- evidence-card workflow is locked;
- source/rights policy is locked;
- generated-art policy is locked;
- figure lifecycle is locked;
- review roles are defined;
- RED-risk double review is defined;
- prototype scorecard is defined;
- six prototype briefs are defined;
- cross-media export matrix is defined;
- change-control rules are defined.

**ALL GATES PASSED AT ARCHITECTURE LEVEL.**

---

# 32. PUB-5A VERDICT

**PRODUCTION BIBLE: COMPLETE**

**ASSET PIPELINE: COMPLETE**

**EVIDENCE-CARD SYSTEM: COMPLETE**

**VERSION / CHANGE CONTROL: COMPLETE**

**PROTOTYPE BRIEFS: COMPLETE**

**PROTOTYPE PRODUCTION: UNBLOCKED**

No final art asset is claimed complete by this pass.

The production doctrine is:

> **Build the image. Attack the claim. Test the medium. Preserve the uncertainty. Then—and only then—lock the figure.**

---

# NEXT

## PUB-5B — THE OBSERVER WINDOW PROTOTYPE

Build the first actual prototype family for `ML-B1-C02-S01`, including evidence card, composition/wireframe specification, final caption, alt/audio description, print/mobile adaptation plan, and prototype review. Where actual graphic production tools are available, begin producing the real prototype asset rather than stopping at another architecture document.