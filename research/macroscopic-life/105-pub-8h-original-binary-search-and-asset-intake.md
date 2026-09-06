# Macroscopic Life — PUB-8H

## Original Binary Search / Asset Intake Audit

**Status: REPOSITORY + FILE-LIBRARY SEARCH COMPLETE**

This pass searched the places available in the current tool environment for the original frozen Figure 2–16 binaries. It did not redesign or regenerate any figure.

---

## 1. Locations searched

### GitHub main branch

A recursive repository-tree inspection was performed on `main`.

Result:

- no confirmed canonical `fig-02.webp` through `fig-16.webp` publication binaries were found;
- no alternate Macroscopic Life binary asset directory containing the frozen final figures was identified;
- the current public asset manifest still points to the canonical future paths under `public/macroscopic-life/figures/`.

### Macroscopic Life feature branch

Branch discovered:

`feat/macroscopic-life-slug`

A recursive tree inspection was performed.

Result:

- no confirmed frozen Figure 2–16 publication binaries were identified there either.

### Branch-name search

A branch-name search for figure-specific branches returned no dedicated `fig-*` recovery branch.

### File Library

A File Library search was performed for Macroscopic Life Figure 13, Figure 14, Figure 15, and generic Macroscopic Life figure graphics.

Result:

- no matching Macroscopic Life image assets were returned;
- returned items were unrelated campaign/document files.

This does not prove the original generated binaries no longer exist. It proves they are not discoverable in the currently searchable GitHub trees or File Library under the available search surfaces.

---

## 2. Recovery classification after search

All Figures 2–16 remain:

**R0 — CONTROL RECOVERED / BINARY NOT LOCATED IN CURRENT SEARCH SURFACES**

This state remains correct because:

- frozen scientific/compositional lineage is preserved;
- exact approved generative versions are known for the figures where generative records were used;
- deterministic production instructions are preserved;
- exact final publication binaries are not presently retrievable from GitHub main, the discovered Macroscopic Life branch, or File Library.

No figure is downgraded scientifically by this result.

---

## 3. What was NOT available to search from this environment

The following likely binary-bearing locations cannot be directly inspected through the current GitHub/File Library tools:

- Steve's local `H:` / Windows RedDirt working tree;
- Downloads folders and browser download history;
- image-generation output history not surfaced as File Library files;
- untracked or gitignored local files;
- local git stashes and worktrees not represented as GitHub branches;
- Netlify deploy filesystem/artifacts not exposed through the current connector;
- local Cursor-generated asset folders that were never committed;
- external cloud storage or manual export folders.

These remain the highest-value recovery locations.

---

## 4. Important finding

The binary search confirms the distinction already documented in the final production records:

> **THE APPROVED GRAPHIC DESIGN EXISTS EVEN WHEN THE ORIGINAL GENERATED BINARY IS NOT PRESENT IN GITHUB.**

Figure 2's V4 final review explicitly identifies the image as the approved visual/compositional master while requiring deterministic finishing.

Figure 15's final production lock explicitly records the frozen V3 generation/composition provenance while warning that the generated binary is not asserted to be stored in GitHub.

The correct next action is therefore local binary recovery — not conceptual regeneration.

---

## 5. Local recovery target patterns

When the local RedDirt machine is available, search recursively for likely assets using these patterns:

```text
*fig*02*
*fig*03*
...
*fig*16*
*figure*02*
*figure*03*
...
*figure*16*
*macroscopic*life*.png
*macroscopic*life*.jpg
*macroscopic*life*.jpeg
*macroscopic*life*.webp
*macroscopic*life*.svg
```

Also search recently modified image files from the September 5, 2026 production window.

Priority directories:

```text
H:\SOSWebsite\RedDirt\
H:\SOSWebsite\RedDirt\research\macroscopic-life\
H:\SOSWebsite\RedDirt\public\
C:\Users\User\Downloads\
C:\Users\User\Pictures\
C:\Users\User\Desktop\
```

and any Cursor/image-generation export directories used during the figure sessions.

---

## 6. Provenance intake rule

Any locally recovered candidate must not be copied directly into the publication path simply because its filename looks right.

For each candidate:

1. record source path;
2. record filename;
3. record modification timestamp;
4. compute hash if possible;
5. identify candidate figure number/version;
6. compare visually to the frozen hostile-review/composite lock;
7. classify R1 only after candidate identity is plausible;
8. classify R2 only after the composition match is confirmed;
9. complete deterministic text/composite work;
10. classify R3 only after web + mobile + print + screenshot proof.

---

## 7. Current figure status

```text
Figures in frozen publication sequence         15
Design/science lineage recovered               15
Conceptual redesign required                    0
Confirmed final binaries in GitHub main         0
Confirmed final binaries in feature branch      0
Confirmed matching binaries in File Library     0
Current R0                                      15
Current R1                                       0
Current R2                                       0
Current R3                                       0
```

---

## 8. Next gate

**PUB-8I — Local Workstation Binary Recovery Script + Intake Manifest**

The next production step is to create a safe local search/intake script for Steve's Windows machine. It should scan only for candidate image files, never delete or modify originals, produce a manifest with path/size/date/hash, and rank candidates by likely Figure 2–16 relevance.

Once that manifest is produced, recovered candidates can be compared against the frozen production records and promoted through R1 → R2 → R3.
