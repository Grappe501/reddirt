# Trump Evidence Research Pipeline

Trump-position research is intentionally separate from party-alignment scoring.

## Rule

A Republican vote split is never used to infer Donald Trump's position. A Trump alignment or Trump break may be published only when `data/trump-evidence.json` contains a `verified` record for the same Congress and roll call.

## Discovery sources

Discovery sources can identify candidate votes for research. They are not sufficient by themselves for publication.

The project can use the archived FiveThirtyEight Congress Trump Score dataset as a historical discovery index for the 115th and 116th Congresses. FiveThirtyEight's methodology tracked congressional votes for which it identified a Trump position and calculated whether individual members agreed. The tracker imports only French Hill rows where the legacy dataset reports disagreement and marks them `research-lead`.

Run:

```bash
npm run research:trump-legacy
```

This writes `data/research/trump-score-leads.json`.

## Verification sequence

For each lead:

1. Resolve the exact House Congress, roll call, measure and vote date.
2. Confirm French Hill's vote from the Office of the Clerk of the U.S. House.
3. Confirm the House Republican and Democratic split from the Clerk record.
4. Find a contemporaneous Trump-position source tied to the vote or measure. Prefer official White House/Trump statements or archived official material. Strong contemporaneous reporting may be used when it directly documents Trump's stated position.
5. Write a plain-language evidence summary that distinguishes the House record from the Trump-position evidence.
6. Mark the record `verified` only when the evidence is sufficient under the validator.
7. Run `npm run validate:trump-evidence` before publication.

## Current verified proof set

The initial proof set includes:

- 117-10 — Arizona Electoral College objection: Hill voted Nay; Trump supported congressional objections to the certification effort.
- 117-11 — Pennsylvania Electoral College objection: Hill voted Nay; Trump supported congressional objections to the certification effort.
- 117-154 — H.R. 3233 January 6 commission: Hill voted Yea; Trump publicly opposed the commission.

These records remain individually auditable through their attached source lists.

## Evidence-state meanings

- `verified`: eligible to merge into the public vote record.
- `provisional`: promising evidence, but not publishable as a Trump classification.
- `ambiguous`: the available evidence does not establish a sufficiently clear position.
- `rejected`: research determined the candidate classification should not be used.

The public data merger ignores every state except `verified`.
