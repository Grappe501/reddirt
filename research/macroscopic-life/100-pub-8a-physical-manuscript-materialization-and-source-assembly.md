# PUB-8A — PHYSICAL MANUSCRIPT MATERIALIZATION + SOURCE/ENDNOTE ASSEMBLY

**Status:** BUILD INFRASTRUCTURE COMPLETE — MATERIALIZATION COMMAND LOCKED — SCHOLARLY CLOSEOUT QUEUED

## Purpose

PUB-8A converts the canonical five-act reader sequence into one uninterrupted reader manuscript without admitting legacy drafts or appended implementation ledgers.

Canonical control root:

`research/macroscopic-life/manuscript/book-one-master-v1.0-controlled.md`

Materialized output:

`research/macroscopic-life/manuscript/book-one-master-v1.0-reader-materialized.md`

Deterministic builder:

`research/macroscopic-life/scripts/materialize-book-one-master.mjs`

## Canonical inputs — exact order

1. `pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md`
2. `pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md`
3. `pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md`
4. `pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md`
5. `pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md`

No earlier manuscript is permitted as reader prose.

## Materialization behavior

The builder:

- reads the five canonical act files in order;
- begins each source at its reader-facing `# ACT` heading;
- strips appended PUB-7L implementation/editorial notes;
- inserts the locked Book One reader front matter once;
- validates Chapters 1–16 in exact numerical order;
- verifies all Eleven Test names are present;
- verifies the final scientific verdict, Model C verdict, methodological command, and final line;
- refuses to write the output if build-only material leaks into the reader layer.

Run from repository root:

`node research/macroscopic-life/scripts/materialize-book-one-master.mjs`

## Scholarly apparatus assembly

Materialization does not permit citation clutter to re-enter the prose. Source/endnote restoration remains a parallel publication layer.

### Chapters 1–6

Use the PUB-6Y/PUB-6X source architecture as normalized by PUB-7I. Preserve burden classification while resolving the temporary B-label mismatch in favor of the canonical PUB-6X burden scheme.

### Chapters 7–11

Restore sources from frozen chapter manuscripts and source architecture, with independent support where appropriate for:

- bioelectricity and membrane physiology;
- endogenous wound electric fields/electrotaxis;
- morphogenesis and reaction-diffusion;
- salamander and planarian regeneration;
- trained immunity and other physical memory mechanisms;
- plant stress memory where retained;
- circadian organization and prospective prediction.

Do not allow single-lab evidence to carry a broad biological claim where independent literature exists. `Target state`, `positional memory`, and related language must retain the manuscript's operational definitions and uncertainty brakes.

### Chapters 12–14

Restore literature supporting:

- distributed cognition and collective intelligence;
- externalized cognitive function;
- major evolutionary transitions and individuality;
- conflict suppression;
- information-theoretic and relational system variables;
- infrastructure and networked technical-social organization;
- higher-level explanation and intervention while explicitly preserving philosophical disagreement.

Whole-Only Information does not require one privileged information formalism.

### Chapters 15–16

Thesis-bearing factual examples remain traceable. The skeptical prosecution may summarize earlier material without multiplying citations unnecessarily. The Macroscopic Life Hypothesis and Eleven Tests must be labeled as this project's synthesis rather than external scientific consensus.

## Eleven-Test disclosure — mandatory

> **The Eleven Tests are a proposed synthesis for model comparison in this project. They are not a consensus definition of life or biological individuality. Different tests draw on different research traditions, several tests may depend on overlapping mechanisms, and positive results must not be added into an organism score. Their purpose is to make a stronger higher-order-individual hypothesis compete against serious lower-level alternatives and risk failure.**

Canonical dependence remains:

- Cluster A — Boundary Perturbation / Integration Ablation / Repair Autonomy
- Cluster B — Conflict Suppression / Reproduction-Heredity
- Cluster C — Memory Turnover / Prediction Advantage
- Cluster D — Whole-Only Information / Higher-Level Intervention / Model Competition
- Cluster E — Energetic Organization

> **DEPENDENT TESTS MAY STRENGTHEN A MECHANISTIC STORY WITHOUT MULTIPLYING THE EVIDENCE AS IF EACH WERE AN INDEPENDENT OBSERVATION.**

**Model Competition is always required.**

## Figure production gate

The materialized manuscript retains figure insertion markers. Figure bases may be generative, but scientific text, labels, arrows, evidence states, legends, axes, units, captions, caveats, and quantitative statements remain deterministic.

Figure 16 must retain:

- `LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.`
- `EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.`
- `MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.`

`NESTED SCALE ≠ NESTED ORGANISMS` may not displace those frozen locks.

Figure 6's existing figure-canon wording conflict remains a production decision and may not be silently repaired during manuscript assembly.

## PUB-8A gate

PUB-8A is complete only when the deterministic builder has been executed in a repository-capable runtime and the generated materialized manuscript has been committed. This connector pass has written the builder and assembly doctrine to GitHub; it does not falsely claim local execution of the Node materializer.

After execution, the next publication gate is:

**PUB-8B — Source/Endnote Verification + Figure/Caption Proof + Final Reader QA.**
