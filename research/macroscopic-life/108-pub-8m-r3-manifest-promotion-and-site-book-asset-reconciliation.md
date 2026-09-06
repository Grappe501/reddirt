# Macroscopic Life — PUB-8M

## R3 Manifest Promotion + Site/Book Asset Reconciliation

**Status: PROMOTION INFRASTRUCTURE COMPLETE**

PUB-8M establishes one canonical promotion path from a proven R3 figure composite to the public site/book asset system.

---

## 1. Canonical publication registry

Created:

`src/content/macroscopic-life/figure-publication-registry.json`

Figures 2–16 are listed explicitly. Until a figure completes R3, its registry state remains:

`fallback-svg`

with no SHA-256 and no proof-manifest pointer.

The registry is now the authority for whether a frozen publication figure has a verified raster publication asset.

---

## 2. Live asset reconciliation

Updated:

`src/content/macroscopic-life/figure-assets.ts`

The live site now reads Figures 2–16 from the publication registry instead of assuming all final binaries are absent forever.

Behavior:

- `fallback-svg` → deterministic React/SVG figure remains authoritative;
- `publication-ready` → verified R3 asset becomes the canonical public art at the registered path;
- registry carries the promoted binary SHA-256 and its R3 proof-manifest pointer.

Companion Figures 1, 17, and 18 remain outside the frozen Figure 2–16 publication sequence.

---

## 3. R3-to-site promotion tool

Created:

`research/macroscopic-life/scripts/promote-r3-figure-to-site.ps1`

The script refuses promotion unless all of the following are true:

1. proof manifest exists;
2. proof manifest belongs to the requested figure;
3. recovery class is exactly `R3`;
4. `publicationReady=true`;
5. `promoted=true`;
6. deterministic typography PASS;
7. scientific labels PASS;
8. quantitative copy PASS;
9. alt text PASS;
10. web proof PASS;
11. mobile proof PASS;
12. screenshot safety PASS;
13. print proof PASS;
14. promoted binary exists;
15. SHA-256 matches the R3 proof manifest.

Only after all checks pass does the script reconcile the canonical public asset and update the publication registry to `publication-ready`.

---

## 4. Canonical public path

Each promoted Figure 2–16 asset is canonicalized to:

`public/macroscopic-life/figures/fig-XX.webp`

and exposed to the site as:

`/macroscopic-life/figures/fig-XX.webp`

The SHA-256 recorded in the registry must match the actual binary.

---

## 5. No silent replacement

A file appearing in the public directory does not by itself make it canonical.

A figure becomes canonical raster publication art only when:

- the R3 proof manifest passes;
- the binary hash matches;
- the registry is updated to `publication-ready`.

This prevents accidental replacement by stale exports, candidate files, or regenerated approximations.

---

## 6. Frozen scientific copy remains controlling

Raster promotion does not reopen or override scientific canon.

The final figure must preserve the frozen deterministic scientific copy and brakes established by the hostile-review/composite-lock system.

Especially protected:

- Figure 6: **BOUNDARIES CAN BE PERMEABLE WITHOUT BEING MEANINGFUL.**
- Figure 16:
  - **LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.**
  - **EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.**
  - **MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.**

---

## 7. Promotion command

After a figure has a complete PUB-8L R3 proof package:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\promote-r3-figure-to-site.ps1 `
  -Figure 2 `
  -ProofManifest ".\research\macroscopic-life\recovery\r3-proof\fig-02\<timestamp>\r3-proof-manifest.json"
```

Then review and commit:

- the canonical WebP asset;
- `figure-publication-registry.json`;
- the R3 proof package/ledger artifacts intended for source control.

---

## 8. Current truth

At completion of PUB-8M, no Figure 2–16 binary has been promoted merely by building this infrastructure.

Therefore current publication state remains truthful:

```text
Frozen publication figures              15 / 15
Promotion infrastructure                 COMPLETE
R3 figures actually promoted              0 / 15
Conceptual redesign required              0 / 15
SVG fallback preserved                   15 / 15
```

This is the correct state until recovered original binaries are processed through R1 → R2 → R3.

---

## 9. Next gate

**PUB-8N — Figure Production Completion Dashboard + Release Blocking Gate**

Next build should combine R0/R1/R2/R3 state, source/endnote readiness, materialized-manuscript readiness, and figure publication status into one deterministic production dashboard so Book One cannot be accidentally called release-ready while a required production gate remains open.
