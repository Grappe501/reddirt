# Opposition Research Workbench + Debate Prep Report

## Active lane

- `RedDirt/`

## Goal completed

- Built and linked a full Opposition Research Workbench under the existing admin intelligence shell with candidate-facing first-screen priorities and deep Kim Hammer routes.

## Routes delivered

- `/admin/intelligence`
- `/admin/intelligence/kim-hammer`
- `/admin/intelligence/kim-hammer/bills/[billNumber]`
- `/admin/intelligence/kim-hammer/debate-prep`
- `/admin/intelligence/kim-hammer/claims-review`
- `/admin/intelligence/kim-hammer/themes`
- `/admin/intelligence/kim-hammer/timeline`
- `/admin/intelligence/kim-hammer/research-gaps`

## Source packet wiring

- `data/opposition/kim-hammer-election-record-bill-index.json`
- `data/opposition/kim-hammer-election-record-theme-matrix.json`
- `data/opposition/kim-hammer-election-record-timeline.json`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md`

All pages consume these via `src/lib/opposition/kimHammerWorkbench.ts`.

## Candidate-first opening screen outcomes

- First screen now answers:
  - what matters most
  - what is verified
  - what is risky
  - what to say
  - what to avoid
  - what to drill next
- Real packet metrics are shown (18 bills, 18 enacted acts, theme concentration, claims buckets, debate anchors).

## Bill detail outcomes

- Bill identity, act/session, role, confidence, impact sections, SOS and county impact framing, philosophy alignment prompts, debate-use framing, and source appendix are present.
- "Stacking the office" remains framed as a research question, not asserted fact.

## Safety and quality controls

- No voter targeting, demographic targeting, or individualized persuasion modeling in outputs.
- No motive claims as fact.
- Claims are separated by support level with safer wording guidance.
- Debate claims are tied back to bill/source packet references.

## Tests run

- `npm run agents:test-kim-hammer-election-record-research` -> pass
- `npm run agents:test-opposition-workbench-debate-prep` -> pass

## Build status

- `npm run build` currently fails locally with known environment-specific Node heap OOM in this workspace.
- This remains the same pre-existing local blocker pattern; CI/Netlify should be used for final production verification.

## Netlify readiness

- Route surface and data wiring are complete for deployment.
- Final readiness to be confirmed after GitHub push triggers Netlify build.

# Opposition Research Workbench + Debate Prep Report

## Scope

Built a full admin opposition research workbench under intelligence routes, with candidate-facing debate prep command center and bill-level detail pages wired to the Kim Hammer packet.

## Primary routes delivered

- `/admin/intelligence`
- `/admin/intelligence/kim-hammer`
- `/admin/intelligence/kim-hammer/bills/[billNumber]`
- `/admin/intelligence/kim-hammer/debate-prep`
- `/admin/intelligence/kim-hammer/claims-review`
- `/admin/intelligence/kim-hammer/themes`
- `/admin/intelligence/kim-hammer/timeline`
- `/admin/intelligence/kim-hammer/research-gaps`

Alias redirects also added:

- `/admin/opposition`
- `/admin/opposition/kim-hammer`
- `/admin/opposition/kim-hammer/bills/[billNumber]`
- `/admin/opposition/kim-hammer/debate-prep`
- `/admin/opposition/kim-hammer/claims-review`
- `/admin/opposition/kim-hammer/themes`
- `/admin/opposition/kim-hammer/timeline`
- `/admin/opposition/kim-hammer/research-gaps`

## Data sources wired

- `data/opposition/kim-hammer-election-record-bill-index.json`
- `data/opposition/kim-hammer-election-record-theme-matrix.json`
- `data/opposition/kim-hammer-election-record-timeline.json`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md`
- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md`

## Candidate opening screen outcomes

First screen now answers:

- what is the pattern (theme concentration panel)
- what is verified (18 bills / 18 enacted acts / source confidence)
- what is risky (do-not-say and risk claims)
- what to contrast (control/regulation vs trust/transparency/support)
- what to drill now (debate drill queue + top questions)

## Implementation notes

- Added unified loader and derived analytics:
  - `src/lib/opposition/kimHammerWorkbench.ts`
- Added bill detail pages with:
  - identity and sourcing
  - process-level impact sections
  - philosophy alignment/conflict
  - `"stacking the office?"` framed as research question only
- Added debate prep command center sections:
  - core frame, pillars, question bank, answer/rebuttal builders, drill cards, reporter prep, risk meter, evidence locker

## Safety/quality checks

- Source-first only; no unsourced approvals.
- No motive claims presented as fact.
- No personal attack generation.
- No voter targeting, no demographic targeting, no individualized persuasion modeling.
- Debate claims tied to bill IDs and source confidence.

## Tests

- `npm run agents:test-kim-hammer-election-record-research`
- `npm run agents:test-opposition-workbench-debate-prep`

## Netlify readiness

- Build output readiness depends on `npm run build` in the current environment.
- In this workspace, local build is still subject to known Node heap OOM behavior.

