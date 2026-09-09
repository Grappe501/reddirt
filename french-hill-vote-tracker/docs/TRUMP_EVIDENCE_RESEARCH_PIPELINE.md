# Trump Evidence Research Pipeline

Trump-position research is intentionally separate from party-alignment scoring.

## Core rule

A Republican vote split is never used to infer Donald Trump's position. A Trump alignment or Trump break may be published only when the tracker has a `verified` evidence record for the same Congress and roll call.

The evidence record must identify the actual House vote Trump preferred through `preferredVote: "Yea" | "Nay"`. Do not assume that `position: "Support"` means Yea or that `position: "Oppose"` means Nay. Veto overrides, objections, disapproval resolutions, impeachment articles, amendments, and procedural motions can invert the relationship between policy rhetoric and the recorded House vote.

For `Neutral` or `Ambiguous` positions, `preferredVote` must be null and no Trump alignment/break classification is published.

## Discovery sources

Discovery sources can identify candidate votes for research. They are not sufficient by themselves for publication.

The project can use the archived FiveThirtyEight Congress Trump Score dataset as a historical discovery index for the 115th and 116th Congresses. FiveThirtyEight's methodology tracked congressional votes for which it identified a Trump position and calculated whether individual members agreed. The tracker imports only French Hill rows where the legacy dataset reports disagreement and marks them as research leads.

Run:

```bash
npm run research:trump-legacy
```

This writes `data/research/trump-score-leads.json`.

## Verification sequence

For each lead:

1. Resolve the exact House Congress, roll call, measure, question, and vote date.
2. Confirm French Hill's vote from the Office of the Clerk of the U.S. House.
3. Confirm the House Republican and Democratic split from the Clerk record.
4. Find a contemporaneous Trump-position source tied to the vote or measure. Prefer official White House, presidential, OMB, Treasury, or archived official material. Strong contemporaneous reporting may be used when it directly documents Trump's stated position.
5. Translate that documented position into the actual House vote Trump preferred and record it as `preferredVote`.
6. Check the procedural semantics. For example, opposing a veto override means the preferred vote on the override is Nay; opposing a disapproval resolution also generally means the preferred vote on that resolution is Nay.
7. Write a plain-language evidence summary that distinguishes the House record from the Trump-position evidence.
8. Mark the record `verified` only when the evidence is sufficient under the validator.
9. Run `npm run validate:trump-evidence` before publication.

## Evidence-state meanings

- `verified`: eligible to merge into the public vote record when a directional preferred vote is established.
- `provisional`: promising evidence, but not publishable as a Trump classification.
- `ambiguous`: the available evidence does not establish a sufficiently clear directional vote.
- `rejected`: research determined the candidate classification should not be used.

The public data merger ignores every state except `verified`.

## Current evidence baseline

The CI-validated evidence set currently contains 22 unique Congress/roll-call records. It includes both Trump alignments and Trump breaks, including electoral-vote objections, the January 6 commission, the FY2021 NDAA veto override, sanctions policy, Syria withdrawal, border-emergency votes, impeachment, appropriations, and other policy votes.

This count is a research baseline, not a claim that the historical sweep is complete. New records should be added only after the same House-source, Trump-position, preferred-vote, and duplicate-key checks pass.

## Publication safeguards

Every published Trump classification should remain individually auditable. Each record must retain its House source, Trump-position source, summary, preferred vote, and evidence status. The system must never infer a presidential position from party behavior alone, and duplicate Congress/roll-call keys are validation failures rather than additional evidence.
