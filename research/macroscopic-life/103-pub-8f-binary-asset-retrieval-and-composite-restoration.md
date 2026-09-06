# Macroscopic Life — PUB-8F

## Binary Asset Retrieval + Deterministic Composite Restoration

**Status: RECOVERY PASS COMPLETE AT REPOSITORY/CONTROL LEVEL**

This pass does not redesign Figures 2–16. It determines what is actually recoverable from the repository, protects the frozen production lineage, and defines the only permitted path from recovered visual composition to publication asset.

---

## 1. Recovery finding

The repository contains the production lineage for the frozen figure sequence: build specifications, controlled generative revisions, hostile scientific/visual reviews, deterministic copy locks, and final-composite instructions.

The repository does **not** presently expose a complete set of final binary publication images for Figures 2–16 under the canonical public asset path.

Therefore:

- the visual concepts are **not lost**;
- the scientific/compositional decisions are **not open for redesign**;
- a missing binary must not be confused with a missing figure design;
- the live deterministic SVG remains the safe fallback until the exact approved binary/composite is restored;
- no substitute generative image may silently take the place of the frozen approved composition.

---

## 2. Canonical recovered locks

### Figure 2
Final hostile-review lineage: `FIG-02-V4-FINAL-HOSTILE-REVIEW.md`

Commit: `786b9dec0e763906198954c8b6b5b2b723321730`

Recovered status: **scientific + visual composition locked; deterministic finish required.**

The review explicitly states that the v4 image is the canonical visual reference and that generated prose/numbers must be replaced or verified in deterministic production.

### Figure 3
Final hostile-review commit: `681159c5f3cc2b988c58d52627b48d749e695027`

Recovered status: **final hostile-review lineage recovered.**

### Figure 4
Final hostile-review commit: `ce516935f999e52decc3e2561a048f5896e5383c`

Recovered status: **final hostile-review lineage recovered.**

### Figure 5
Final hostile-review commit: `90e4dccf0e90471190b73968634df982b6ddde73`

Recovered status: **final hostile-review lineage recovered.**

### Figure 6
Final hostile-review commit: `c276a9e9ba211a07c487d70379625b734898780a`

Recovered status: **final hostile-review lineage recovered.**

### Figure 7
Final lock commit: `76149c8c8ce1ee9c61fb2cb03ee9e925a57de9bc`

Recovered status: **scientific + visual composition locked; no V4 concept generation required.**

### Figures 8–15
The production/recovery audit established that these figures have frozen review/composite lineages in `research/macroscopic-life/visuals/`. Their production status is governed by the final hostile-review and composite-lock files, not by the temporary web asset manifest.

Figure 15 is especially important because its production record documents a final V3 composition while also documenting that the generated binary itself was not necessarily stored in GitHub. This establishes the recovery doctrine for the entire set: **generation/composition provenance and binary storage are separate facts.**

### Figure 16
The publication canon is frozen in the manuscript/figure control system. Its required closing sequence is:

> **LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.**
>
> **EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.**
>
> **MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.**

No replacement visual may alter or obscure this sequence.

---

## 3. Binary recovery classes

Every figure must be assigned exactly one of these states during asset restoration:

### R0 — CONTROL RECOVERED / BINARY NOT LOCATED
The frozen design, review, and deterministic copy are known, but the exact approved image binary has not been located.

Action: keep deterministic SVG fallback live. Search local working copies, prior exports, conversation/image-generation downloads, build artifacts, and archival storage. Do not regenerate by default.

### R1 — CANDIDATE BINARY LOCATED
A likely original binary has been found, but its relationship to the frozen final review has not been proven.

Action: compare against final hostile-review composition, panel architecture, crop safety, and deterministic-copy instructions. Do not publish yet.

### R2 — APPROVED BASE COMPOSITION VERIFIED
The binary matches the frozen approved composition closely enough to serve as the visual base.

Action: remove/cover AI-rendered scientific prose and numbers where required; rebuild canonical labels deterministically.

### R3 — PUBLICATION COMPOSITE VERIFIED
Approved base composition + deterministic scientific text + final caption/alt text + crop/screenshot safety + print/web export proof.

Action: publish and mark `publication-ready` in the site asset manifest.

---

## 4. Canonical public asset contract

Publication composites belong at:

`public/macroscopic-life/figures/fig-02.webp`

through:

`public/macroscopic-life/figures/fig-16.webp`

The existing React/SVG figure remains the fallback and scientific reference layer until the corresponding asset reaches R3.

The presence of a file at the expected path is **not** sufficient to declare it publication-ready. The manifest status must only be changed after R3 verification.

---

## 5. Deterministic composite rule

A recovered generative image is a **visual base**, not canonical scientific text.

The deterministic layer owns:

- figure title/subtitle;
- scientific labels;
- test names;
- axes and units;
- legends;
- evidence state;
- quantitative statements;
- scientifically meaningful arrows where the generated base is ambiguous;
- caption;
- caveat/brake language;
- final locked propositions.

No publication figure may rely on AI-rendered text as canonical scientific text.

---

## 6. Recovery search order

When binary access is available outside the GitHub text connector, search in this order:

1. current RedDirt working tree and ignored/untracked Macroscopic Life asset directories;
2. local downloads/exports created during the Figure 2–16 production sessions;
3. image-generation output/download history from those sessions;
4. alternate branches/worktrees and stashes;
5. GitHub issue/PR user-image attachments if any were used;
6. CI/Netlify/GitHub Actions artifacts if the assets were ever built or packaged;
7. archival/cloud folders used for the project.

A newly generated approximation is **not** part of the recovery search order.

---

## 7. Verification checklist for each recovered binary

Before R2:

- correct figure number;
- correct frozen version/composition;
- correct panel architecture;
- no missing scientific mechanism central to the final review;
- no rejected mystical/pseudoscientific visual language reintroduced;
- no obsolete generated wording treated as final copy;
- no misleading detached crop;
- no unverified generated number promoted into canonical content.

Before R3:

- deterministic typography complete;
- exact frozen brake language complete;
- quantitative copy verified or removed;
- labels adjacent to potentially misleading false-color/schematic imagery;
- caption complete;
- alt text complete;
- web crop proof complete;
- mobile proof complete;
- print-resolution proof complete;
- screenshot safety complete.

---

## 8. Current release decision

**DO NOT REGENERATE FIGURES 2–16.**

**DO NOT MARK MISSING BINARIES AS LOST DESIGNS.**

**DO NOT MARK AN ASSET `publication-ready` MERELY BECAUSE A FILE EXISTS.**

The frozen figure system is recoverable because the scientific and visual decisions were preserved in the repository. Binary retrieval is now an asset-recovery operation, not a creative-design operation.

---

## 9. Next production gate

**PUB-8G — Recovered Asset Intake + R0/R1/R2/R3 Figure Ledger**

The next gate should inventory each of Figures 2–16 individually and record:

- frozen final-review file/commit;
- approved generative/compositional version;
- generation/output identifier where preserved;
- binary located: yes/no;
- binary location;
- recovery class R0/R1/R2/R3;
- deterministic overlay status;
- web proof status;
- print proof status;
- publication-ready decision.

That ledger becomes the sole authority for promoting assets into the live publication pipeline.
