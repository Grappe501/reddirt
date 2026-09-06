# Macroscopic Life — PUB-8Y

## Publication Package Assembly + Release Candidate Manifest

**Status: RELEASE ASSEMBLY GATE BUILT — RELEASE NOT YET CLAIMED**

PUB-8Y establishes one release-candidate boundary for the frozen Book One manuscript, scholarly apparatus, and approved figure-production system.

### Added

- `scripts/build-book-one-release-candidate-manifest.mjs`
- `scripts/run-pub-8y-release-candidate.ps1`
- `release/BOOK-ONE-RC1-README.md`

### Release manifest behavior

The generated manifest records SHA-256 hashes and byte sizes for the clean physical master, derivative endnoted master, final verified bibliography, numbering map, exact-anchor reconciliation, post-injection integrity report, figure publication registry, and R3 proof-copy register.

It fails closed if scholarly proof is absent/non-PASS or if Figures 2–16 are not demonstrably verified at R3 publication state.

### Figure protection

A missing or unverified binary does **not** mean the figure needs redesign. Figures 2–15 already have recovered approved production compositions and Figure 16 has recovered deterministic canon. The correct response to an R3 blocker is recovery/proof/promotion of the approved production asset.

### Run

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8y-release-candidate.ps1
```

### Expected present-state outcome

Because this connector has no evidence that the local figure recovery/R2/R3 promotion pipeline has been executed, **PUB-8Y should remain BLOCKED on figure verification until the H-drive proves otherwise.** This is healthy fail-closed behavior.

### Next production gate

**PUB-8Z — Figure Binary Recovery Closure + R3 Promotion Audit**

Run the existing recovery scanner/verifier and R2/R3 promotion machinery against Figures 2–16, preserve all approved design locks, and close only the binary/proof-state gaps reported by the RC1 manifest. Once 15/15 figures are verified R3, rerun PUB-8Y and require `RELEASE_CANDIDATE_READY`.
