# Arkansas rule source audit

## Official agencies (authoritative)

- **Arkansas Ethics Commission** — candidates, calendars, forms, CAR-RCFD rules, campaign finance manual (PDF manual download)
- **Arkansas Secretary of State** — financial disclosure, candidate filing, ethics links
- **Arkansas Code** — Title 7 reference (needs legal review; verify current statute text)

## Catalog location

- `src/lib/compliance/knowledge/arkansas-rule-source-catalog.ts` — canonical list
- `data/compliance/knowledge/sources/arkansas-rule-sources.json` — persisted verification status

## Per-source fields

Each record includes: `id`, `title`, `sourceAgency`, `url`, `retrievedAt`, `sourceFormat`, `topics`, `verificationStatus`, `citationLabel`, optional human review (`reviewedByInitials`, `reviewedAt`, `reviewNote`).

## Verification statuses

- `official_link_verified` — HEAD/GET check passed
- `downloaded_official_source` — HTML scraped to `data/compliance/knowledge/raw/`
- `needs_legal_review` — official PDF/reference; officer must confirm effective date
- `manual_needed` — PDF or large file; download manually
- `broken_link` — re-run `compliance:rules:verify-links`

## Human review

`verified_authoritative` is **only** set when `reviewedByInitials` is recorded via `/admin/compliance/rules` — never by automation alone.
