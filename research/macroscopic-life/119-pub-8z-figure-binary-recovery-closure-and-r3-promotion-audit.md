# Macroscopic Life — PUB-8Z

## Figure Binary Recovery Closure + R3 Promotion Audit

**Status: RECOVERY CLOSURE GATE BUILT — LOCAL FIGURE STATE NOT CLAIMED**

PUB-8Z attacks the final known release bottleneck without reopening figure design.

### Added

- `scripts/audit-figure-r3-closure.mjs`
- `scripts/run-pub-8z-figure-recovery-closure.ps1`
- `release/FIGURE-RECOVERY-CLOSURE-CHECKLIST.md`

### Audit contract

Figures 2–16 must each have:

1. a publication-registry record;
2. an R3/verified publication state;
3. an actual binary at the registered/reconciled path;
4. a SHA-256 fingerprint recorded by the closure audit.

The audit writes:

`release/book-one-figure-r3-closure-audit.json`

and fails unless the result is **15/15**.

### Recovery runner

The runner first reuses the already-built local recovery scanner and candidate verifier. It does not generate new artwork. It then directs the operator through the existing R2/R3 promotion controls and runs the closure audit.

### Run

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8z-figure-recovery-closure.ps1
```

### Current truth

Approved production design/composite work is recovered in the repository record. Exact binary recovery/R3 state remains a local execution question. This connector cannot truthfully report a 15/15 result until the H-drive runner produces it.

### Next gate

**PUB-9A — RC1 Final Release Proof + Publication Freeze**

After PUB-8Z returns PASS, rerun PUB-8Y. Require `RELEASE_CANDIDATE_READY`, fingerprint the final package, freeze Book One RC1, and move from production engineering into export/layout/distribution rather than further scientific rewriting.
