# French Hill Vote Tracker

Standalone research and public-record website for tracking Rep. French Hill's recorded U.S. House votes, with special attention to votes where he diverged from the majority of House Republicans and/or a publicly documented position taken by Donald Trump.

## Purpose

This project is designed as an auditable public-record database. Every classified vote should point back to primary-source evidence wherever possible.

## Core classifications

- `party_break`: Hill voted opposite the majority of voting House Republicans on the roll call.
- `trump_break`: Hill voted opposite a clearly documented public Trump position tied to that vote or issue.
- `double_break`: Both conditions are true.
- `unclassified`: Evidence is incomplete or the Trump position is ambiguous.

## Evidence standard

Prefer official House roll calls, Congress.gov, committee records, White House/official Trump statements where available, archived campaign statements, and high-quality contemporaneous reporting for contextual verification.

Never infer a Trump position solely from the Republican vote split. Trump alignment and party alignment are separate fields.

## Planned site

The public site will include:

- searchable vote ledger
- filters by Congress, year, issue, vote type, party-break status, and Trump-break status
- vote detail pages with primary-source citations
- aggregate counts and trend charts
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
