# Arkansas Media Intelligence Intake Plan (NSI-7)

**Lane:** RedDirt  
**Status:** Planning artifact — live intake deferred to **NSI-8**  
**Governance:** All findings default `NEEDS_REVIEW` and `NON_PUBLISHABLE`

---

## Purpose

Document how to monitor **public** Arkansas political information sources safely, without violating robots.txt, paywalls, terms of service, or governance gates.

This plan covers **governed intake design only**. NSI-7 registers sources and routes normalized findings; NSI-8 enables live RSS/feed ingestion into a review queue.

---

## Source categories

| Category | Examples | Ingestion mode |
|----------|----------|----------------|
| Public RSS feeds | News outlets, government feeds | RSS parser — preferred |
| State/local news sites with RSS | Verified feed URLs only | RSS after URL verification |
| Blogs | Public political blogs | RSS if available; else manual |
| Public podcasts | Show RSS / public pages | Podcast RSS |
| YouTube public channels | Public channel RSS / API (later) | API with quota governance |
| Public radio pages | NPR affiliates, UALR Public Radio | RSS after verification |
| Public government meeting pages | Leg agendas, SOS press releases | Public page / RSS |
| Public press releases | SOS, AG, state agencies | RSS or structured page |
| Public campaign sites | Opponent/candidate public sites | RSS or manual review |
| Public legislative pages | arkleg.state.ar.us bills | Public bill pages / RSS if available |
| Public court / administrative updates | Published dockets, orders | Manual + public RSS where exists |

---

## Rules (non-negotiable)

1. **Obey robots.txt** — check before any automated fetch
2. **Use RSS/API when available** — prefer structured feeds over HTML scraping
3. **No paywall bypass** — do not scrape credential-gated content
4. **No credential scraping** — no login automation
5. **No private groups** — Facebook groups, Slack, private lists excluded
6. **No non-public data** — voter file, internal polls, private comms excluded
7. **Store source metadata** — `data/intelligence/arkansas-media-source-registry.json`
8. **Mark all new findings `NEEDS_REVIEW`**
9. **AI may suggest relevance but not create claims**
10. **Human review required before promotion** to citations, tasks, claims, or briefings

---

## Intake pipeline (NSI-7 design → NSI-8 live)

```text
Public source (RSS/API/public page)
  → normalizeMediaFinding()     [NEEDS_REVIEW, NON_PUBLISHABLE]
  → rankFindingForReview()
  → routeFindingToIntelligenceSystem()
      → opposition research (queue)
      → citation locker (hold)
      → retrieval tasks (suggest)
      → AI suggestion sandbox (relevance only)
      → county briefing (attach if county confirmed)
      → narrative state (NO auto-update)
      → debate prep (morning brief surface only)
  → Operator review queue (NSI-8)
  → Human promotion (if approved)
```

---

## Adapter module

**File:** `src/lib/intelligence/publicMediaMonitor.ts`

| Function | Role |
|----------|------|
| `loadMediaSourceRegistry()` | Load governed source registry |
| `summarizeMediaMonitoringReadiness()` | Gap analysis for morning brief |
| `normalizeMediaFinding()` | Create governed finding object |
| `rankFindingForReview()` | Priority for operator queue |
| `routeFindingToIntelligenceSystem()` | Route to intelligence subsystems (no auto-promotion) |

**No live scraping in NSI-7** unless repo already has approved fetch infrastructure for a specific source.

---

## Review workflow

1. Finding ingested → `NEEDS_REVIEW` + `NON_PUBLISHABLE`
2. Operator assigns reviewer
3. Reviewer confirms: source URL, date, county relevance, claim potential
4. If relevant → create retrieval task or link to existing opposition research
5. If citable → citation locker entry (still not export-ready until claim review)
6. Never auto-promote to export-ready messaging

---

## AI boundaries

- AI **may:** suggest relevance score, summarize public headline, route to county overlay
- AI **may not:** create claims, infer motive, auto-publish, score individual voters, generate export-ready copy

---

## NSI-8 next step

**NSI-8 only: Live Public Media Intake + Review Queue**

- Verify RSS URLs in registry
- Implement scheduled RSS poll with robots.txt check
- Persist findings to review queue table/file
- Wire morning brief + Evidence Command to queue counts
- Maintain export-ready claim count gate (currently 2)

---

## Related artifacts

- `data/intelligence/arkansas-media-source-registry.json`
- `docs/intelligence/API_AND_FEED_KEY_INVENTORY.md`
- `/admin/intelligence/morning-brief` — media gap surfacing
