# Macroscopic Life — PUB-8I

## Local Workstation Binary Recovery Script + Intake Manifest

**Status: SCRIPT BUILT AND COMMITTED**

This pass adds a safe, read-only recovery scanner for Steve's Windows workstation. It is designed to find candidate original Macroscopic Life Figure 2–16 binaries without modifying any candidate asset.

Script:

`research/macroscopic-life/scripts/recover-figure-binaries.ps1`

---

## What the scanner does

The scanner searches likely binary-bearing locations, including by default:

- `H:\SOSWebsite\RedDirt`
- the current Windows user's `Downloads`
- `Pictures`
- `Desktop`

It recursively inspects image files with these extensions:

- PNG
- JPG / JPEG
- WebP
- SVG
- TIFF / TIF

For each relevant candidate, it records:

- probable figure number where inferable;
- relevance score;
- scoring reasons;
- filename;
- extension;
- byte size;
- last-write timestamp;
- full file path;
- SHA-256 hash.

It ranks candidates using Macroscopic Life keywords, figure-number naming patterns, expected frozen-version hints, likely production-window timestamps, Macroscopic Life paths, and image-file size.

---

## Safety doctrine

The scanner is **read-only with respect to candidate assets**.

It does not:

- move files;
- rename files;
- copy candidate files;
- delete files;
- alter image metadata;
- overwrite recovered artwork;
- change the site's figure manifest;
- promote any candidate to publication-ready.

It only writes recovery reports into the configured recovery directory.

---

## Output

A normal run creates three timestamped reports under:

`H:\SOSWebsite\RedDirt\research\macroscopic-life\recovery`

Outputs:

1. `pub-8i-figure-binary-candidates-<timestamp>.json`
2. `pub-8i-figure-binary-candidates-<timestamp>.csv`
3. `pub-8i-figure-binary-summary-<timestamp>.md`

The Markdown summary gives candidate counts and the highest-ranked candidate for each Figure 2–16.

---

## How to run

From PowerShell on the Windows development machine:

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\recover-figure-binaries.ps1
```

Optional custom roots:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\recover-figure-binaries.ps1 `
  -Roots @(
    'H:\SOSWebsite\RedDirt',
    'C:\Users\User\Downloads',
    'C:\Users\User\Pictures',
    'D:\Archive'
  )
```

---

## Intake doctrine

A high relevance score does **not** mean the image is the approved final asset.

After the scan:

1. compare the top candidates for each figure against the frozen visual/compositional review;
2. verify the approved version (V4/V3/V2 as appropriate);
3. record source path and SHA-256;
4. advance the recovery ledger R0 → R1 only after a plausible candidate is identified;
5. advance R1 → R2 only after visual-composition verification;
6. apply/verify deterministic scientific typography and labels;
7. complete web/mobile/print/screenshot proof;
8. advance R2 → R3;
9. only then mark the live asset `publication-ready`.

---

## Frozen-version hints embedded in the scanner

The ranking logic gives additional weight to the known final production versions:

- Figure 2 — V4
- Figure 3 — V4
- Figure 4 — V4
- Figure 5 — V3
- Figure 6 — V3
- Figure 7 — V3
- Figure 8 — V2
- Figure 9 — V2
- Figure 10 — V3
- Figure 11 — V2
- Figure 12 — V3
- Figure 13 — V3
- Figure 14 — V3
- Figure 15 — V3
- Figure 16 — frozen publication canon

These hints are ranking aids only, not proof of provenance.

---

## Current gate

The scanner has been built, but it has **not been executed on Steve's Windows/H-drive workstation by this GitHub connector**.

No claim is made that local binaries have been found until the generated recovery report is returned and reviewed.

---

## Next production gate

**PUB-8J — Candidate Intake and Visual Provenance Verification**

The next pass begins once the PUB-8I summary/JSON/CSV report is available. It will review candidates figure-by-figure and begin moving exact assets from R0 to R1/R2 without reopening approved designs.
