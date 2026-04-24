# Opposition Intelligence Engine (INTEL-OPS-1 + INTEL-OPS-2)

**Packets:** **INTEL-OPS-1** — Blueprint + protocol for **Campaign Intelligence** (opposition research), **docs only** (no app code in this packet). **INTEL-OPS-2** — **Competitor** **intelligence** **expansion**: **public-record** **requirements**, **source** **rules**, **conceptual** **data** **model**, **ingest** **queue** cross-ref (implementation still future).  
**Stack:** `RedDirt/` — future implementation will live under **Campaign Intelligence / Reporting** and related lanes.  
**Cross-ref:** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) · [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) (**§6.5** Competitor Intelligence Ingest Queue; **§6.6** Competitor Intelligence Sources) · [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) (**INTEL-2**) · [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md)

**Core rule:** **Public, lawful, source-backed** information only. **No** fabrication. **Human review** before anything is used **externally** or drives **campaign action**. **Broad automated ingest** of opposition-related source material is **gated** behind **election ingest COMPLETE** (or **explicit waiver**) per [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) and [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) — **INTEL-1** (manual entry + citations) is **not** blocked by that gate.

---

## 1. Purpose

The **Opposition Intelligence Engine** is the **campaign-defined** capability to track **public, lawful, source-backed** information about **opponents**, **PACs**, **organizations**, **donors**, **messages**, **filings**, **events**, and **political networks** — with **provenance**, **confidence**, **review status**, and **ethical guardrails**.

It exists to support **internal** planning, **message awareness**, **finance mapping** (later), and **coherent** **narrative** **hygiene** — **not** to replace **deterministic truth** in the brain (`truth.ts` / `truth-snapshot.ts`) or **voter**-level **targeting**.

---

## 2. Core modules (conceptual)

| Module | Role |
|--------|------|
| **Opponent profiles** | Structured view of declared candidates / principal committees / well-known opposition figures **as they appear in public records and public statements** — always **source-linked**. |
| **PAC / organization profiles** | Public committees, parties, IE groups, nonprofits **as disclosed** in filings or **public** sites. |
| **Donor and financial network tracking** | Links **public** contributions, vendors, and reported flows — **aligned** with **Finance** later; **no** private data purchases. |
| **Public messaging analysis** | Themes, **quoted** or **cited** copy, ad references — **comms** uses this for **awareness** and **planning**, **not** auto-response. |
| **Event and activity tracking** | **Public** rallies, filings of events where required, **announced** schedules — **not** covert tracking. |
| **Relationship / influence mapping** | **Inferred** links between entities — stored as **inference** with **confidence** and **review** (see §5–6). |
| **Source document library** | PDFs, exports, screenshots, links with **captured** **metadata** (retrieval date, URL, filing id). |
| **Intelligence notes** | Free-form **analyst** notes; **never** the **sole** **evidence** for a **factual** claim. |

---

## 3. Allowed sources

- **Public** campaign **finance** filings (FEC, AEC/state equivalents where applicable)  
- **Secretary of State** / **elections** **division** public filings and lists  
- **Federal** and **state** **disclosure** where **legally** **accessible** without special access  
- **Public** **websites** and **press** **releases** (official campaign sites, party pages)  
- **Public** **social** **media** (no ToS-breaking automation in product without legal review)  
- **News** **articles** and **reputable** **journalism** (cited, not “heard somewhere”)  
- **Public** **ads** and **ad** **libraries** where available  
- **Public** **event** **announcements** and **notices**  
- **User-provided** **documents** the campaign **lawfully** **possesses** and may **rely** on (e.g. handouts received at public events) — still **label** **provenance**

---

## 4. Prohibited activity

- **Hacking** or **unauthorized** **access** to **accounts**, **databases**, or **private** systems  
- **Misrepresentation** (posing as someone else, **false** **pretenses** to obtain data)  
- **Private** **surveillance** of **homes**, **families**, or **non-public** **spaces**  
- **Purchasing** **private** **personal** data **bundles** for **opposition** **research**  
- **Doxxing** or **publishing** **sensitive** **personal** data **not** **already** **public** in **appropriate** **context**  
- **Treating** **rumor** or **unverified** **social** **screenshots** as **verified** **fact** in **external** **materials**

