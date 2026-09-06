# Macroscopic Life — PUB-8U

## Final Bibliography Consolidation + Endnote Insertion Harness

**Status: PRODUCTION HARNESS BUILT — EXECUTION GATED**

PUB-8U converts the closed authority search into deterministic publication machinery. It does not add sources, change claims, rewrite chapters, or reopen architecture.

## 1. Final bibliography consolidation

`research/macroscopic-life/scripts/build-final-book-one-bibliography.mjs`

The generator consumes the controlled authority records and refuses completion unless BIB-001 through BIB-031 are present with canonical citation text. It writes:

`research/macroscopic-life/manuscript/book-one-final-verified-bibliography-v1.0.md`

No metadata is inferred during generation.

## 2. Controlled 45-slot insertion manifest

`research/macroscopic-life/manuscript/book-one-endnote-insertion-manifest-v1.0.json`

This preserves the chapter allocation for all 45 endnote slots and distinguishes external authority, project synthesis, and record callback. PROJECT SYNTHESIS must never be disguised as an external citation.

## 3. Readiness proof

`research/macroscopic-life/scripts/proof-endnote-insertion-readiness.mjs`

The proof blocks insertion unless:

- the physical 16-chapter reader master exists;
- the final verified bibliography exists;
- the controlled insertion manifest exists;
- the stable numbering map exists;
- the insertion manifest contains exactly slots 1–45;
- no PUB-7L implementation/editorial ledger material leaked into the physical master.

## Execution order on the H-drive checkout

```powershell
node .\research\macroscopic-life\scripts\materialize-book-one-master.mjs
node .\research\macroscopic-life\scripts\build-final-book-one-bibliography.mjs
node .\research\macroscopic-life\scripts\proof-endnote-insertion-readiness.mjs
```

Only after all three pass should sentence-level marker insertion begin.

## Scientific hard stops

- Analogy is not evidence.
- Frequency is a measurement, not an explanation.
- Anticipation is not prophecy.
- Distributed capability is not automatically organism-level agency.
- PROJECT SYNTHESIS remains author/project synthesis.
- Model C remains a legitimate outcome.
- Test 11 — Model Competition — remains mandatory.

## Current state

Authority search: **CLOSED**

Endnote accounting: **45/45**

Verified bibliography IDs expected: **31**

Physical insertion: **NOT CLAIMED; requires execution-capable checkout**

Reader prose: **FROZEN**

## Next production gate

**PUB-8V — Sentence-Level Endnote Injection + Citation Hostile Proof**

After the H-drive execution produces the physical master and consolidated bibliography, inject the 45 controlled markers at their exact anchors and hostile-review every citation for scope, proximity, overclaim, and synthesis/source confusion. No prose rewrite unless a citation exposes an actual scientific burden mismatch.
