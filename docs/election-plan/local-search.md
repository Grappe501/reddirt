# Election Plan Local Search (18.7H)

Password-protected keyword search over an allowlisted local corpus. No external web search. No admin, voter, donor, or private contact data.

## Rebuild the index

```bash
npm run election-plan:search:build
```

Writes `data/election-plan/election-plan-search-index.json` (~1,000+ entries from page briefs, 75 counties, cities, executive book chapters, strategic plan markdown, campaign brain docs, and safe public routes).

Also run after:

- New page briefs in `data/campaign-brain/election-plan/page-briefs.source.json`
- Executive Book chapter changes
- County victory target data updates
- Workbench snapshot rebuild (`npm run election-plan:build`)

## Corpus inclusion

| Included | Excluded |
|----------|----------|
| `/election-plan` portal pages (via briefs) | `/admin/**` |
| Executive Book markdown | Donor / fundraising donor files |
| `docs/strategic-plan/plurality-victory-plan/**` | Voter files |
| `docs/campaign-brain/**` (filtered) | Relational / private contacts |
| Public site nav routes (safe list) | Opposition raw intel |
| County & city snapshot entries | Credentials / `.env` |

Exclusion rules: `src/lib/election-plan/election-plan-search-exclusions.ts`

## Routes

- **Search UI:** `/election-plan/search?q=...`
- **API:** `GET /api/election-plan/search?q=...` (requires election-plan session cookie)

## Page summaries

Registry: `data/campaign-brain/election-plan/page-briefs.source.json`

Component: `PageBrief` / `PageBriefFromPath` (auto on portal layout for drill-down pages)

Fields: title, answers, key metrics, best for, related links

## Auth

Search API verifies `reddirt_election_plan_session` cookie (same as portal). Middleware does not cover `/api/*`; auth is enforced in the route handler.

## Keyword vs Brain

Search works as **keyword scoring** without OpenAI. Optional future layer: merge allowlisted `SearchChunk` rows with `election-plan:` path prefix for semantic retrieval — same firewall rules apply.