*This list is **policy**; **legal** **counsel** should **constrain** **real** **field** and **comms** **work**.*

---

## 5. AI guardrails

- **No** **fabrication** of **sources**, **quotes**, or **filing** **ids**  
- **Every** **factual** **claim** in **generated** text **should** point to **a** **stored** **source** **or** be **flagged** as **inference**  
- **Confidence** (per **finding** and **per** **extraction** where applicable):  
  - **verified** — **primary** **source** **document** **or** **official** **filing** **retrieved** and **cited**  
  - **likely** — **strong** **secondary** **reporting** or **consistent** **public** **pattern**; **not** a **primary** **doc**  
  - **unverified** — **tip**, **leak** **claim**, or **single** **unconfirmed** **post**  
  - **disputed** — **contradictory** **public** **sources**; **do** **not** **collapse** to **one** **truth** without **review**  
- **Separate** in **storage** and **UI** (when built): **fact** (sourced) · **inference** (analyst) · **recommendation** (what to do — **governance** **heavy**)  
- **Human** **review** **required** before: **outbound** **comms** **citing** **opposition** **intel**, **paid** **media** **concepts**, or **any** **volunteer**-facing **talking** **points** **derived** from this system

---

## 6. Conceptual models (definitions only — no Prisma schema in INTEL-OPS-1; **INTEL-3** adds Prisma tables + helpers; see §10 for INTEL-OPS-2 table list)

Each **model** is a **future** **persisted** **shape**. **Common** **attributes** (all **rows** or **all** **first-class** **objects** where applicable): **source** (link, filing ref, or document id) · **timestamp** (captured/observed) · **confidence** (see §5) · **tags** (free or controlled vocabulary) · **notes** (analyst) · **review** **status** (e.g. draft / reviewed / released-for-internal / blocked).

| Model | Definition |
|-------|------------|
| **OppositionEntity** | A **thing** in the world: person, committee, org, **office** (seat), or **jurisdiction** slice — **as used** in **intel** (may **mirror** public ids later). |
| **OppositionRelationship** | A **directed** or **undirected** **link** (e.g. *treasurer of*, *donated to*, *vendor for*) with **strength** and **confidence** — **inference-allowed** with **marking**. |
| **OppositionEvent** | A **dated** **public** **or** **reported** **occurrence** (rally, filing deadline, debate). |
| **OppositionMessage** | A **message** **instance**: **ad** line, **headline** **quote**, **email** **subject** from **public** **archive** — **not** **a** **send** from **this** **product**. |
| **OppositionFinancialRecord** | A **row-level** **public** **money** fact (receipt, disbursement) **keyed** to **filings** — **feeds** **Finance** **mapping** **later**; **not** a **substitute** for **compliance** **ledger**. |
| **SourceDocument** | **Blob** + **metadata** + **hash** (optional) + **retrieval** **context**. |
| **IntelligenceNote** | **Narrative** **memo**; **links** to **entities** / **findings**; **never** **sole** **proof** of **a** **fact**. |
| **IntelligenceFinding** | A **single** **asserted** **statement** **with** **sources** **and** **confidence** — **the** **atomic** **unit** for **review** and **audit** **trails**. |

---

## 7. Integration map (dependencies — no implementation here)

