# Macroscopic Life — PUB-9C-R13

## Deterministic Exact-Anchor Population + Scholarly Review Gate

**Status: TOOLING BUILT — ZERO ANCHORS APPROVED BY THIS PASS**

R13 converts the 46 OPEN anchor records into a controlled candidate/review workflow. It deliberately refuses to treat string matching as scholarly judgment.

## Candidate generator

`populate-pub-9c-exact-endnote-anchors.mjs`

Requires the physical revised master. It divides that exact master into 16 chapters, searches only inside the assigned chapter for each note, scores candidate sentences against stable claim concepts from the endnote architecture, and accepts an automatic candidate only when the best candidate is uniquely ranked and occurs exactly once in the entire master.

The output records the physical master SHA256 and candidate anchor SHA256 values.

Automatic state is only:

`CANDIDATE-UNIQUE`

It is never `EXACT-ANCHOR-VERIFIED`.

Ambiguous or missing matches remain `REVIEW-REQUIRED`.

## Human/operator approval gate

`book-one-exact-endnote-anchor-approvals-pub-9c-v1.0.json`

Ships with all 46 decisions set to `REVIEW`.

No approval is implied by this repository pass.

`approve-pub-9c-exact-endnote-anchors.mjs` refuses to produce the approved manifest unless:

- exactly 46 approval records exist;
- every decision is explicitly `APPROVE`;
- every approved exact anchor is nonempty;
- every approved anchor occurs exactly once in the unchanged physical master;
- the master SHA still matches the candidate-generation master.

Only then does it emit `EXACT-ANCHOR-VERIFIED` for 46/46.

## Why this matters

A deterministic text matcher can identify likely sentence hosts. It cannot decide whether a paper actually supports that sentence's scientific burden. That distinction is central to the Macroscopic Life citation doctrine:

> **A CITATION SUPPORTS A SENTENCE, NOT A MOOD.**

R13 therefore automates discovery and hashing while keeping scholarly acceptance explicit.

## Runner

`run-pub-9c-r13-anchor-review.ps1` runs R10 preflight, validates the 46-slot architecture, generates candidates, then stops for review. It does not auto-approve or inject.

## Not claimed

- physical master generated locally;
- candidate count;
- any exact anchor approved;
- 46/46 reconciliation PASS;
- endnoted master;
- RC1.

## Next gate

After physical execution and 46 explicit approvals:

**PUB-9C-R14 — Approved-Manifest Wiring + Full 46-Note Scholarly Integrity Run**

That pass should wire the R12 reconciler/injector to the approved manifest, prove multi-authority definitions including BIB-032 + BIB-033, prove 92 note tokens and exact prose round trip, and produce a revised scholarly-closure report suitable for the release-candidate chain.
