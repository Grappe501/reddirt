# Opposition Intelligence Engine (INTEL-OPS-1)

**Packet:** **INTEL-OPS-1** — Blueprint + protocol for **Campaign Intelligence** (opposition research), **docs only** (no app code in this packet).  
**Stack:** `RedDirt/` — future implementation will live under **Campaign Intelligence / Reporting** and related lanes.  
**Cross-ref:** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md) · [`PROJECT_MASTER_MAP.md`](./PROJECT_MASTER_MAP.md) · [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) · [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) · [`AUTO_BUILD_PROTOCOL.md`](./AUTO_BUILD_PROTOCOL.md)

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

## 6. Conceptual models (definitions only — no schema in INTEL-OPS-1)

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

## 8. Build roadmap (future packets — not commitments)

| Phase | ID | Description |
|-------|----|-------------|
| **1** | **INTEL-1** | **Manual** **entry** + **source-backed** **notes** + **citations**; **no** **required** **schema** **beyond** what **compliance** **needs** for **storing** **links** **safely** |
| **2** | **INTEL-2** | **Entity** and **relationship** **persistence** (Prisma or equivalent) with **provenance** **fields** |
| **3** | **INTEL-3** | **Network** **map** **views** (read-mostly) |
| **4** | **INTEL-4** | **Timeline** / **activity** **tracker** |
| **5** | **INTEL-5** | **AI-assisted** **summaries** with **mandatory** **human** **review** **queue** |
| **6** | **INTEL-6** | **Decision** **support** **dashboards** (internal) |

**Ordering relative to other rails:** **INTEL-1** may **proceed** as **ops**-**driven** **docs** + **light** **tooling** **without** **waiting** on **ingest** **automation**; **INTEL-2+** should **plan** for **ingest** **and** **election** **gate** **alignment** where **bulky** **files** are **involved**.

---

## 9. Gating and approvals (summary)

- **Election Ingest Gate** (see [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)) **applies** to **broad** **ingest** **automation** and **queue**-**scale** **brain** **folder** **processing** — **not** to **a** **human** **typing** a **cited** **note** in **INTEL-1**.  
- **No** **external** **publishing** or **electioneering** **action** that **cites** **this** **system** **without** **approval** **workflow** (comms + compliance **as** **appropriate**).  
- **INTEL-OPS-1** **blueprint** is **the** **contract**; **schema** and **code** **come** in **INTEL-1+** **packets** **by** **build** **steering**.

---

*INTEL-OPS-1 — Opposition Intelligence Engine blueprint. **Docs only**; no runtime behavior added by this file.*