| Division / rail | Integration |
|-----------------|-------------|
| **Finance** | **Donor** / **PAC** **mapping** **later**; **opposition** **money** **facts** **must** **match** **filing** **ids** **when** **claimed** **as** **verified**. |
| **Comms** | **Message** **awareness** **and** **internal** **briefs**; **no** **auto-response** or **auto-send** from **this** **engine**. |
| **Workbench** | **Future** **dashboards** and **triage** **of** **open** **intel** **reviews**; **advisory** **bands** only until **governance** **locks**. |
| **GOTV** | **Contextual** **awareness** **only** (e.g. **what** **themes** **exist** in **public** **space**); **no** **voter** **scoring** or **opposition**-based **targeting** **logic** **here**. |
| **Volunteer** | **Optional** **future** **talking** **points** **with** **mandatory** **review** **before** **distribution**. |
| **Data / Ingest** | **Broad** **automation** of **bulk** **opposition** **source** **ingest** **queues** **after** **election** **ingest** **gate** (see [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md)); **INTEL-1** **manual** **entry** is **outside** that **automation** **queue**. |
| **Truth / Brain** | **Opposition** **intel** **does** **not** **override** **deterministic** **truth** **classes**; **may** **inform** **recommendation** **eligibility** **only** where **product** **explicitly** **ties** them. |

---

## 8. Comprehensive Competitor Intelligence Requirements

The engine must support **lawful**, **public**, **source-backed** tracking ( **no** illegal scraping, **no** private surveillance data, **no** publishing claims without **human** **review** ). Below: **domain** requirements for a **full** **public-record** **competitor** **intelligence** **system** — **not** a commitment to build all at once.

### 8.1 Candidate / officeholder profile

- Biography **as stated** in **public** records or **official** sites  
- Offices held ( **public** **election** / **appointment** **records** )  
- Committee assignments ( **legislature** / **official** **directories** )  
- **Public** statements ( **cited** URLs, dates, context )  
- **Public-record** timeline ( filings, votes, releases — each **sourced** )

### 8.2 Campaign finance

- Donors, PACs, industries ( **from** **disclosed** **filings** **only** )  
- Geography of money ( **reported** **addresses** / **jurisdictions** **as** **filed** )  
- Filing dates, amendments, trends over time  
- **Relationship** **graph** **between** donors, PACs, employers, and organizations — **inference** **allowed** **only** with **confidence** + **review** ( **no** **fabricated** **links** )

### 8.3 Legislative record

- Every bill **authored** / **sponsored** / **co-sponsored** ( **official** **index** )  
- Bill status, topic tags ( **controlled** or **analyst** tags **labeled** )  
- Committee path, **public** **hearing** references where applicable  
- Vote outcomes ( **linked** to **official** **vote** **records** )  
- **Flag** **categories** for **analyst** **work**: direct democracy; election administration; county finance / governance; finance / taxation / budget — **always** **bill**-**level** **facts** **from** **primary** **sources**

### 8.4 Key votes

- Votes **selected** for **accountability** **framing** ( **analyst** **curated** )  
- Vote date, bill number, policy area, affected groups ( **described** **from** **public** **material** **only** )  
- **Public** explanation ( **official** **statement** or **on-the-record** **quote** — **cited** )  
- **Mandatory** **source** **citation** per vote row

### 8.5 Public video archive

- State Senate / House / SOS / **official** **legislative** **video** **hosts**  
- Bill presentations, committee testimony, floor speeches  
- Direct democracy bill introductions ( **where** **captured** **publicly** )  
- Transcript status ( **official** / **third-party** / **none** — **labeled** )  
- Clip timestamps and **canonical** **source** **URLs**

### 8.6 News monitoring

- **Public** **news** **mentions** — **every** **stored** **item** has **source**, **date**, **topic**, **geography**  
- **Sentiment** tag ( **analyst** / **model** — **not** **voter** **mind**-**reading** )  
- **Claim** **verification** **status** ( **pending** / **verified** / **disputed** ) before reuse in **external** **materials**

### 8.7 Geographic sentiment

- County- and region-level **aggregates** **where** **sources** **support** **geographic** **coding**  
- Issue-level sentiment ( **public** **polling** or **consistent** **press** **pattern** — **still** **sourced** )  
- **Confidence** score; **never** infer **private** **voter** **beliefs** **without** **explicit** **data**

### 8.8 Election history and voter behavior analysis

- County-level **primary** / **general** **results** ( **public** **results** **files** )  
- Turnout collapse, **three**-**way** primary comparison, runoff / low-turnout analysis  
- Vote dropoff by county, historical patterns **by** **county**  
- Precinct-level analysis **only** **where** **public** **data** **exists** — **no** **synthetic** **precinct** **claims**

