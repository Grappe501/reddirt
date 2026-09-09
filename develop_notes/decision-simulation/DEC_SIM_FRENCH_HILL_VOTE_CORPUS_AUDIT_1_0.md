# French Hill vote corpus audit 1.0

**Slice:** `DEC-SIM-HILL-VOTE-EVIDENCE-BRIDGE-1.0`  
**As of:** 2026-09-09  
**Adapter:** `src/lib/agents/decision-simulation/vote-intelligence/`

## Actual directory path

**Not found.**

Steve described a RedDirt base directory `french-hil-vote-tracker`. GitHub code search on `Grappe501/reddirt` did not contain that name. Local search also did not find a matching folder.

Searched names:

- `french-hil-vote-tracker`
- `french-hill-vote-tracker`
- `hill-vote-tracker`
- `hill-vote`
- `vote-tracker`

Searched roots (existing directories only, depth 2, skipping `node_modules` / `.git` / `.next`):

- `H:/SOSWebsite`
- `H:/SOSWebsite/RedDirt`
- `H:/SOSWebsite/.local`
- `H:/SOSWebsite/.local/worktrees/dec-sim-main`
- `H:/SOSWebsite/develop_notes`
- `H:/SOSWebsite/tools`
- process cwd and parents

Related but **not** this corpus:

- `RedDirt/data/legislature` — Arkansas General Assembly video/source packets (Kim Hammer bills), not House roll calls for French Hill
- `RedDirt/data/opposition` — state-office opponent files
- writing-intelligence Hill newsletter cache — official-office prose, not votes

No duplicate vote-tracker folder was created.

## Totals

| Measure | Value |
|---|---|
| Raw records found | **0** |
| Congresses covered | unknown |
| Date range | unknown |
| Source authorities | none loaded |
| Missing roll calls | unknown — source absent |
| Duplicates | n/a |
| Source URL coverage | 0 |
| Bill-title coverage | 0 |
| Party-position coverage | 0 |
| Administration-position coverage | 0 |
| Issue-tag coverage | 0 |

## Known limitations

1. Decision Simulator cannot compute Hill party-alignment, administration-alignment, or issue rates until the existing tracker is placed on disk or the adapter is pointed at it.
2. Hosted Netlify will not see an `H:` path. When the corpus appears, regenerate `vote-intelligence/data/hill-derived.json` with `scripts/build-decision-simulation-hill-vote-derived.ts` and commit that derived snapshot only — not a second raw corpus.
3. Methodology fixtures in `vote-intelligence/fixtures/methodology-votes.json` are synthetic classification tests. They are **not** French Hill votes and **not** a forked dataset.
4. Administration alignment is classified only when a source field states a president/administration position. A Republican majority is not a substitute.
5. Highly partisan uses an explicit 80/20 party-split rule. Missing splits stay unlabeled.

## What the adapter will do when the folder appears

Consume JSON/CSV in the discovered directory, keep source ids and URLs, classify only what the fields support, and write a compact derived snapshot for the Hill actor packet and dashboard.
