# PUB-9C R15 — Figure Production Blocker

**Status:** R14 PASS; R15 RAIL A GREEN; R15 RAIL B BLOCKED BY ABSENT CANONICAL VISUAL MASTER / PUBLICATION ASSETS

## What is physically proven

- Pass 03 scholarly requalification: **46/46 APPROVED**.
- R14 exact-anchor integrity verifier: **PASS**.
- Figure R3 proof-copy records: **15/15 present** for Figures 2–16.
- Historical figure lock commits: **15/15 present**.
- Current figure-numbered production asset candidates in Git: **0/15**.
- Historical figure-numbered production asset candidates at the lock commits: **0/15**.
- `figure-publication-registry-v1.json`: **not physically present** before recovery.
- Figure R3 production closure: **NOT AUTHORIZED**.
- R15 full PASS: **NOT AUTHORIZED**.
- R16 publication freeze: **NOT AUTHORIZED**.

## Crucial distinction discovered during recovery

The hostile-review lock commits do not prove that a finished publication binary existed in Git. At least Figures 2 and 3 explicitly state that their generated visual/compositional masters were approved while deterministic publication production still remained to be done.

Figure 2 lock language:

> `CONDITIONAL APPROVAL — SCIENTIFIC/NARRATIVE CONTENT LOCKED; GENERATED POSTER IS NOT YET THE PUBLICATION-MASTER TEXT ASSET`

and:

> `The publication asset should be produced from this composition with deterministic typography...`

Figure 3 lock language:

> `APPROVED — SCIENTIFIC + VISUAL COMPOSITION LOCKED. PUBLICATION MASTER REQUIRES DETERMINISTIC TYPESETTING/AXIS VERIFICATION.`

and:

> `The v4 image becomes the canonical composition reference.`

Therefore the existing R15 instruction — **RECOVER THE APPROVED PRODUCTION BINARY** — cannot be satisfied by pretending a publication binary already existed. The repo proves approved composition locks and production requirements; it does not currently contain the canonical visual reference binaries or deterministic publication masters.

## Permitted next production path

1. **Recover the canonical approved visual/compositional master** for each figure from the original generated asset source, if available.
2. Preserve the approved composition. **No conceptual redesign.**
3. Apply only the deterministic finishing operations explicitly authorized by the corresponding final hostile-review lock: typography replacement, verified labels/numbers/axes, locked copy, schematic/false-color labels, caption/alt text, print-resolution/export checks, and other named production cleanup.
4. Export a deterministic publication binary for each figure.
5. Create `figure-publication-registry-v1.json` with exact paths, SHA-256 values, approved versions, lock commits, and `LOCKED_FOR_PUBLICATION` state.
6. Run `audit-figure-r3-closure.mjs` and require **15/15 PASS**.
7. Only then rerun R15 full merge gate.

## Forbidden shortcuts

- Do not generate a new concept image merely because the canonical master is missing.
- Do not substitute a visually similar image.
- Do not claim the hostile-review Markdown file is the production binary.
- Do not infer a publication asset from a lock commit that contains only review/specification text.
- Do not mark any figure `LOCKED_FOR_PUBLICATION` without a physical asset and hash.
- Do not enter R16 until R15 itself emits full PASS.

## Current blocking object

The only unresolved R15 rail is now **physical Figure 2–16 production closure**. Scholarly R14 closure is no longer the blocker.
