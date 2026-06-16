# County Party Intelligence (Phase 18.7I)

Public ArkDems.org county party data — ingested, normalized, searchable, wired into county playbooks and the Executive Book.

**Primary source:** [https://www.arkdems.org/counties/](https://www.arkdems.org/counties/)

## Rebuild

```bash
cd H:/SOSWebsite/RedDirt
node scripts/run-with-h-drive-env.cjs npm run election-plan:18.7i:rebuild
```

Scrape only:

```bash
node scripts/run-with-h-drive-env.cjs npm run election-plan:county-parties:scrape
```

## Data files

| File | Purpose |
| ---- | ------- |
| `county-party-source-index.json` | 75 counties · fetch status · timestamps |
| `county-party-profiles.normalized.json` | Chair · commissioner · meeting · links |
| `county-party-meeting-calendar.candidates.json` | Parsed meeting dates through Election Day |
| `county-party-search-chunks.json` | Election Plan local search / RAG chunks |

## Docs

- [COUNTY-PARTY-INTELLIGENCE-REPORT.md](./COUNTY-PARTY-INTELLIGENCE-REPORT.md)
- [COUNTY-MEETING-ROUTING-PLAN.md](./COUNTY-MEETING-ROUTING-PLAN.md)

## Election Plan routes

- `/election-plan/county-parties` — statewide hub
- `/election-plan/county-parties/[county]` — county detail
- County playbooks — panel on each `/election-plan/counties/[slug]`

## Hard rules

- Public web data only · cite source URL + scrape timestamp
- No Cloudflare email-protection links as contact emails
- No auto-emailing chairs
- Meeting dates are **candidates** until phone confirmation
- Password-gated Election Plan · no voter/donor/private contact data
