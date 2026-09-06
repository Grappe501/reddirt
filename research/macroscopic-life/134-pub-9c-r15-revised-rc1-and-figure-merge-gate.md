# Macroscopic Life — PUB-9C-R15

## Revised RC1 Manifest + Figure-Recovery Merge Gate

**Status: MERGE-GATE TOOLING BUILT — RC1 PASS NOT CLAIMED**

R15 joins the two independent production rails that must both be complete before Book One can freeze.

## Rail A — revised scholarly closure

The R15 runner first calls the R14 chain. That rail cannot pass unless all 46 R13 anchor decisions have been explicitly approved and the exact rebuilt master survives the 46-note injection/integrity proof.

## Rail B — production figure closure

R15 then calls `audit-figure-r3-closure.mjs` for Figures 2–16.

The rule remains:

> **RECOVER THE APPROVED PRODUCTION BINARY. DO NOT REDESIGN AN APPROVED FIGURE TO SATISFY A FILE GATE.**

The current GitHub view does not establish that `visuals/figure-publication-registry-v1.json` or the 15 exact publication binaries are physically present in the repository checkout. Therefore no 15/15 PASS is claimed here.

## RC1 merge manifest

`build-pub-9c-revised-rc1-manifest.mjs` requires:

- clean PUB-9C materialized master;
- PUB-9C endnoted master;
- BIB-001..033 verified bibliography;
- PUB-9C scholarly closure report;
- 46/46 approved exact-anchor manifest;
- Figure 2–16 R3 closure report.

It cross-checks the clean and endnoted manuscript hashes against the scholarly closure and requires Figure R3 closure = 15/15.

Only a blocker-free manifest emits:

- `status: PASS`
- `freezeAuthorized: true`

## Runner

`run-pub-9c-r15-rc1-merge-gate.ps1`

Order:

1. R14 scholarly integrity;
2. Figure R3 closure audit;
3. revised RC1 manifest.

## Current blockers remain truthful

At repository-build time:

- the 46 anchor review template is still REVIEW until physically reviewed;
- no R14 local PASS has been shown;
- no 15/15 local Figure R3 PASS has been shown;
- no revised RC1 manifest PASS has been shown;
- no publication freeze is claimed;
- no Netlify deployment is claimed.

## Next gate

After R15 physically returns PASS:

**PUB-9C-R16 — Deterministic RC1 Publication Freeze + Hash-Locked Release Bundle**

R16 should freeze only the exact artifact hashes named by the PASS manifest and should refuse to freeze if any manuscript, bibliography, scholarly proof, or figure binary changes after the merge gate.
