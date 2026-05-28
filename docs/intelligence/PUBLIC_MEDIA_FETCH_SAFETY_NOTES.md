# Public Media Fetch Safety Notes (NSI-9)

**Lane:** RedDirt  
**Purpose:** Governed fetch policy for Arkansas public media intake. No aggressive scraping.

---

## Safe ingestion rules

1. **Prefer RSS/API** over HTML scraping
2. **Obey robots.txt** before enabling `approvedForFetch`
3. **No paywall bypass** — paywalled sources are `MANUAL_REVIEW` only
4. **No credential scraping** — no login automation
5. **No private groups or private social media**
6. **Every finding** defaults `NEEDS_REVIEW`, `NON_PUBLISHABLE`, `NOT_A_CLAIM`
7. **No autonomous** claim, citation, task, or export creation

---

## Sources approved for RSS fetch

| Source | RSS / feed | Notes |
|--------|------------|-------|
| NSI-8 dry-run fixture | `data/intelligence/fixtures/nsi8-dry-run-feed.xml` | **Only** source with `approvedForFetch: true`. Local governed fixture. |

No live external RSS feeds are fetch-approved in NSI-9. Probed feeds await robots review in NSI-10.

---

## Sources with verified RSS (pending operator / robots approval)

| Source | RSS URL | robots | Status |
|--------|---------|--------|--------|
| Arkansas Advocate | `https://www.arkansasadvocate.com/feed/` | UNKNOWN | `approvedForFetch: false` |
| Arkansas Times | `https://arktimes.com/feed/` | UNKNOWN | `approvedForFetch: false` |
| Talk Business & Politics | `https://talkbusiness.net/feed/` | UNKNOWN | `approvedForFetch: false` |
| KARK | `https://www.kark.com/feed/` | UNKNOWN | `approvedForFetch: false` |
| KNWA / NWA Homepage | `https://www.nwahomepage.com/feed/` | UNKNOWN | `approvedForFetch: false` |
| MyArkLaMiss | `https://www.myarklamiss.com/feed/` | UNKNOWN | `approvedForFetch: false` |

Verification method: `RSS_URL_PROBE` on 2026-05-28 (HTTP 200 + RSS 2.0 XML header).

---

## Sources requiring manual review

All sources with `ingestionMethod: MANUAL_REVIEW`, including:

- Paywalled newspapers (Democrat-Gazette, NWA DG)
- TV stations without verified single feed (KATV, THV11, 40/29)
- Public radio (KUAR, KUAF, Arkansas PBS)
- Government / legislative / court / county pages
- Campaign party public sites
- Civic organizations
- YouTube public channels

Operators may manually create intake findings or retrieval tasks — never auto-promote.

---

## Sources with unknown robots status

29 of 30 sources have `robotsPolicyStatus: UNKNOWN`.  
NSI-10 must check robots.txt before setting `approvedForFetch: true` on external feeds.

---

## Sources not to fetch automatically

| Category | Reason |
|----------|--------|
| Paywalled news | No paywall bypass |
| HTML-only pages | No arbitrary webpage scraping |
| YouTube | API quota + policy — manual until NSI-10+ |
| Court dockets | Legal accuracy + manual review |
| Private social | Prohibited |
| Credential-gated PAC tools | Prohibited |

---

## Paywall cautions

- **Arkansas Democrat-Gazette** — manual headline review only
- **Northwest Arkansas Democrat-Gazette** — manual only
- Do not store full paywalled article text without license

---

## Public records cautions

- SOS, ethics, election commission pages may contain official statements — still **NOT_A_CLAIM** until evidence workflow
- County meeting minutes require human summary — no auto-claim from minutes

---

## Podcast / transcript limitations

- No automated podcast transcription in NSI-9
- Register program RSS in future passes; human review required
- Transcripts (if added later) are `NEEDS_REVIEW` only

---

## YouTube / API future notes

- Arkansas Legislature public YouTube registered for discovery
- YouTube Data API requires `YOUTUBE_API_KEY` (see API inventory)
- Channel metadata only until policy review — no comment scraping

---

## NSI-10 handoff

Scheduled intake may enable probed RSS feeds **only after**:

1. robots.txt allows feed fetch
2. Operator approves `approvedForFetch: true` per source
3. Rate limits configured
4. Findings remain review-gated

Promotion to retrieval tasks / citation candidates remains **human-initiated** in NSI-10.
