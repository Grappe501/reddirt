# Arkansas Edge County Media Coverage Matrix (NSI-9B)

**Purpose:** Per-county media environment for NSI-5 overlay counties and border edge counties.  
**Governance:** Monitoring map only — no claims, citations, or autonomous publishing.

Legend: **LR insufficient** = Little Rock / statewide coverage likely insufficient alone.

---

| County | Region | Primary market | Secondary markets | AR sources | Cross-state sources | Local paper | Local radio | TV influence | Public meeting source | Monitoring strength | Coverage gaps | Priority |
|--------|--------|----------------|-------------------|------------|---------------------|-------------|-------------|--------------|----------------------|---------------------|---------------|----------|
| Pulaski | Central AR | Little Rock | Statewide | ADG, KARK, KATV, KUAR, Arkansas Times | — | ADG, Times | KUAR | KARK, KATV, THV11 | SOS, Legislature | STRONG | None critical | HIGH |
| Benton | NWA | Northwest Arkansas | Springfield, Joplin, Tulsa | NWA Democrat-Gazette, KNWA, Talk Business | News-Leader, Joplin Globe, Tulsa World | NWA D-G | KUAF | KNWA, KY3 spillover | County pages (manual) | MODERATE | Cross-state manual only; LR insufficient | HIGH |
| Washington | NWA | Northwest Arkansas | Springfield, Tulsa | NWA Democrat-Gazette, KNWA | News-Leader, Tulsa World | NWA D-G | KUAF | KNWA, Tulsa TV spillover | County pages (manual) | MODERATE | Cross-state fetch not approved | HIGH |
| Sebastian | River Valley | Fort Smith | Tulsa | Times Record, 40/29, 5NEWS | Tulsa World | Times Record | Limited registered | KHBS, KFSM, Tulsa TV | Sebastian County gov | MODERATE | OK spillover under manual review | HIGH |
| Craighead | NE Arkansas | Cape Girardeau Bootheel | Memphis, Little Rock | Jonesboro Sun, KAIT | Southeast Missourian, KFVS12, Commercial Appeal | Jonesboro Sun | Limited | KFVS12, Memphis TV | County pages (manual) | MODERATE | Memphis secondary; LR insufficient | HIGH |
| Crittenden | Delta | Memphis | Little Rock | Limited AR-local | Commercial Appeal, WMC, Memphis TV | Commercial Appeal | WKNO | WMC, WREG, WHBQ | County pages (manual) | MODERATE | **LR insufficient** — Memphis dominant | HIGH |
| Miller | SW Arkansas | Texarkana | Shreveport | Texarkana Gazette | KSLA, Shreveport Times, Tyler paper | Texarkana Gazette | Limited | KTAL, KSLA | County pages (manual) | MODERATE | LOCAL_PAPER_CRITICAL; TX/LA spillover | HIGH |
| Union | South AR | Monroe LA | Shreveport | MyArkLaMiss | Monroe News-Star, Shreveport outlets | Monroe News-Star | Limited | KNOE, KSLA spillover | County pages (manual) | MODERATE | LR insufficient | MEDIUM |
| Mississippi | Delta | Memphis | Bootheel | Limited AR-local | Commercial Appeal, WMC, Southeast Missourian, KFVS12 | Commercial Appeal | WKNO | Memphis + Bootheel TV | County pages (manual) | MODERATE | **LR insufficient** | HIGH |
| Lee | Delta | Memphis | Bootheel | Limited AR-local | Commercial Appeal, WMC, KFVS12 | Commercial Appeal | Limited | Memphis TV | County pages (manual) | MODERATE | **LR insufficient** | MEDIUM |

---

## Counties flagged: Little Rock insufficient

- Benton, Washington, Sebastian, Craighead, Crittenden, Miller, Union, Mississippi, Lee

Pulaski is the only NSI-5 overlay county where statewide Little Rock media is likely sufficient for baseline voter awareness.

---

## Cross-state source registry (NSI-9B)

Registered cross-state sources (state ≠ AR): Memphis Commercial Appeal, WMC Action News 5, Southeast Missourian, Springfield News-Leader, Joplin Globe, Tulsa World, Shreveport Times, KSLA News 12, Monroe News-Star, KFVS12, Tyler Morning Telegraph.

All remain `approvedForFetch: false` except governed dry-run fixture. RSS verified only where probed (Joplin Globe, Tulsa World).

---

## Engine linkage

- Profiles: `src/lib/intelligence/mediaMarketIntelligence.ts` → `resolveCountyMediaMarketProfile(countyId)`
- Registry: `data/intelligence/arkansas-media-source-registry.json`
- UI: `/admin/intelligence/media-intake`, county briefings, morning brief

**Next step:** NSI-10 — scheduled intake + human promotion workflow.
