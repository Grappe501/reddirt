# Macroscopic Life — PUB-8L

## Deterministic Composite Builder + R2 → R3 Proof Harness

**Status: PRODUCTION HARNESS BUILT**

PUB-8L converts a visually verified R2 base into a controlled proof package and refuses publication promotion until every R3 condition is explicitly satisfied.

This pass does not redesign Figures 2–16 and does not auto-promote any figure.

---

## 1. New production assets

### Deterministic proof-copy register

`research/macroscopic-life/visuals/figure-r3-proof-copy-v1.json`

This contains the frozen Figure 2–16 version/lock commit and required scientific brake/firewall copy used during final proof.

### Builder + proof harness

`research/macroscopic-life/scripts/build-and-proof-figure-publication-composite.ps1`

The script:

1. requires a Figure 2–16 number and R2 base image;
2. records SHA-256 provenance;
3. copies the approved base into an isolated proof workspace;
4. emits deterministic required-copy sidecars;
5. creates a normalized WebP proof candidate when ImageMagick is installed;
6. records eight mandatory R3 proof gates;
7. refuses publication promotion if any gate remains open;
8. can copy the verified asset into `public/macroscopic-life/figures/fig-XX.webp` only after all gates pass;
9. never declares the live asset manifest publication-ready on its own.

---

## 2. Mandatory R3 gates

Every figure must independently pass:

- deterministic typography verified;
- scientific labels verified;
- quantitative copy verified or removed;
- alt text verified;
- web proof verified;
- mobile proof verified;
- screenshot safety verified;
- print proof verified.

If any condition is false, state remains:

**R2-PROOF-INCOMPLETE**

If all conditions pass and a normalized WebP exists, the proof package may reach:

**R3-CANDIDATE**

Only explicit `-Promote` after all proof flags copies the asset to the canonical public path and records:

**R3**

---

## 3. Safety doctrine

R2 means the recovered base composition matches the frozen approved visual.

R3 means the actual publication composite has also survived deterministic scientific-text and output proof.

These are deliberately different gates.

A beautiful R2 base can still fail R3 because of:

- AI-generated text;
- incorrect scientific labels;
- generated or stale quantitative values;
- misleading detached crops;
- mobile illegibility;
- missing alt text;
- inadequate print resolution;
- or an omitted scientific brake.

---

## 4. Example proof command

After Figure 2 has reached R2:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\build-and-proof-figure-publication-composite.ps1 `
  -Figure 2 `
  -BaseImage "C:\path\to\verified\figure-02-v4.png"
```

This creates a proof package but does not publish it.

After every proof item has genuinely been checked, a final operator command can supply the eight verification switches and `-Promote`.

Do not set a verification switch merely to satisfy the script. Each switch represents an actual production review.

---

## 5. Output structure

Proof packages are written under:

`research/macroscopic-life/recovery/r3-proof/fig-XX/<timestamp>/`

Each package contains, as applicable:

- copied approved base;
- normalized WebP proof candidate;
- deterministic copy sidecar;
- `r3-proof-manifest.json`;
- `R3-PROOF.md`.

This provides a durable audit trail from recovered base to publication binary.

---

## 6. Publication path

Only a successful R3 promotion may create/replace:

`public/macroscopic-life/figures/fig-02.webp`

through:

`public/macroscopic-life/figures/fig-16.webp`

The React/SVG fallback remains authoritative until a figure completes this proof path.

---

## 7. Remaining deliberate separation

PUB-8L does **not** automatically modify:

`src/content/macroscopic-life/figure-assets.ts`

That separation prevents an exported file from becoming live merely because it exists.

Manifest promotion should happen only after the R3 proof package is reviewed and committed.

---

## 8. Next production gate

**PUB-8M — R3 Manifest Promotion + Site/Book Asset Reconciliation**

PUB-8M will consume actual completed R3 proof packages, promote only verified figures in the live asset registry, and reconcile the same canonical asset between:

- chapter reader;
- figure index;
- figure theater;
- web release;
- and final Book One production.

Until recovered binaries exist and pass R2/R3, no figure should be falsely marked publication-ready.
