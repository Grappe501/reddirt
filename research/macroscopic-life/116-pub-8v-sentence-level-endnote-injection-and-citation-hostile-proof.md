# Macroscopic Life — PUB-8V

## Sentence-Level Endnote Injection + Citation Hostile Proof

**Status: INJECTION/PROOF HARNESS BUILT — EXACT-ANCHOR EXECUTION STILL GATED**

PUB-8V converts the 45-slot citation plan into a zero-approximation insertion process. It does not permit paragraph-guess insertion, automatic semantic placement, prose rewriting, or conversion of project synthesis into external authority.

## Exact-anchor manifest

`research/macroscopic-life/manuscript/book-one-exact-endnote-anchor-manifest-v1.0.json`

All 45 slots currently remain `OPEN-EXACT-ANCHOR` until the physical materialized reader master exists on an execution-capable checkout. Each resolved slot must contain the exact verbatim anchor from that final master, an occurrence count of exactly 1, the note class, authority ID/class, and an SHA-256 hash of the anchor text.

## Injection + hostile proof

`research/macroscopic-life/scripts/inject-and-proof-book-one-endnotes.mjs`

The script refuses to run unless the materialized master, final verified bibliography, and exact-anchor manifest exist. It then refuses each individual note unless the anchor state is `EXACT-ANCHOR-VERIFIED`, the anchor hash matches, and the exact anchor occurs once and only once in the current physical master.

On success it writes:

`research/macroscopic-life/manuscript/book-one-master-v1.0-reader-with-endnotes.md`

and a timestamped hostile-proof JSON under:

`research/macroscopic-life/recovery/endnote-proof/`

## Citation firewalls enforced in code

- Notes 42 and 44 must remain `PROJECT SYNTHESIS`.
- Notes 43 and 45 must remain `RECORD CALLBACK`.
- All other resolved external-authority slots must point to a `BIB-###` record.
- Locked project verdicts cannot be converted into external literature claims.
- All markers 1–45 must occur exactly once in the completed endnoted master.
- Build/editorial ledgers remain forbidden.
- No insertion occurs if even one slot is unresolved.

## Locked project verdict language

The following remains project synthesis/verdict language, not something to decorate with an external citation merely for authority theater:

- **ON THE EVIDENCE REVIEWED IN THIS BOOK, CIVILIZATION IS NOT ESTABLISHED AS A HIGHER-ORDER INDIVIDUAL.**
- **MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.**
- **WE ARE THE MICROBE.**

## Execution order

After PUB-8U prerequisites pass on the H-drive checkout:

```powershell
node .\research\macroscopic-life\scripts\materialize-book-one-master.mjs
node .\research\macroscopic-life\scripts\build-final-book-one-bibliography.mjs
node .\research\macroscopic-life\scripts\proof-endnote-insertion-readiness.mjs
```

Then reconcile all 45 exact anchors against the generated physical master. Only after every slot is `EXACT-ANCHOR-VERIFIED` run:

```powershell
node .\research\macroscopic-life\scripts\inject-and-proof-book-one-endnotes.mjs
```

## Current truth

Scholarly authority resolution: **45/45 slots accounted for**

Exact physical sentence anchors: **0/45 verified in repository because physical materialization has not been executed here**

Citation injection harness: **COMPLETE**

Citation hostile-proof harness: **COMPLETE**

Actual endnoted master: **NOT CLAIMED**

Reader prose and architecture: **FROZEN**

## Next production gate

**PUB-8W — Exact-Anchor Reconciliation Runner + Final Scholarly Apparatus Proof**

This next gate should automate extraction of candidate exact sentences from the locally materialized master for human confirmation, write only confirmed anchors back into the manifest, then run the full 45-note injection and final bibliography/endnote cross-proof. It must never auto-approve a semantic match.
