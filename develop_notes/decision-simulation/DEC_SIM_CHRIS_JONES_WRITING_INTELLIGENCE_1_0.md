# Chris Jones writing intelligence 1.0

Retrieval date: 2026-09-09  
Actor id: `chris-jones-ar02`  
Primary surface: https://drchrisjones.substack.com/ (Everything Is Rocket Science)

No bulk article reprint. Full public pages were analyzed at ingest time and cached outside git.

## Corpus

- Documents: **20** (floor met)
- Types: 19 SUBSTACK, 1 CAMPAIGN_ARTICLE (`chrisjonesforcongress.com/affordability/`)
- Authorship: 19 DIRECT_AUTHOR, 1 ATTRIBUTED
- Dated range in extracted metadata: **2025-01-20 → 2026-07-15**
- Temporal windows: ALL_TIME 20 · LAST_24_MONTHS 20 · LAST_12_MONTHS 16 · LAST_90_DAYS 1

Three 2026 archive titles (America at 250, Housing B+, Quantum Pearls 2) were not retrieved under guessed slugs. They remain discovery targets, not invented voice.

## Topic distribution

affordability, national, housing, faith, economy, arkansas, accountability, elections

Issue-voice shares (a document may have more than one):

- ECONOMIC 90%
- CALL_TO_ACTION 70%
- COMMUNITY 65%
- ATTACK_CONTRAST 40%
- CRISIS 40%
- TECHNOLOGY 35%
- POLICY_EXPLANATION 25%
- FUNDRAISING_CAMPAIGN 15%

## Style findings

Measured, not adjectives:

- Mean sentence length ~11.5 words; short-punch rate 0.46
- High question/close cadence; low official-process rate
- Distinctive Jones-arc detector 0.37 vs Hill-arc 0.04
- Recurring motifs: people, system, power, arkansas, accountability, families

## Rhetorical findings

Corpus-mean detector rates:

- rhetorical question 0.22
- moral framing 0.17
- authority 0.13
- statistics 0.10
- local example 0.10
- analogy / rocket-science explainers present but not on every piece

The archive-stated pattern (story → analogy → systems diagnosis → values → Arkansas grounding → hopeful action) is **INFERRED** as a frequent architecture. It is not universal. Economic pieces more often lead with the system claim and short punch lines.

## Decision tendencies

OBSERVED 3 · INFERRED 2 · HYPOTHESIS 0

- Preferred terrain OBSERVED: affordability, systems diagnosis, kitchen-table Arkansas consequences
- Opponent naming OBSERVED: names incumbent/committee terrain on some economic and AI pieces
- Statistics vs story OBSERVED: figures support the system claim more often than long anecdote
- Document architecture INFERRED: everyday opening → systems explanation → values → action
- Close INFERRED: collective choice, blessings/sign-off, or campaign ask after diagnosis

## Strongest observed patterns

1. “It’s a system” diagnosis after a kitchen-table cost list
2. Engineering/science gloss used to translate policy (GIGO, public goods, fracture, housing physics)
3. Affordability + accountability pairing
4. Direct-author first person; campaign page is weaker authorship

## Weak / uncertain

- 90-day window has only one dated piece; summer 2026 slug misses reduce recency weight
- Faith/values detector is conservative after tightening
- Contrast is issue-specific, not a standing attack register
- HTML ingest collapses paragraphs, so paragraph-length features are weak

## Methodology / limits

First-party URLs only. Wikipedia, news paraphrases, and opposition messaging were not used as voice training. Excerpts in the derived corpus are clipped. Runtime full text, if needed, stays in `H:/SOSWebsite/.local/writing-intelligence-cache`.
