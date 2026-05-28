# Arkansas Media Source Coverage Matrix (NSI-9)

**Generated:** 2026-05-28  
**Lane:** RedDirt / Campaign Intelligence  
**Purpose:** Map Arkansas public political information sources for governed NSI-8 intake.

---

## Summary

| Metric | Count |
|--------|------:|
| Total registered sources | 31 |
| Fetch-approved (`approvedForFetch: true`) | 1 (dry-run fixture only) |
| RSS URL verified (probe) | 6 |
| Manual review only | 24 |
| Unknown robots status | 30 |

---

## Source matrix

| Source | Type | Region | Counties | Topics | RSS status | Fetch approved | Manual review | Campaign use case | Review risk |
|--------|------|--------|----------|--------|------------|----------------|---------------|-------------------|-------------|
| NSI-8 dry-run fixture | fixture | statewide | statewide, pulaski | elections, legislation | local file | **yes** | no | intake testing | low |
| Arkansas Advocate | news | statewide | statewide | legislation, elections | verified probe | no | pending robots | opposition, debate | medium |
| Arkansas Times | news | statewide | statewide, pulaski | local-politics | verified probe | no | pending robots | opposition, Pulaski | medium |
| Arkansas Democrat-Gazette | news | statewide | statewide, pulaski | elections | none (paywall) | no | **yes** | statewide news | high (paywall) |
| Talk Business & Politics | news | statewide | statewide | legislation | verified probe | no | pending robots | strategy, debate | medium |
| KARK | tv_news | central | pulaski | local-politics | verified probe | no | pending robots | Pulaski media | medium |
| KATV | tv_news | central | pulaski | local-politics | not verified | no | **yes** | Pulaski media | medium |
| THV11 | tv_news | central | pulaski | local-politics | index HTML only | no | **yes** | Pulaski media | medium |
| KNWA / NWA Homepage | tv_news | northwest | benton, washington | local-politics | verified probe | no | pending robots | NWA briefings | medium |
| 40/29 News | tv_news | northwest | washington, benton, sebastian | local-politics | not verified | no | **yes** | NWA / River Valley | medium |
| NWA Democrat-Gazette | news | northwest | benton, washington | local-politics | paywall | no | **yes** | NWA briefings | high (paywall) |
| MyArkLaMiss | tv_news | south | statewide | local-politics | verified probe | no | pending robots | South AR | medium |
| KUAR Public Radio | public_radio | central | pulaski | politics, podcasts | not verified | no | **yes** | debate, statewide | medium |
| KUAF | public_radio | northwest | washington, benton | politics, podcasts | not verified | no | **yes** | NWA audio | medium |
| Arkansas PBS | public_broadcast | statewide | statewide | politics, podcasts | not verified | no | **yes** | statewide TV | medium |
| Arkansas Legislature | legislative | statewide | statewide | legislation, meetings | not verified | no | **yes** | opposition bills | low (workbench) |
| Arkansas Secretary of State | government | statewide | statewide | elections, SOS | not verified | no | **yes** | core race | high |
| Arkansas Ethics Commission | government | statewide | statewide | campaigns, ethics | not verified | no | **yes** | opposition research | high |
| Arkansas Supreme Court | court | statewide | statewide | court-legal | not verified | no | **yes** | legal monitoring | high |
| State Board of Election Commissioners | government | statewide | statewide | election-integrity | not verified | no | **yes** | integrity | high |
| Pulaski County Election Commission | county | central | pulaski | elections, meetings | not verified | no | **yes** | county briefing | medium |
| Benton County Government | county | northwest | benton | public-meetings | not verified | no | **yes** | county briefing | medium |
| Washington County Government | county | northwest | washington | public-meetings | not verified | no | **yes** | county briefing | medium |
| Sebastian County Government | county | river-valley | sebastian | public-meetings | not verified | no | **yes** | county briefing | medium |
| Craighead County Government | county | northeast | craighead | public-meetings | not verified | no | **yes** | county briefing | medium |
| Jonesboro Sun | news | northeast | craighead | local-politics | not verified | no | **yes** | NE Arkansas | medium |
| AR GOP public site | campaign | statewide | statewide | campaigns | not verified | no | **yes** | opponent ecosystem | medium |
| AR Dems public site | campaign | statewide | statewide | campaigns | not verified | no | **yes** | coalition context | low |
| ACLU of Arkansas | civic_org | statewide | statewide | voting rights | not verified | no | **yes** | issue monitoring | medium |
| AR Public Policy Panel | civic_org | statewide | statewide | legislation | not verified | no | **yes** | policy context | medium |
| AR Legislature YouTube | video | statewide | statewide | legislation, meetings | API not enabled | no | **yes** | hearing monitoring | medium |

---

## Coverage gaps

### Regions with weak automated coverage
- **Delta** — no dedicated registered source (rely on statewide + manual)
- **Southwest Arkansas** — only MyArkLaMiss partial; no Texarkana / Hot Springs dailies
- **River Valley** — Sebastian county gov only; limited TV RSS

### Counties with thin dedicated coverage
- All NSI-5 overlay counties have county gov entries; **none** have verified RSS
- **Jefferson, Faulkner, Saline** — no county-specific sources registered yet

### Topic gaps
- **podcasts** — no verified podcast RSS feeds
- **public-meetings** — registered as manual only; no agenda RSS
- **court-legal** — Supreme Court manual only; no lower-court systematic coverage

### Podcast / audio gaps
- KUAR, KUAF, Arkansas PBS, YouTube legislature — all manual review

### Public meeting gaps
- Quorum Court agendas not registered per county beyond gov homepages
- Election commission minutes require operator retrieval

### Court / legal gaps
- No automated docket monitoring
- Ethics commission filings manual only

---

## RSS verified (probe 2026-05-28) — not fetch-approved until robots review

1. `https://www.arkansasadvocate.com/feed/`
2. `https://arktimes.com/feed/`
3. `https://talkbusiness.net/feed/`
4. `https://www.kark.com/feed/`
5. `https://www.nwahomepage.com/feed/`
6. `https://www.myarklamiss.com/feed/`

---

## Next discovery priorities (NSI-10)

1. robots.txt review for probed RSS feeds
2. KUAR / KUAF program-level podcast RSS
3. Delta and Southwest regional dailies (manual registry)
4. County Quorum Court agenda pages for NSI-5 counties
5. YouTube Data API policy for legislature channel (optional)
