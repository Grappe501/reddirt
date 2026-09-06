# MACROSCOPIC LIFE

## PUB-8C — Production Release Candidate

**Status: RELEASE-CANDIDATE PRODUCTION GATE ESTABLISHED**

Book One has completed architecture, scientific hardening, redundancy control, hostile review, source-architecture verification, and figure-doctrine verification. PUB-8C defines the final production package required before a publishable release candidate can be declared complete.

---

# 1. RELEASE-CANDIDATE COMPONENTS

A complete Book One release candidate consists of five synchronized production objects:

1. **Materialized reader manuscript** — one uninterrupted Chapters 1–16 reader file generated from the five canonical PUB-7L R1 acts.
2. **Normalized scholarly apparatus** — final bibliography/endnotes with complete metadata and claim-level traceability.
3. **Final figure set** — deterministic scientific text layered over approved figure bases, with all frozen captions and caveats preserved.
4. **Typeset proof** — reader-facing layout with stable heading hierarchy, figure placement, endnote markers, and display-quote hierarchy.
5. **Release QA report** — one final verification that the typeset object still preserves the scientific and editorial locks.

No component may silently substitute a legacy draft.

---

# 2. MATERIALIZED MANUSCRIPT

Canonical builder:

`research/macroscopic-life/scripts/materialize-book-one-master.mjs`

Target:

`research/macroscopic-life/manuscript/book-one-master-v1.0-reader-materialized.md`

Required properties:

- five acts in canonical order;
- Chapters 1–16 exactly once;
- no PUB-7L implementation notes or editorial ledgers;
- all Eleven Test names intact;
- Chapter 14 mandatory disclosure and dependence warning intact;
- Model C remains current winner;
- plain scientific verdict precedes the closing metaphor;
- final methodological command intact;
- `WE ARE THE MICROBE.` remains the final line.

---

# 3. SCHOLARLY APPARATUS RELEASE STANDARD

Controlling source maps:

- PUB-6X — Eleven-Test genealogy / claim-source architecture;
- PUB-6Y — Chapters 1–6;
- PUB-6Z — Chapters 7–11;
- PUB-7A — Chapters 12–16.

Final bibliographic normalization must resolve, where available:

- author names;
- full title;
- journal/book title;
- year;
- volume/issue;
- page range or article number;
- DOI;
- publisher/edition for books;
- stable official URL only where appropriate;
- access date only for sources that require it.

Source placement must support the narrow claim being made rather than merely the surrounding topic.

---

# 4. FIGURE RELEASE STANDARD

Publication figures remain hybrid production objects:

**Generative / illustrative layer may provide:** visual bases, naturalistic scenes, non-data-bearing conceptual imagery, anatomical/environmental components, and atmosphere.

**Deterministic layer must provide:** titles, labels, scientific arrows, axes, units, legends, evidence states, test names, captions, brakes, and every quantitative statement.

No AI-rendered scientific text is canonical.

All Figures 2–16 must pass detached-image / screenshot safety: a cropped figure must not imply a stronger claim than the full manuscript supports.

Figure 16 must contain:

- `LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.`
- `EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.`
- `MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.`

---

# 5. TYPESET PROOF STANDARD

The typeset proof should preserve the established visual identity:

- deep navy / blue-black scientific field where visual treatment calls for it;
- cream/white editorial typography;
- restrained electric blue and amber/orange accents;
- documentary/naturalistic imagery;
- clean systems diagrams;
- strong serif figure titles;
- modular explanatory panels;
- thin technical rules/connectors;
- high contrast;
- documentary science + field notebook + modern systems map + restrained cosmic scale;
- emotional register: **Awe under restraint**.

Do not introduce psychedelic, mystical, or New Age styling.

Typography must distinguish canonical scientific locks from ordinary rhetorical emphasis. Chapter 15 must not become a wall of equally weighted all-caps declarations.

---

# 6. RELEASE QA — NONNEGOTIABLE SCIENTIFIC LOCKS

The release candidate must preserve:

> **THE MICROBE IS A PERSPECTIVE, NOT A DIAGNOSIS.**

> **INDIVIDUALITY CAN EVOLVE. COOPERATION IS NOT ENOUGH.**

> **FREQUENCY IS A MEASUREMENT, NOT AN EXPLANATION.**

> **A SHARED WORD IS NOT A SHARED MECHANISM.**

> **NO INDIVIDUAL CELL NEEDS TO CONTAIN THE FINISHED BODY FOR THE BODY TO BE RELIABLY BUILT.**

> **THE PAST MATTERS LATER ONLY IF SOMETHING PHYSICAL PERSISTS AND CAN RE-ENTER CAUSAL PROCESSING.**

> **PREPARATION ≠ PREDICTION ≠ FORESIGHT ≠ PROPHECY**

> **THE WHOLE CAN SOLVE A PROBLEM THAT NO SINGLE COMPONENT SOLVES ALONE.**

> **FUNCTIONAL ANALOGY ≠ BIOLOGICAL IDENTITY**

> **WE HAVE SHOWN THAT THE FUNCTIONS CAN SCALE. WE HAVE NOT YET SHOWN THAT THE INDIVIDUAL DOES.**

> **COMPLEXITY ≠ INTEGRATION ≠ INDIVIDUALITY**

> **REAL ORGANIZATION DOES NOT REQUIRE A NEW ORGANISM.**

> **A THEORY THAT CANNOT LOSE IS NOT A SCIENTIFIC THEORY.**

> **EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.**

> **ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.**

> **CURRENT WINNER: MODEL C.**

> **MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.**

> **WE ARE THE MICROBE.**

---

# 7. RELEASE-CANDIDATE STOP RULE

The Book One scientific architecture is frozen.

Any proposed change after PUB-8C must be classified as one of:

- bibliographic correction;
- factual correction;
- figure-production correction;
- copyedit;
- typography/layout correction;
- production bug.

A proposed substantive conceptual rewrite requires explicit reopening of the scientific freeze and cannot be smuggled through production.

---

# 8. DEPLOYMENT / GITHUB RULE

This project is committed through GitHub. If the connected Netlify site is configured to deploy from the repository's default branch, commits to that branch should trigger the configured Netlify build automatically.

A GitHub commit is not, by itself, proof that a Netlify deployment succeeded. Deployment success must be verified from a Netlify deploy result, GitHub deployment/check signal, or the live site.

---

# PUB-8C STATUS

**Architecture:** COMPLETE / FROZEN

**Scientific conclusion:** COMPLETE / FROZEN

**Source architecture:** VERIFIED

**Figure doctrine:** VERIFIED

**Release-candidate production gate:** BUILT

**Materialized manuscript execution:** PENDING repository-runtime execution

**Normalized bibliography/endnotes:** PENDING production normalization

**Final figure assets:** PENDING production proof

**Typeset release proof:** PENDING

**Next production action:** execute materialization, normalize endnotes/bibliography, and begin final figure/typeset production.
