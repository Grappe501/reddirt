# Kelly SOS — thorough build plan (4 passes, Day 3+)

**Status:** Planning — **do not** treat as launched copy until counsel/Steve sign-off on contrast and claims.  
**Workspace:** `H:\SOSWebsite` — respect **lane firewalls** (`sos-public` = clean public; `RedDirt` = engine + admin + deeper research surfaces).  
**Last updated:** 2026-04-27.

**Pass 1 (corpus) executed:** 2026-04-27 — see [`KELLY_SOS_PASS1_COMPLETION_RECORD.md`](./KELLY_SOS_PASS1_COMPLETION_RECORD.md). **Pass 1.5** = per-bill arkleg verification and matrix fill.

---

## 0. Principles (non-negotiable)

1. **Facts over mud** — Every public claim about an opponent ties to **bill number, vote record, official text, or primary source**. No “corrupt / criminal / stole” without a court-quality record (unchanged from Day 2 rules).
2. **Naming** — Public web copy does **not** use the opponent’s **name** unless **Steve explicitly approves**. Internal dashboards, research JSON, and staff briefs **may** name for research; export to `sos-public` must be **reviewed**.
3. **“State librarian”** — Arkansas’s **State Librarian** is a **different** role/agency. **Public** language: **keeper of the public record**, **civic librarian** *metaphor*, **calm, organized stewardship** — never the literal title “State Librarian” for SOS. Internal strategy may use “picture a librarian” as **psychology framing**; legal/counsel review for any mass media.
4. **FOIA** — User intent: **Freedom of Information Act** (Arkansas “FOI”) — campaign message: **proactive transparency** reduces *reliance* on fighting for records after the fact; SOS should **publish** calendars, explain **process**, and **document** petition rules clearly.
5. **Scraping** — **No** unmetered or ToS-violating scraping of news paywalls. **Do:** official PDFs, Arkansas Legislature exports, Clinton School / NCOC **public** PDFs, RSS/news **with** licensing and attribution. **Media on opponent:** admin “intelligence queue” with **URL, date, outlet, summary, fair-use** note.

---

## 0.1 What you asked for → where it lands (lane map)

