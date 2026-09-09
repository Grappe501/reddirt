# French Hill Vote Tracker

Standalone research and public-record website for tracking Rep. French Hill's recorded U.S. House votes, including both divergence from and alignment with the majority of House Republicans and/or a publicly documented position taken by Donald Trump.

## Purpose

This project is designed as an auditable public-record database. Every classified vote should point back to primary-source evidence wherever possible.

## Core classifications

- `party_break`: Hill voted opposite the majority of voting House Republicans on the roll call.
- `gop_alignment`: Hill voted with the majority of voting House Republicans.
- `trump_break`: Hill voted opposite a clearly documented public Trump position tied to that vote or issue.
- `trump_alignment`: Hill voted consistently with a clearly documented public Trump position tied to that vote or issue.
- `double_break`: Hill broke with both the Republican majority and Trump.
- `highly_partisan_gop_alignment`: Hill voted with the Republican majority on a roll call that meets the site's objective high-partisanship threshold.
- `highly_partisan_trump_alignment`: Hill aligned with a documented Trump position on a roll call that also meets the high-partisanship threshold.
- `highly_partisan_double_alignment`: Both highly partisan GOP alignment and Trump alignment are true.
- `unclassified`: Evidence is incomplete or the Trump position is ambiguous.

## Partisan intensity methodology

Partisan intensity is calculated from the actual party split on each House roll call, not from editorial labels.

Version 1 threshold for `highlyPartisan = true`:

1. At least 90% of voting Republicans are on one side of the roll call; and
2. At least 90% of voting Democrats are on the opposite side.

The database stores raw Republican and Democratic Yea/Nay counts and percentages, the calculated intensity score, the rule version, and the explanation used for each classification. This allows the public threshold to be audited and revised without losing the underlying data.

Votes can also be grouped into `high`, `medium`, `low`, and `unscored` partisan intensity bands. The exact scoring formula is versioned in code and should remain documented before production publication.

## Official House ingestion

The first ingestion pipeline uses the Office of the Clerk of the U.S. House as the primary source. French Hill's House Clerk/Bioguide identifier is `H001072`.

Commands:

```bash
npm run ingest:2015
npm run ingest:house
npm run check
```

`ingest:2015` is the single-year proof run. `ingest:house` processes the supported 2015-2026 range. Generated records are written to `data/generated/` by year, with an ingestion summary file.

The pipeline:

1. reads the Clerk's yearly roll-call index;
2. discovers roll-call numbers;
3. fetches the official Clerk XML for each roll call;
4. locates French Hill's recorded vote;
5. tallies Republican and Democratic Yea/Nay votes;
6. normalizes the roll call into the tracker data contract;
7. applies the objective partisanship/alignment scoring layer; and
8. preserves the official House source URL on every generated record.

Trump alignment is not inferred during House ingestion. It remains `No documented position` until a separate evidence workflow establishes a documented Trump position.

## Trump position evidence workflow

Trump-position evidence lives independently in `data/trump-evidence.json` and is governed by `data/trump-evidence.schema.json`.

A record can be `verified`, `provisional`, `ambiguous`, or `rejected`. Only `verified` records are merged into the public vote ledger and allowed to create a `trump_break`, `trump_alignment`, `double_break`, or highly partisan Trump-alignment classification.

A verified record must include:

1. the exact Congress and House roll-call number;
2. a Support or Oppose position tied to that vote or issue;
3. a plain-language evidence summary;
4. the official House vote source; and
5. separate evidence documenting Trump's position, preferably an official statement or archive, otherwise high-quality contemporaneous reporting.

The validator rejects duplicate vote keys, missing evidence summaries, missing source sets, invalid URLs, and verified records lacking either House evidence or Trump-position evidence.

Run:

```bash
npm run validate:trump-evidence
```

The initial proof record is 117th Congress Roll Call 154, H.R. 3233, the National Commission to Investigate the January 6 Attack on the United States Capitol Complex Act. The House Clerk records Hill voting Yea while 175 Republicans voted Nay and 35 voted Yea. The Trump evidence record separately documents Trump's public opposition before the vote. The resulting classification is produced by the evidence merger rather than being hand-coded into the roll-call dataset.

## Evidence standard

Prefer official House roll calls, Congress.gov, committee records, White House/official Trump statements where available, archived campaign statements, and high-quality contemporaneous reporting for contextual verification.

Never infer a Trump position solely from the Republican vote split. Trump alignment and party alignment are separate fields. Likewise, a vote should not be labeled highly partisan based on topic or rhetoric; it must meet the numerical party-split standard.

## Public site

The public site currently includes:

- searchable vote ledger
- filters by year and classification
- dedicated views for GOP breaks, highly partisan GOP alignments, Trump breaks, and Trump alignments
- permanent vote evidence pages
- dashboard summaries and year-by-year breakdowns
- primary-source links and Trump evidence source sets

Planned additions include deeper trend charts, issue-area analysis, methodology pages, correction history, and CSV/JSON exports.

## Local development

```bash
npm install
npm run dev
```

## Netlify

Deploy this folder as its own Netlify site using `french-hill-vote-tracker` as the base directory.