### 8.9 Direct democracy accountability file

- All bills affecting ballot initiatives, petitions, referenda  
- Sponsor role, **stated** rationale ( **quoted** **or** **linked** ), **practical** **effect** **as** **documented**  
- **Public** testimony references, vote record, video **if** **publicly** **available**

### 8.10 County and finance record

- County-impact legislation, county funding positions **as** **disclosed**  
- Fiscal notes ( **official** **where** **published** )  
- County association positions **if** **public**  
- **Local** **news** **response** — **cited** **articles** **only**

---

## 9. Source rules (INTEL-OPS-2 — allowed sources and claim hygiene)

### 9.1 Allowed sources (collection)

- **Arkansas Secretary of State** **public** **records** (elections, business, **disclosed** **filings** **as** **applicable**)  
- **Arkansas Legislature** bill / vote / calendar **public** **endpoints**  
- **Official** committee / chamber **videos** and **indexes**  
- **Campaign** **finance** **reports** ( **state** / **FEC** **as** **applicable** )  
- **FEC** / **state** **filings** **reachable** **without** **privileged** **access**  
- **Public** **news**  
- **Public** **campaign** **websites**  
- **Public** **social** **media** ( **respect** **platform** **ToS** and **rate** **limits**; **no** **illegal** **scraping** )  
- **Public** **county** **election** **results**  
- **User-provided** **documents** the campaign **lawfully** **holds** ( **still** **full** **provenance** )

### 9.2 Required for every claim (storage / review contract)

- **Source** URL **or** file reference  
- **Date** accessed / retrieved  
- **Confidence** level (see §5)  
- **Fact** vs **inference** vs **recommendation** — **explicitly** **separated**  
- **Review** **status** (draft / reviewed / blocked / cleared-for-internal, etc.)

---

## 10. Future data model — conceptual tables (INTEL-3 = persisted subset)

**Conceptual** names below informed **INTEL-3** Prisma models (`OppositionEntity`, `OppositionSource`, bill/vote/finance/message/video/news/election-pattern/accountability rows). **INTEL-3** does **not** add AI conclusion fields, voter-level fields, or automated ingest — see migration `prisma/migrations/20260424180000_intel3_opposition_intelligence_schema` and `src/lib/campaign-engine/opposition-intelligence.ts`.

| Conceptual table | Role |
|------------------|------|
| **OppositionEntity** | Person, committee, org, or **normalized** **public** **identifier** anchor. |
| **OppositionOffice** | Seat / jurisdiction / term **as** **disclosed** **publicly**. |
| **OppositionFinanceRecord** | Row-level **money** **fact** from a **cited** **filing**. |
| **OppositionDonor** | **Disclosed** contributor entity; **links** to filings. |
| **OppositionPAC** | **Disclosed** committee / PAC **profile**. |
| **OppositionBillRecord** | Bill metadata + status path + tags. |
| **OppositionVoteRecord** | Roll-call or outcome row **with** **bill** **link**. |
| **OppositionVideoRecord** | **Official** **or** **licensed** **public** **video** **segment** **metadata**. |
| **OppositionNewsMention** | Article / story reference + verification state. |
| **OppositionSentimentObservation** | **Aggregate** or **analyst** sentiment **with** **geography** / **issue** **scope** and **confidence**. |
| **OppositionElectionResult** | **Public** **results** **slice** ( **may** **align** with `ElectionResult*` **or** **reference** **externally** ). |
| **OppositionCountyPattern** | Derived **county**-**level** **pattern** **statistics** — **labeled** **inference** **where** **not** **raw** **fact**. |
| **OppositionAccountabilityItem** | Curated **key** **vote** / **action** / **finance** **thread** for **review** **queues**. |
| **OppositionSource** | Canonical **bibliography** row: URL, hash, retrieval time, **trust** **tier**. |

These complement **§6** definitions (e.g. **OppositionEntity**); **INTEL-3** implements the core anchor + record tables aligned to **INTEL-2** row shapes; optional merges (e.g. donor/PAC split) remain future steering.