| Theme | Primary home (build) | Notes |
|--------|----------------------|--------|
| Hammer record (initiatives, elections, business, committees) | `RedDirt` **admin/research** first; **curated** public later | Full bill grid = data + verification |
| One-page candidate FACTS brief (updated) | `RedDirt/docs/briefs/` + optional **PDF export** from admin | Kelly-only talking points; regen on new research |
| Rockefeller grassroots + two-party + quotes | `docs/research/` + public **editorial/blog** eventually | Quote every line with **primary or dual** source |
| SOS = calm, organized, **female-coded stewardship** (psychology) | Messaging doc + **Meet Kelly** / **priorities** (careful) | Avoid identity stereotypes in **public** copy; use **values** language |
| Transparency / less FOI **friction** | `priorities`, `direct-democracy`, **SOS duties** tie-in | Policy platform, not statute rewrite in copy |
| Ballot initiatives — SOS role, technicalities, **BQC support** | Explainers + **Kelly commitment** section | Must match **what SOS can legally do** (train on process, clear forms; not “rewrite law” in a sentence) |
| EH clubs, VFDs, maps, KPIs | **Admin** dashboards + **field** content (not fake public events) | Reuse `tentativeExternalEvents` pattern; expand |
| NAACP, HBCU chapters, Black churches | Coalition module in admin + **outreach** lists | Same firewall: **tentative** until host confirms |
| “What Kelly will do” — 100-day + first term | New **public** hub + CMS blocks | Legal review for anything implying **sole** authority |
| Listening session series — coordinator tools | `RedDirt` admin + calendar + volunteer tasks | May touch Prisma, events, comms |
| Capitol grounds (brass doors, parking, tunnel, rural programs) | **Policy** page + **fact-check** (SOS jurisdiction vs GA) | Some items need **legislative** or **building authority** clarity — don’t over-promise |
| Arkansas **Civic Health Index** (Clinton School + partners) | **Ingest** PDF + footnote strategy | Official: [Open Governance Lab — Arkansas Civic Health Index](https://clintonschool.uasys.edu/centers-initiatives/open-governance-lab/arkansas-civic-health-index/) |

---

## Pass 1 — **Corpus, verification, and skeletons** (research + data + no mass public dump)

**Goal:** Build the **evidence layer** and **empty or partial** UI shells so later passes fill safely.

### 1A. Kim Hammer — ballot initiative & related record (exhaustive target)

- **Source of truth pipeline:** Arkansas Legislature **bill search** + existing export in `docs/briefs/kim-hammer-candidate-brief-tonight.md` + `docs/kim-hammer-sos-brief-source-report.md`.
- **Deliverables:**
  - **`docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md`** — expand to **one row per bill** with: session, role (sponsor / cosponsor / vote), **status** (became law / failed), **summary**, **impact on voters/initiatives**, **SOS relevance**, **risk**, **approved public phrasing (no name)**.
  - **`docs/research/HAMMER_BALLOT_INITIATIVE_BILLS_MASTER.md`** — narrative index of **all** initiative/petition/election-admin/business-services bills with his name on them (ever) — **human-verified** against arkleg.
  - **Optional JSON** for admin: `RedDirt/data/intelligence/` or `prisma` seed pattern — **only** after schema agreed.
- **Committees:** add section “**Committee seats** affecting elections / state agencies / business” with **dates** from official Senate bio + session journals.
- **Media log (not scrape):** spreadsheet or admin table: **outlet, date, headline, URL, summary, use** (quote / background / avoid).

### 1B. Winthrop Rockefeller — campaign narrative for two-party / grassroots

- **Deliverables:** extend `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md` with **chronology** (1964 / 1966), **grassroots tactics** (from Encyclopedia + WRI + **primary** speeches if rights-cleared).
- **Quote discipline:** each quote = **two** sources or **one** primary PDF.
- **Explict note:** He was **Republican** in a **Democratic-dominant** era — use for **historical accuracy** in long-form, not to confuse party label for Kelly’s race.

### 1C. Arkansas Civic Health Index — ingest

- **Deliverables:** `docs/research/ARKANSAS_CIVIC_HEALTH_INDEX_SOURCE_MAP.md` — links to **Clinton School Open Governance Lab**, **NCOC** mirror if any, **PDF paths**, **version date** (e.g. 2023 release).
- **Next:** extract **bullet facts** into `src/content` **or** admin RAG chunks — **Pass 2**.

### 1D. “Keeper of the record” / psychology framing (internal)

- **Deliverable:** `docs/research/SOS_STEWARD_FRAMING_INTERNAL.md` — **internal only**: voter mental model (organized, calm, clear, **stewardship**). **Public** copy still uses `keeperOfRecords.ts` patterns.
- **Counsel:** one pass for anything that could read as **gendered** job requirement.

### 1E. Listening sessions — requirements doc

- **Deliverable:** `docs/COMMUNITY_LISTENING_SERIES_RUNBOOK.md` — roles (coordinator, host, notes, follow-up), **checklist**, **KPIs** (RSVP, attendance, themes captured).

**Pass 1 exit:** Research files exist; matrix **row count** known; no new **unverified** claims on `sos-public`.

---

## Pass 2 — **Public narrative + Kelly-facing briefs** (curated, citeable)

**Goal:** Ship **approved** language to the **right** surfaces; keep **heavy** opposition in **RedDirt/admin/editorial**.

### 2A. One-page FACTS brief (candidate)

- **File:** `RedDirt/docs/briefs/KELLY_OPPOSITION_FACTS_ONE_PAGER.md` (regen date in header).
- **Contents:** 5–7 **record-based** contrasts (no name on **sos-public** export); **“If asked about initiatives”**; **FOIA/transparency** line; **BQC / petition** help pledge; **single** Rockefeller line (optional) with cite.
- **Process:** Steve + policy lead **sign** each bullet.

### 2B. Public site (`sos-public`) — themes

- **Transparency** — homepage / priorities blurbs: **proactive publication**, **plain-language** petition path, **respect** for ballot question committees.
- **SOS job mental model** — “**straighten the public shelf**” / **keeper of the record** — **not** “State Librarian.”
- **Rockefeller** — short **values** bridge in **About** or **editorial** only; link Encyclopedia.

### 2C. RedDirt public `(site)` — deeper

- **What Kelly will do** — first tranche: **100-day** outline (high level) + **first-term** headers (no statutory overclaim).
- **Direct democracy** — BQC / training / **technicality** problem **described with cite** (news or court/ag opinion if any — **verify**).

### 2D. Civic Health Index — public use

- Pull **5–10** chartable stats into **explainers** or **priorities** with **footnotes** to the Index PDF.

**Pass 2 exit:** `npm run build` in each **touched** lane; brief is **dated** and **owned**.

---

## Pass 3 — **Dashboards & field operations** (admin + maps + KPIs)

**Goal:** **Team** can **run** outreach; data stays **internal** until confirmed.

### 3A. Opposition research **dashboard** (admin)

- Routes under `RedDirt/src/app/admin/...` (or existing intelligence board): **filter** by topic (initiatives, elections, business), **bill status**, **media list**, **talking point** approved flag.
- Wire to **matrix** JSON or DB when ready.

### 3B. EH + VFD + NAACP + churches + colleges

- **Data model:** org type, county, **tentative** schedule, **confidence**, **last visit**, **KPI** (contacts, follow-ups).
- **Maps:** reuse Leaflet patterns; **do not** publish private addresses without permission.
- **KPI examples:** visits/week, counties touched, volunteer hours, signups attributed.

### 3C. Listening session **coordinator** tools

- Calendar integration (Google or internal), **task** list, **email template** stubs, **volunteer** roles — **RedDirt** admin + optional **Mobilize** link.
- **KPIs:** sessions held, attendees, issues logged, media hits.

### 3D. Capitol / grounds **policy** wishlist (disciplined)

- Tabular: **idea** | **who decides** (SOS vs General Assembly vs capitol police) | **next step** | **public safe one-liner**.
- Items you listed: brass doors **accessibility**, **weekend** public access (verify **security** rules), **county clerk** funding (often **county** + state aid — fact-check), **parking** / **tunnel** — **verify** who controls; avoid **false** “I will open the tunnel” if not SOS authority.

**Pass 3 exit:** Admins can **demo** dashboards; field data entry path works; **no** PII leak.

---

## Pass 4 — **Polish, coalition play, media rhythm** (scale + guardrails)

**Goal:** Turn systems into **habit** and **message discipline**.

### 4A. Media monitoring

- Scheduled **review** of opponent + **race** keywords; **no** auto-posting; comms **approves** quotes.

### 4B. Coalition **playbooks**

- EH: chapter discovery, **volunteer** ask, **nonpartisan** host respect.
- NAACP / churches / colleges: **relationship-first** scripts; **confirm** with org leaders.

### 4C. Public **editorial** cadence

- Rockefeller + civic health + transparency — **blog/Substack** calendar.

### 4D. Legal / compliance **re-read**

- All public pages; **paid** content; **disclaimers** for policy promises.

**Pass 4 exit:** Launch checklist green for **message**; ongoing **KPI** review weekly.

---

## Dependency order (critical path)

```
Pass 1 (evidence + sources) → Pass 2 (public + brief) → Pass 3 (ops dashboards) → Pass 4 (scale + compliance)
```

**Do not** put **unverified** Hammer bill claims on `sos-public` before **Pass 1** row review.

---

## Suggested ownership (Cursor vs Codex — your protocol)

| Pass | Cursor (foreground) | Codex / integration |
|------|---------------------|---------------------|
| 1 | Structured docs, JSON stubs, Prisma drafts | Arkleg verification, matrix audit |
| 2 | `sos-public` copy, RedDirt pages | Cross-lane diff, build |
| 3 | Admin UI slices | RBAC, data review |
| 4 | Playbooks, charts | Launch QA |

---

## Immediate next actions (before Day 3 “code” starts)

1. **Steve:** Confirm **public naming** rule for opponent on **RedDirt-only** vs **never** until date X.  
2. **Policy:** Assign one person to **complete** FC matrix rows for **2025** initiative bills (enrolled text + vote).  
3. **Download** [Arkansas Civic Health Index](https://clintonschool.uasys.edu/centers-initiatives/open-governance-lab/arkansas-civic-health-index/) PDF to `RedDirt/docs/ingested/` or `source-ingest` with manifest.  
4. **Start Pass 1** documentation before large UI — **evidence first**.

---

## Appendix — existing files to extend (not replace)

- `docs/research/OPPONENT_RECORD_CONTRAST_RESEARCH.md`
- `docs/legal/OPPONENT_CONTRAST_FACT_CHECK_MATRIX.md`
- `docs/research/WINTHROP_ROCKEFELLER_REFORM_CAMPAIGN_RESEARCH.md`
- `docs/research/SOS_AS_KEEPER_OF_RECORDS_MESSAGING.md`
- `src/content/strategicThemes/*`
- `src/content/events/tentativeExternalEvents.ts`
- `docs/briefs/kim-hammer-*.md`

---

*This plan is the single steering document for **thorough** 4-pass implementation. Slice tickets should reference **Pass #** and **section** (e.g. “3B — EH map KPI”).*
