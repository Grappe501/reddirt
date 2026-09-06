# Macroscopic Life — PUB-9C-R12

## Revised-Master Exact Anchor Reconciliation + 46-Note Injection Harness

**Status: TOOLING BUILT — LOCAL EXECUTION NOT CLAIMED**

PUB-9C-R12 completes the revised scholarly injection machinery around the physical PUB-9C reader master.

## Added

- `scripts/reconcile-pub-9c-exact-endnote-anchors.mjs`
- `scripts/inject-pub-9c-controlled-endnotes.mjs`
- `scripts/proof-pub-9c-post-injection-integrity.mjs`
- `scripts/run-pub-9c-r12-anchor-injection-proof.ps1`

## Exact-anchor reconciliation

The reconciler requires the physical revised master and all 46 exact anchors. It refuses approximate placement, ambiguous matches, missing anchors, or reuse of the old 45-slot master hash.

PASS requires **46/46 unique exact matches**.

## Multi-source endnotes

The new injector supports an array of authority IDs for a single note. This fixes the earlier one-authority assumption and permits the Chapter 12 consciousness note to reference **BIB-032 + BIB-033** together.

Project-synthesis and record-callback notes remain explicit classes rather than fabricated literature citations.

## Temporary marker removal

The staged reader token `[12.4]` is removed before controlled Markdown endnote insertion. The final derivative must contain no `[12.4]` residue.

## Round-trip proof

The post-injection proof requires:

- 46 reader markers;
- 46 endnote definitions;
- exactly 92 Markdown note tokens total;
- two occurrences for every note ID 1–46;
- zero temporary `[12.4]` markers;
- reader prose restored byte-for-byte after stripping controlled note markers;
- four-stage hierarchy intact;
- consciousness boundary intact;
- final civilization verdict intact;
- `MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.` intact;
- `WE ARE THE MICROBE.` intact;
- no PUB-7L editorial ledger leakage.

## Runner order

1. R10 revised-reader preflight;
2. 46-slot architecture validation;
3. exact-anchor reconciliation;
4. controlled endnote injection;
5. post-injection round-trip integrity proof.

## Local command

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r12-anchor-injection-proof.ps1
```

## Important blocker

The fresh 46-slot anchor manifest intentionally contains OPEN anchors. Therefore the runner will fail closed until the exact verbatim anchors are populated from the physical revised master.

That is correct behavior.

No materialized revised master, exact-anchor PASS, endnoted master, or integrity PASS is claimed by this repository-only build.

## Next gate

**PUB-9C-R13 — Exact Anchor Population Tool + Revised Scholarly Closure**

Build a deterministic helper that reads the physical revised master and sentence-level placement instructions, proposes candidate exact anchors without silently approving them, requires one unique match per slot, resolves Note 46 against the consciousness sentence, and produces the reviewable 46-anchor manifest needed to let R12 pass.
