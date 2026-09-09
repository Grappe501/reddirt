# French Hill writing intelligence 1.0

Retrieval date: 2026-09-09  
Actor id: `french-hill-ar02`  
Primary surface: https://hill.house.gov/news/email/

This is **FRENCH_HILL_OFFICIAL_VOICE** (OFFICIAL_OFFICE). It is not a claim that every sentence was personally typed by Hill.

No bulk newsletter reprint.

## Corpus

- Documents: **60** (above the 30-newsletter floor)
- Types: 60 OFFICIAL_NEWSLETTER from `show.aspx?ID=`
- Authorship: 60 OFFICIAL_OFFICE
- Extracted date range: **2022-02-03 → 2026-05-24**
- Temporal windows: ALL_TIME 60 · LAST_24_MONTHS 49 · LAST_12_MONTHS 45 · LAST_90_DAYS 0 in extracted dates

The public archive listing includes later 2026 issues (through August). Some show-pages did not expose a reliable `Posted on` timestamp to the extractor, so recency is under-counted. That is a metadata limit, not missing documents.

Press-release-style `RELEASE:` rows were deprioritized; the 60 kept records are newsletter bodies.

## Topic distribution

national, housing, arkansas, affordability, economy, workforce, elections, contrast

Issue-voice shares:

- ECONOMIC 78%
- COMMUNITY 78%
- CALL_TO_ACTION 47%
- POLICY_EXPLANATION 45%
- BIPARTISAN 43%
- CRISIS 38%
- FAITH_VALUES / TECHNOLOGY / PERSONAL are minority registers

ATTACK_CONTRAST is no longer stamped on every letter. It fires only on explicit contrast language (for example misguided-policy or inflation-out-of-control frames).

## Style findings

- Mean sentence length ~21 words; short-punch rate 0.18 (longer than Jones)
- Hill-arc detector 0.66; Friends greeting is the dominant opening
- Motifs: arkansas, washington, housing, central arkansas, friends, committee
- Statistics detector 0.31; local-example 0.34; institutional/authority material

## Rhetorical findings

The measured architecture matches the hypothesized office pattern often enough to mark **OBSERVED**:

Friends → problem or statistic → Arkansas example → committee/legislative action → service close

Bipartisan accomplishment and partisan contrast both appear. They are different issue voices, not one “Hill personality.”

## Decision tendencies

OBSERVED 4 · INFERRED 1 · HYPOTHESIS 0

- Document architecture OBSERVED: Friends / statistic / local example / committee action / close
- Local vs national OBSERVED: national policy tied to central Arkansas illustration
- Statistics vs story OBSERVED: figures then legislative proof
- Attack vs pivot OBSERVED: contrast and bipartisan framing both occur; neither is exclusive
- Preferred terrain INFERRED: housing, fraud, workforce, district service, committee proof

## Strongest observed patterns

1. Second-person constituent address (`Friends,`)
2. Number before solution
3. Central Arkansas or office-location grounding
4. Committee/legislative accomplishment as proof
5. Service close more often than moral-arc close

## Weak / uncertain

- 90-day temporal slice is empty because dates are incomplete
- Some titles fell back to newsletter IDs when og:title was generic
- Office boilerplate can inflate “Washington” and “Arkansas” motif counts
- No private or staff-draft attribution is available; keep OFFICIAL_OFFICE

## Methodology / limits

First-party House eNewsletter pages only. NRCC copy, Wikipedia, and news paraphrases were not used as voice training. Derived features and clipped excerpts live in git. Article bodies do not.
