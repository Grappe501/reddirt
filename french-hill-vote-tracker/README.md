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

## Evidence standard

Prefer official House roll calls, Congress.gov, committee records, White House/official Trump statements where available, archived campaign statements, and high-quality contemporaneous reporting for contextual verification.

Never infer a Trump position solely from the Republican vote split. Trump alignment and party alignment are separate fields. Likewise, a vote should not be labeled highly partisan based on topic or rhetoric; it must meet the numerical party-split standard.

## Planned site

The public site will include:

- searchable vote ledger
- filters by Congress, year, issue, vote type, party-break status, GOP-alignment status, Trump-break status, Trump-alignment status, and partisan intensity
- dedicated views for highly partisan votes where Hill aligned with the GOP, Trump, or both
- dedicated views for votes where Hill broke with the GOP, Trump, or both
- vote detail pages with primary-source citations and raw party split
- aggregate counts and trend charts
- alignment/breakdown timelines by Congress and issue area
- methodology and sourcing page
- data-quality and ambiguity flags
- exportable CSV/JSON datasets

## Local development

```bash
npm install
npm run dev
```

## Netlify

Deploy this folder as its own Netlify site using `french-hill-vote-tracker` as the base directory.
