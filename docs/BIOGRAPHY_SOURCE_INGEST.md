# Biography source ingest (sites + social)

This repo already carries **hand-maintained** background modules used by site search (`npm run ingest`):

- `src/content/background/forevermost-farms.ts`
- `src/content/background/stand-up-arkansas.ts`

For **fresh snapshots** of public HTML (owned sites), use:

```bash
npm run scrape:biography-sources
```

That runs `scripts/scrape-public-biography-sources.ts`, which fetches a curated list of URLs (Forevermost Farms, Stand Up Arkansas, Kelly Grappe campaign Squarespace) and writes Markdown under:

`docs/ingested/biography-scrapes/<hostname>/`

Review files before committing; treat them as **research drafts**, not legal copy.

### Single URL

```bash
npx tsx scripts/scrape-public-biography-sources.ts --url "https://www.kellygrappe.com/priorities"
```

### Facebook — official Page metadata (API)

The campaign’s **`syncFacebookPageFeed`** path (`src/lib/integrations/facebook/sync.ts`) pulls **recent Page posts** into `InboundContentItem` when `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` are set.

**Page “About” / description text** is different from the feed. Use:

```bash
npx tsx scripts/fetch-facebook-page-about.ts
```

(requires the same env vars). This uses Graph API fields such as `about`, `description`, and `general_info` — **not** HTML scraping.

### What we do **not** automate here

- **Personal Facebook profile bios**, locked posts, or logged-in views — Meta’s terms and technical barriers prohibit unattended scraping; capture those **manually** into `docs/` or admin notes if needed.
- **Instagram / TikTok / X bios** — use official APIs / exports where available, or manual copy into approved docs.
- **Bulk crawling** — the snapshot script is deliberately small and rate-limited.

### After you have Markdown snapshots

1. Edit for accuracy and tone.
2. Optionally fold vetted prose into `src/content/background/*.ts` or the About page components.
3. Re-run `npm run ingest` so `SearchChunk` / assistant notebooks pick up embedded route seeds (existing pipeline).