---

## 11. Build roadmap (future packets — not commitments)

| Phase | ID | Description |
|-------|----|-------------|
| **1** | **INTEL-1** | **Manual** **entry** + **source-backed** **notes** + **citations**; **no** **required** **schema** **beyond** what **compliance** **needs** for **storing** **links** **safely** |
| **2** | **INTEL-2** | **Competitor** **source** **manifest** — **implemented** ( [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) ): **typed** **tables** (legislative, votes, finance, statements, news, video, **election/geography**, **direct** **democracy** ), **local** **file** **scan** **appendix**, **rules** for **provenance**; **no** **DB** **ingest** **in** **this** **packet** |
| **3** | **INTEL-3** | **Implemented** — Prisma schema + migration + safe library helpers + read-only **`/admin/intelligence`**; **bill** / **vote** / **finance** / **message** / **video** / **news** / **election** **pattern** / **accountability** rows + **`OppositionSource`**; **no** scraping / **no** auto-approve / **no** AI conclusions |
| **3+** | **INTEL-4A** | **Implemented** — **Manual** **JSON** **bundle** + **`npm run ingest:opposition-intel`** (`--dry-run` or transactional import); `data/intelligence/README.md` + template; full **create-*** helper coverage in **`opposition-intelligence.ts`**; **no** scraping / **no** bulk unvetted web ingest / **no** auto-approval — **source-backed** **operator** **files** **only** |
| **4** | **INTEL-4B** | **Next** **ingest** **expansion** — first **governed** **public**-**source** **import** / **parser** **pipelines** ( **CLIs** / **connectors** ) from **public** **sources** and **approved** **drops** into **INTEL-3** **tables** ( **not** **bulk** **RAG** **as** **fact** ) |
| **5** | **INTEL-5** | **Analysis** **and** **dashboard** **layer** — **rollups**, **comparisons**, **county** / **turnout** **slices** ( **aggregates** **only**; **no** **voter**-**level** **inference** ), **optional** **video** / **transcript** **indexing** **as** a **sub-epic** **inside** **governed** **pipelines** |
| **6+** | **INTEL-6+** | **Persistence** **views**, **network** **maps**, **AI-assisted** **summaries** **with** **mandatory** **human** **review**, **internal** **dashboards** — **after** **INTEL-3**–**INTEL-5** **discipline** **exists** |

**Ordering relative to other rails:** **INTEL-1** may **proceed** **without** **waiting** on **bulk** **ingest** **automation**. **INTEL-2** is **in** **the** **repo** **as** **docs**. **INTEL-3** **schema** / **helpers** / **admin** **read** **surface** **shipped**; **INTEL-4A** **manual** **JSON** **CLI** **shipped**; **INTEL-4B**–**INTEL-5** **follow** **steering**. **Broad** **batch** **ingest** **per** **§6.4** / **§6.5** still **assumes** **election** **ingest** **COMPLETE** (or **explicit** **waiver**) per **Election** **Ingest** **Gate**. **No** **AI-generated** **factual** **claims** **without** **stored** **source** **citations**.

---

## 12. Gating and approvals (summary)

- **Election Ingest Gate** (see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)) **applies** to **broad** **ingest** **automation** and **queue**-**scale** **brain** **folder** **processing** — **not** to **a** **human** **typing** a **cited** **note** in **INTEL-1**.  
- **No** **external** **publishing** or **electioneering** **action** that **cites** **this** **system** **without** **approval** **workflow** (comms + compliance **as** **appropriate**).  
- **INTEL-OPS-1** **blueprint** is **the** **contract**; **schema** and **code** **come** in **INTEL-1+** **packets** **by** **build** **steering**.

---

*INTEL-OPS-1 / **INTEL-OPS-2** — Opposition / **competitor** **intelligence** blueprint. **Runtime:** **INTEL-3** adds DB + helpers + read-only admin; **INTEL-4A** adds manual JSON ingest CLI — **no** **scraping**; this file remains the policy / domain contract.*
