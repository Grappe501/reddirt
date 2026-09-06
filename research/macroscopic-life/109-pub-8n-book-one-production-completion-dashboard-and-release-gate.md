# Macroscopic Life — PUB-8N

## Book One Production Completion Dashboard + Release-Blocking Gate

**Status: PRODUCTION CONTROL BUILT**

PUB-8N converts the remaining Book One work into a deterministic release gate. It does not reopen research, theory, chapter architecture, redundancy, or frozen figure design.

## Current controlled state

| Layer | State |
|---|---|
| Scientific core | PASS / FROZEN |
| Five-act / 16-chapter architecture | PASS / FROZEN |
| Reader-sequence hardening | PASS |
| Redundancy repair | PASS |
| Source architecture | VERIFIED |
| Bibliography/endnote working register | PRESENT; final normalization remains production work |
| Controlled master root | PRESENT |
| Physical monolithic reader master | Must be generated/verified by the materializer on an execution-capable checkout |
| Figures 2–16 design/composition | 15/15 RECOVERED / FROZEN |
| Figures requiring conceptual redesign | 0/15 |
| R3 final publication binaries | 0/15 currently recorded in publication registry |
| Live safety fallback | Deterministic React/SVG preserved |

## Release blockers

Book One illustrated release remains blocked until:

1. `book-one-master-v1.0-reader-materialized.md` is physically generated and validated from the five canonical PUB-7L R1 act sources;
2. bibliography/endnote metadata is normalized without fabricated fields;
3. Figures 2–16 each reach R3 through the frozen recovery/proof pipeline;
4. final web/mobile/screenshot/print proofs pass;
5. final typeset proof is produced and reviewed.

## Automated gate

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\generate-book-one-release-readiness.ps1
```

The gate emits timestamped JSON and Markdown under:

`research/macroscopic-life/recovery/release-readiness/`

A blocked release exits non-zero. The gate intentionally treats missing physical manuscript materialization and incomplete R3 figure promotion as release blockers.

## Governing rule

> **NO ARCHITECTURE REWRITE. RESOLVE PRODUCTION BLOCKERS ONLY.**

The microbe remains the doorway. The tests remain the contribution. Model C remains a legitimate scientific result. The final publication process must not weaken falsifiability merely to make the larger hypothesis more dramatic.

## Next production gate

**PUB-8O — Physical Master Execution + Bibliography Normalization Queue**

This gate should execute the existing manuscript materializer on the working checkout, verify the resulting 16-chapter physical master, then turn every incomplete bibliography record into a bounded metadata-normalization queue. It should not rewrite reader prose or reopen source architecture.
