# Macroscopic Life — PUB-8W

## Exact-Anchor Reconciliation Runner + Final Scholarly Apparatus Proof

**Status: PRODUCTION GATE BUILT — EXECUTION REMAINS LOCAL**

PUB-8W closes the gap between the controlled citation architecture and the physical reader manuscript. It does not rewrite prose and does not claim that the H-drive execution has occurred.

### Added

- `scripts/reconcile-exact-endnote-anchors.mjs`
  - requires the materialized reader master;
  - requires exactly 45 anchor records;
  - requires every exact anchor to occur exactly once;
  - records the physical master SHA-256 and each anchor SHA-256;
  - fails on absent or ambiguous anchors.

- `scripts/proof-final-scholarly-apparatus.mjs`
  - requires the physical master, final bibliography, numbering map, insertion manifest, exact-anchor manifest, and reconciliation report;
  - requires BIB-001 through BIB-031;
  - requires 45/45 uniquely reconciled anchors;
  - requires all 16 chapters;
  - verifies the three synthesis/verdict locks remain present.

- `scripts/run-pub-8w-scholarly-apparatus.ps1`
  - executes materialization → bibliography consolidation → insertion-readiness proof → exact-anchor reconciliation → final apparatus proof in fail-closed order.

### H-drive command

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8w-scholarly-apparatus.ps1
```

### Fail-closed doctrine

A semantically similar sentence is not an exact anchor. A duplicated sentence is not a safe anchor. A missing physical master is not permission to infer placement. A stable endnote number is not permission to fabricate authority.

### Current truth

The repository contains the machinery required to prove the scholarly apparatus. The connector environment has not executed the H-drive runner, so **45/45 exact physical matches are not yet claimed**.

### Next gate

**PUB-8X — Controlled Endnote Marker Injection + Post-Injection Manuscript Integrity Proof**

This gate should run only after PUB-8W returns PASS on the execution-capable checkout. It will create a derivative endnoted reader master, preserve the frozen clean master, inject exactly 45 controlled markers, append the verified apparatus, and prove that removal of markers/apparatus reproduces the frozen reader text.
